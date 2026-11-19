import os
import time
import logging
import joblib
import numpy as np
import pandas as pd
from typing import List, Dict, Any, Tuple, Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from app.core.config import settings
from app.ml.preprocessing.text_cleaner import build_product_feature_text

logger = logging.getLogger("recolab.ml.content_based")


class ContentBasedRecommender:
    def __init__(
        self,
        dataset_id: str,
        max_features: int = 5000,
        ngram_range: Tuple[int, int] = (1, 2),
        min_df: int = 1,
        max_df: float = 0.95
    ):
        self.dataset_id = dataset_id
        self.max_features = max_features
        self.ngram_range = tuple(ngram_range)
        self.min_df = min_df
        self.max_df = max_df
        self.vectorizer: Optional[TfidfVectorizer] = None
        self.tfidf_matrix = None
        self.products_df: Optional[pd.DataFrame] = None
        self.product_id_to_idx: Dict[str, int] = {}
        self.idx_to_product_id: Dict[int, str] = {}
        self.model_path = os.path.join(settings.MODEL_STORAGE_DIRECTORY, f"cb_{dataset_id}.joblib")

    def fit(self, products: List[Dict[str, Any]]) -> "ContentBasedRecommender":
        start_time = time.time()
        if not products:
            raise ValueError("No products provided for fitting ContentBasedRecommender.")

        df = pd.DataFrame(products)
        df["feature_text"] = df.apply(build_product_feature_text, axis=1)

        self.vectorizer = TfidfVectorizer(
            max_features=self.max_features,
            ngram_range=self.ngram_range,
            min_df=self.min_df,
            max_df=self.max_df,
            stop_words="english"
        )
        self.tfidf_matrix = self.vectorizer.fit_transform(df["feature_text"])
        self.products_df = df

        self.product_id_to_idx = {str(pid): idx for idx, pid in enumerate(df["product_id"])}
        self.idx_to_product_id = {idx: str(pid) for idx, pid in enumerate(df["product_id"])}

        # Persist model artifact
        self.save()
        logger.info(f"Fitted ContentBasedRecommender for dataset {self.dataset_id} in {time.time() - start_time:.3f}s")
        return self

    def save(self):
        try:
            artifact = {
                "dataset_id": self.dataset_id,
                "vectorizer": self.vectorizer,
                "tfidf_matrix": self.tfidf_matrix,
                "product_id_to_idx": self.product_id_to_idx,
                "idx_to_product_id": self.idx_to_product_id,
                "products_df": self.products_df
            }
            joblib.dump(artifact, self.model_path)
        except Exception as e:
            logger.warning(f"Could not save model artifact: {e}")

    def load(self) -> bool:
        if os.path.exists(self.model_path):
            try:
                artifact = joblib.load(self.model_path)
                self.vectorizer = artifact["vectorizer"]
                self.tfidf_matrix = artifact["tfidf_matrix"]
                self.product_id_to_idx = artifact["product_id_to_idx"]
                self.idx_to_product_id = artifact["idx_to_product_id"]
                self.products_df = artifact["products_df"]
                return True
            except Exception as e:
                logger.warning(f"Failed to load cached model: {e}")
        return False

    def recommend(
        self,
        product_id: str,
        top_k: int = 10,
        similarity_threshold: float = 0.05
    ) -> List[Dict[str, Any]]:
        pid_str = str(product_id)
        if pid_str not in self.product_id_to_idx:
            raise KeyError(f"Product '{product_id}' not found in dataset {self.dataset_id}")

        query_idx = self.product_id_to_idx[pid_str]
        query_vec = self.tfidf_matrix[query_idx]

        # Cosine similarity against all products
        sim_scores = cosine_similarity(query_vec, self.tfidf_matrix).flatten()

        # Sort descending
        ranked_indices = np.argsort(sim_scores)[::-1]

        results = []
        rank = 1
        query_row = self.products_df.iloc[query_idx]
        feature_names = np.array(self.vectorizer.get_feature_names_out())

        for idx in ranked_indices:
            if idx == query_idx:
                continue  # Skip source product itself

            score = float(sim_scores[idx])
            if score < similarity_threshold:
                continue

            target_row = self.products_df.iloc[idx]
            
            # Find top matching terms
            prod_vec = self.tfidf_matrix[idx]
            overlap = query_vec.multiply(prod_vec).toarray().flatten()
            top_term_indices = np.argsort(overlap)[::-1][:4]
            top_terms = [feature_names[i] for i in top_term_indices if overlap[i] > 0]

            shared_category = bool(str(query_row.get("category", "")).lower() == str(target_row.get("category", "")).lower())
            shared_brand = bool(str(query_row.get("brand", "")).lower() == str(target_row.get("brand", "")).lower())

            # Formulate structured explanation
            explanation_parts = []
            if shared_category:
                explanation_parts.append(f"Shares category '{target_row.get('category')}'")
            if shared_brand:
                explanation_parts.append(f"Same brand '{target_row.get('brand')}'")
            if top_terms:
                explanation_parts.append(f"Matching features: {', '.join(top_terms[:3])}")
            
            if not explanation_parts:
                explanation_parts.append("High contextual semantic profile similarity")

            confidence = "High" if score >= 0.4 else ("Medium" if score >= 0.2 else "Low")

            results.append({
                "rank": rank,
                "product_id": str(target_row["product_id"]),
                "product_name": str(target_row.get("product_name", "")),
                "category": str(target_row.get("category", "Uncategorized")),
                "brand": str(target_row.get("brand", "Unknown")),
                "price": float(target_row.get("price", 0.0)),
                "image_url": target_row.get("image_url"),
                "rating": float(target_row.get("rating", 0.0) or 0.0),
                "similarity_score": round(score, 4),
                "content_score": round(score, 4),
                "interaction_score": None,
                "explanation": {
                    "summary": "; ".join(explanation_parts),
                    "content_match_score": round(score, 4),
                    "interaction_match_score": None,
                    "shared_category": shared_category,
                    "shared_brand": shared_brand,
                    "top_matching_terms": top_terms,
                    "co_occurrence_count": 0,
                    "confidence_tier": confidence
                }
            })

            rank += 1
            if len(results) >= top_k:
                break

        return results

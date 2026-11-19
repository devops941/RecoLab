import os
import time
import logging
import joblib
import numpy as np
import pandas as pd
from typing import List, Dict, Any, Optional
from scipy.sparse import csr_matrix
from sklearn.metrics.pairwise import cosine_similarity
from app.core.config import settings

logger = logging.getLogger("recolab.ml.item_item")

DEFAULT_WEIGHTS = {
    "view": 1.0,
    "click": 1.5,
    "add_to_cart": 3.0,
    "wishlist": 2.5,
    "purchase": 5.0,
    "rating": 4.0
}


class ItemItemRecommender:
    def __init__(
        self,
        dataset_id: str,
        weights: Optional[Dict[str, float]] = None
    ):
        self.dataset_id = dataset_id
        self.weights = weights or DEFAULT_WEIGHTS
        self.item_sim_matrix = None
        self.co_occurrence_matrix = None
        self.product_id_to_idx: Dict[str, int] = {}
        self.idx_to_product_id: Dict[int, str] = {}
        self.products_df: Optional[pd.DataFrame] = None
        self.model_path = os.path.join(settings.MODEL_STORAGE_DIRECTORY, f"ii_{dataset_id}.joblib")

    def fit(self, interactions: List[Dict[str, Any]], products: List[Dict[str, Any]]) -> "ItemItemRecommender":
        start_time = time.time()
        if not interactions:
            raise ValueError("No customer interactions provided to fit ItemItemRecommender.")

        df_inter = pd.DataFrame(interactions)
        self.products_df = pd.DataFrame(products) if products else pd.DataFrame()

        # Map interaction types to numerical weights
        def calculate_weight(row):
            base_w = self.weights.get(str(row.get("interaction_type", "")).lower(), 1.0)
            if row.get("rating") is not None and not pd.isna(row.get("rating")):
                try:
                    return base_w * (float(row.get("rating")) / 5.0)
                except Exception:
                    pass
            if row.get("quantity") is not None and not pd.isna(row.get("quantity")):
                try:
                    qty = max(1, int(row.get("quantity")))
                    return base_w * (1 + 0.1 * (qty - 1))
                except Exception:
                    pass
            return base_w

        df_inter["weight"] = df_inter.apply(calculate_weight, axis=1)

        # Aggregate repeated customer-product interactions
        aggregated = df_inter.groupby(["customer_id", "product_id"])["weight"].sum().reset_index()

        customers = aggregated["customer_id"].unique()
        products_in_inter = aggregated["product_id"].unique()

        # Include products from catalog even if no interactions yet (isolated items)
        if not self.products_df.empty:
            all_products = list(dict.fromkeys(list(products_in_inter) + list(self.products_df["product_id"].astype(str))))
        else:
            all_products = list(products_in_inter)

        customer_to_idx = {str(cid): idx for idx, cid in enumerate(customers)}
        self.product_id_to_idx = {str(pid): idx for idx, pid in enumerate(all_products)}
        self.idx_to_product_id = {idx: str(pid) for idx, pid in enumerate(all_products)}

        # Build Sparse User-Item Matrix
        rows = [customer_to_idx[str(cid)] for cid in aggregated["customer_id"]]
        cols = [self.product_id_to_idx[str(pid)] for pid in aggregated["product_id"]]
        vals = aggregated["weight"].astype(float).values

        user_item_matrix = csr_matrix(
            (vals, (rows, cols)),
            shape=(len(customers), len(all_products)),
            dtype=np.float32
        )

        # Item-User Matrix (transpose) -> Item-Item similarity
        item_user_matrix = user_item_matrix.T.tocsr()
        self.item_sim_matrix = cosine_similarity(item_user_matrix, dense_output=False)

        # Item co-occurrence count (binary overlap)
        binary_item_user = (item_user_matrix > 0).astype(int)
        self.co_occurrence_matrix = (binary_item_user @ binary_item_user.T).tocsr()

        self.save()
        logger.info(f"Fitted ItemItemRecommender for {len(all_products)} products in {time.time() - start_time:.3f}s")
        return self

    def save(self):
        try:
            artifact = {
                "dataset_id": self.dataset_id,
                "item_sim_matrix": self.item_sim_matrix,
                "co_occurrence_matrix": self.co_occurrence_matrix,
                "product_id_to_idx": self.product_id_to_idx,
                "idx_to_product_id": self.idx_to_product_id,
                "products_df": self.products_df,
                "weights": self.weights
            }
            joblib.dump(artifact, self.model_path)
        except Exception as e:
            logger.warning(f"Could not save item-item model: {e}")

    def load(self) -> bool:
        if os.path.exists(self.model_path):
            try:
                artifact = joblib.load(self.model_path)
                self.item_sim_matrix = artifact["item_sim_matrix"]
                self.co_occurrence_matrix = artifact["co_occurrence_matrix"]
                self.product_id_to_idx = artifact["product_id_to_idx"]
                self.idx_to_product_id = artifact["idx_to_product_id"]
                self.products_df = artifact["products_df"]
                self.weights = artifact.get("weights", DEFAULT_WEIGHTS)
                return True
            except Exception as e:
                logger.warning(f"Failed to load cached item-item model: {e}")
        return False

    def recommend(
        self,
        product_id: str,
        top_k: int = 10,
        similarity_threshold: float = 0.01
    ) -> List[Dict[str, Any]]:
        pid_str = str(product_id)
        if pid_str not in self.product_id_to_idx:
            raise KeyError(f"Product '{product_id}' not found in interaction index.")

        query_idx = self.product_id_to_idx[pid_str]
        sim_row = self.item_sim_matrix[query_idx].toarray().flatten()
        co_occ_row = self.co_occurrence_matrix[query_idx].toarray().flatten()

        ranked_indices = np.argsort(sim_row)[::-1]

        # Product lookup map
        prod_meta_map = {}
        if self.products_df is not None and not self.products_df.empty:
            for _, r in self.products_df.iterrows():
                prod_meta_map[str(r["product_id"])] = r.to_dict()

        query_meta = prod_meta_map.get(pid_str, {})
        results = []
        rank = 1

        for idx in ranked_indices:
            if idx == query_idx:
                continue

            score = float(sim_row[idx])
            if score < similarity_threshold:
                continue

            target_pid = self.idx_to_product_id[idx]
            target_meta = prod_meta_map.get(target_pid, {})
            co_count = int(co_occ_row[idx])

            shared_cat = bool(
                query_meta.get("category") and
                target_meta.get("category") and
                str(query_meta.get("category")).lower() == str(target_meta.get("category")).lower()
            )
            shared_brand = bool(
                query_meta.get("brand") and
                target_meta.get("brand") and
                str(query_meta.get("brand")).lower() == str(target_meta.get("brand")).lower()
            )

            # High fidelity interaction reason
            reasons = []
            if co_count > 0:
                reasons.append(f"Purchased/viewed together by {co_count} common customers")
            if shared_cat:
                reasons.append(f"Complementary item in '{target_meta.get('category')}'")
            if not reasons:
                reasons.append("High behavioral co-interaction pattern similarity")

            confidence = "High" if score >= 0.35 else ("Medium" if score >= 0.15 else "Low")

            results.append({
                "rank": rank,
                "product_id": target_pid,
                "product_name": str(target_meta.get("product_name", f"Product {target_pid}")),
                "category": str(target_meta.get("category", "General")),
                "brand": str(target_meta.get("brand", "Generic")),
                "price": float(target_meta.get("price", 0.0)),
                "image_url": target_meta.get("image_url"),
                "rating": float(target_meta.get("rating", 0.0) or 0.0),
                "similarity_score": round(score, 4),
                "content_score": None,
                "interaction_score": round(score, 4),
                "explanation": {
                    "summary": "; ".join(reasons),
                    "content_match_score": None,
                    "interaction_match_score": round(score, 4),
                    "shared_category": shared_cat,
                    "shared_brand": shared_brand,
                    "top_matching_terms": [],
                    "co_occurrence_count": co_count,
                    "confidence_tier": confidence
                }
            })

            rank += 1
            if len(results) >= top_k:
                break

        return results

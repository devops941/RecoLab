import time
import math
import numpy as np
import pandas as pd
from typing import List, Dict, Any, Tuple, Set
from collections import defaultdict
from app.ml.content_based.tf_idf_engine import ContentBasedRecommender
from app.ml.item_item.collaborative_engine import ItemItemRecommender
from app.ml.hybrid.hybrid_engine import HybridRecommender


def train_test_split_interactions(
    interactions: List[Dict[str, Any]],
    test_ratio: float = 0.2,
    strategy: str = "user_holdout"
) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """
    Splits interaction data avoiding data leakage.
    'user_holdout': For each customer with >= 3 interactions, holds out last 20% of interactions as test ground truth.
    'temporal': Sorts by interaction_date and takes the latest test_ratio fraction.
    """
    df = pd.DataFrame(interactions)
    if df.empty:
        return [], []

    if strategy == "temporal" and "interaction_date" in df.columns:
        df["interaction_date"] = pd.to_datetime(df["interaction_date"])
        df = df.sort_values("interaction_date")
        split_idx = int(len(df) * (1 - test_ratio))
        train_df = df.iloc[:split_idx]
        test_df = df.iloc[split_idx:]
        return train_df.to_dict(orient="records"), test_df.to_dict(orient="records")

    # Default: user_holdout
    train_records = []
    test_records = []

    for _, group in df.groupby("customer_id"):
        n = len(group)
        if n >= 3:
            n_test = max(1, int(n * test_ratio))
            test_records.extend(group.iloc[-n_test:].to_dict(orient="records"))
            train_records.extend(group.iloc[:-n_test].to_dict(orient="records"))
        else:
            train_records.extend(group.to_dict(orient="records"))

    return train_records, test_records


class AlgorithmBenchmarker:
    def __init__(
        self,
        products: List[Dict[str, Any]],
        train_interactions: List[Dict[str, Any]],
        test_interactions: List[Dict[str, Any]],
        top_k: int = 10,
        content_weight: float = 0.5,
        interaction_weight: float = 0.5
    ):
        self.products = products
        self.train_interactions = train_interactions
        self.test_interactions = test_interactions
        self.top_k = top_k
        self.content_weight = content_weight
        self.interaction_weight = interaction_weight
        
        self.total_catalog_items = len(self.products)
        self.prod_to_cat = {str(p["product_id"]): str(p.get("category", "General")) for p in self.products}
        
        # Build ground truth map: customer_id -> Set of relevant product_ids in test set
        self.test_ground_truth: Dict[str, Set[str]] = defaultdict(set)
        for inter in self.test_interactions:
            # Positive signal: view, click, cart, purchase, rating >= 3
            self.test_ground_truth[str(inter["customer_id"])].add(str(inter["product_id"]))

        # Build train user history map: customer_id -> List of train product_ids
        self.train_user_history: Dict[str, List[str]] = defaultdict(list)
        for inter in self.train_interactions:
            self.train_user_history[str(inter["customer_id"])].append(str(inter["product_id"]))

        # Product item frequency for Novelty calculation
        inter_counts = defaultdict(int)
        for inter in self.train_interactions:
            inter_counts[str(inter["product_id"])] += 1
        self.total_inter_count = max(1, len(self.train_interactions))
        self.item_popularity = {
            pid: count / self.total_inter_count for pid, count in inter_counts.items()
        }

    def compute_metrics_for_recommendations(
        self,
        user_recommendations: Dict[str, List[str]],
        build_time_ms: float,
        exec_time_ms: float
    ) -> Dict[str, float]:
        """
        Calculates Precision@K, Recall@K, F1@K, MAP@K, NDCG@K,
        Catalog Coverage, User Coverage, Diversity, Novelty.
        """
        precisions = []
        recalls = []
        maps = []
        ndcgs = []
        all_recommended_items = set()
        covered_users = 0
        novelty_scores = []
        diversity_scores = []

        for user_id, ground_truth in self.test_ground_truth.items():
            if not ground_truth:
                continue

            recs = user_recommendations.get(user_id, [])[:self.top_k]
            if not recs:
                precisions.append(0.0)
                recalls.append(0.0)
                maps.append(0.0)
                ndcgs.append(0.0)
                continue

            covered_users += 1
            all_recommended_items.update(recs)

            # Hits
            hits = 0
            ap = 0.0
            dcg = 0.0
            idcg = sum(1.0 / math.log2(i + 2) for i in range(min(len(ground_truth), self.top_k))) or 1.0

            for rank, item_id in enumerate(recs):
                if item_id in ground_truth:
                    hits += 1
                    ap += hits / (rank + 1)
                    dcg += 1.0 / math.log2(rank + 2)

                # Novelty: -log2(P(item))
                p_item = self.item_popularity.get(item_id, 1.0 / (self.total_inter_count * 10))
                novelty_scores.append(-math.log2(max(1e-6, p_item)))

            precision = hits / self.top_k
            recall = hits / len(ground_truth)
            ndcg = dcg / idcg
            avg_precision = ap / min(len(ground_truth), self.top_k) if hits > 0 else 0.0

            precisions.append(precision)
            recalls.append(recall)
            maps.append(avg_precision)
            ndcgs.append(ndcg)

            # Intra-list diversity: fraction of unique categories in rec list
            rec_categories = [self.prod_to_cat.get(item_id, "General") for item_id in recs]
            div = len(set(rec_categories)) / len(rec_categories) if rec_categories else 0.0
            diversity_scores.append(div)

        mean_precision = float(np.mean(precisions)) if precisions else 0.0
        mean_recall = float(np.mean(recalls)) if recalls else 0.0
        f1 = (2 * mean_precision * mean_recall) / (mean_precision + mean_recall) if (mean_precision + mean_recall) > 0 else 0.0
        mean_map = float(np.mean(maps)) if maps else 0.0
        mean_ndcg = float(np.mean(ndcgs)) if ndcgs else 0.0

        catalog_coverage = len(all_recommended_items) / max(1, self.total_catalog_items)
        user_coverage = covered_users / max(1, len(self.test_ground_truth))
        avg_diversity = float(np.mean(diversity_scores)) if diversity_scores else 0.0
        avg_novelty = float(np.mean(novelty_scores)) if novelty_scores else 0.0

        return {
            "precision_at_k": round(mean_precision, 4),
            "recall_at_k": round(mean_recall, 4),
            "f1_at_k": round(f1, 4),
            "map_at_k": round(mean_map, 4),
            "ndcg_at_k": round(mean_ndcg, 4),
            "coverage": round(user_coverage, 4),
            "catalog_coverage": round(catalog_coverage, 4),
            "diversity": round(avg_diversity, 4),
            "novelty": round(avg_novelty, 4),
            "execution_time_ms": round(exec_time_ms, 2),
            "model_build_time_ms": round(build_time_ms, 2)
        }

    def run_benchmark(self, algorithms: List[str] = ["content_based", "item_item", "hybrid"]) -> Dict[str, Any]:
        results = []

        # 1. Train Content-Based Recommender
        t0 = time.time()
        cb = ContentBasedRecommender(dataset_id="benchmark")
        cb.fit(self.products)
        cb_build_time = (time.time() - t0) * 1000

        # 2. Train Item-Item Collaborative Recommender
        t0 = time.time()
        ii = ItemItemRecommender(dataset_id="benchmark")
        ii.fit(self.train_interactions, self.products)
        ii_build_time = (time.time() - t0) * 1000

        # 3. Hybrid Recommender
        hybrid = HybridRecommender(
            content_recommender=cb,
            item_recommender=ii,
            content_weight=self.content_weight,
            interaction_weight=self.interaction_weight
        )

        models = {
            "content_based": {
                "display": "Content-Based Filtering",
                "model": cb,
                "build_time": cb_build_time,
                "strengths": ["Zero cold-start for new items", "Explainable attribute similarity", "No user co-interaction prerequisite"],
                "tradeoffs": ["Lower discovery serendipity", "Bounded by text metadata quality"]
            },
            "item_item": {
                "display": "Item-Item Collaborative Filtering",
                "model": ii,
                "build_time": ii_build_time,
                "strengths": ["Discovers implicit behavioral relationships", "High accuracy on frequent interaction items", "Cross-category affinity"],
                "tradeoffs": ["Cold-start limitation on new items", "Sparsity sensitivity"]
            },
            "hybrid": {
                "display": f"Hybrid Strategy ({int(self.content_weight*100)}% Content / {int(self.interaction_weight*100)}% Interaction)",
                "model": hybrid,
                "build_time": cb_build_time + ii_build_time,
                "strengths": ["Balanced accuracy and catalog coverage", "Mitigates cold-start via content fallback", "Higher NDCG across sparse and dense items"],
                "tradeoffs": ["Slightly higher computation footprint during batch inference"]
            }
        }

        # Evaluate selected algorithms
        for algo_key in algorithms:
            if algo_key not in models:
                continue
            meta = models[algo_key]
            model = meta["model"]

            # Generate top-k recommendations for evaluated test users based on their latest seed item
            t_exec = time.time()
            user_recs: Dict[str, List[str]] = {}

            for user_id, train_items in self.train_user_history.items():
                if user_id not in self.test_ground_truth:
                    continue
                # Use user's last interacted product as query seed
                seed_item = train_items[-1] if train_items else None
                if not seed_item:
                    continue
                try:
                    recs = model.recommend(product_id=seed_item, top_k=self.top_k, similarity_threshold=0.0)
                    user_recs[user_id] = [r["product_id"] for r in recs]
                except Exception:
                    user_recs[user_id] = []

            exec_time_ms = (time.time() - t_exec) * 1000

            metrics = self.compute_metrics_for_recommendations(
                user_recommendations=user_recs,
                build_time_ms=meta["build_time"],
                exec_time_ms=exec_time_ms
            )

            results.append({
                "algorithm_name": algo_key,
                "display_name": meta["display"],
                "metrics": metrics,
                "parameters": {
                    "top_k": self.top_k,
                    "content_weight": self.content_weight if algo_key == "hybrid" else None,
                    "interaction_weight": self.interaction_weight if algo_key == "hybrid" else None
                },
                "strengths": meta["strengths"],
                "tradeoffs": meta["tradeoffs"]
            })

        # Identify best by metric
        best_by_metric = {}
        target_metrics = ["ndcg_at_k", "precision_at_k", "recall_at_k", "f1_at_k", "catalog_coverage", "diversity"]
        for m in target_metrics:
            best_algo = max(results, key=lambda x: x["metrics"][m])["display_name"]
            best_by_metric[m] = best_algo

        # Best overall (based on composite NDCG + F1 + Catalog Coverage)
        best_overall = max(
            results,
            key=lambda x: (
                x["metrics"]["ndcg_at_k"] * 0.4 +
                x["metrics"]["f1_at_k"] * 0.3 +
                x["metrics"]["catalog_coverage"] * 0.3
            )
        )["display_name"]

        return {
            "results": results,
            "best_algorithm_overall": best_overall,
            "best_by_metric": best_by_metric,
            "total_evaluated_users": len(self.test_ground_truth),
            "total_test_interactions": len(self.test_interactions)
        }

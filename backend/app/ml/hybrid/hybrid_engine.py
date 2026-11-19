import logging
from typing import List, Dict, Any, Optional

logger = logging.getLogger("recolab.ml.hybrid")


class HybridRecommender:
    def __init__(
        self,
        content_recommender,
        item_recommender,
        content_weight: float = 0.5,
        interaction_weight: float = 0.5
    ):
        self.content_recommender = content_recommender
        self.item_recommender = item_recommender
        
        # Normalize weights so they sum to 1.0
        total_w = (content_weight + interaction_weight) or 1.0
        self.content_weight = content_weight / total_w
        self.interaction_weight = interaction_weight / total_w

    def recommend(
        self,
        product_id: str,
        top_k: int = 10,
        similarity_threshold: float = 0.05
    ) -> List[Dict[str, Any]]:
        # Fetch larger pool from each recommender for hybrid merging
        cb_recs = []
        ii_recs = []

        try:
            cb_recs = self.content_recommender.recommend(
                product_id=product_id,
                top_k=top_k * 3,
                similarity_threshold=0.0
            )
        except Exception as e:
            logger.warning(f"Content-based retrieval in hybrid failed: {e}")

        try:
            ii_recs = self.item_recommender.recommend(
                product_id=product_id,
                top_k=top_k * 3,
                similarity_threshold=0.0
            )
        except Exception as e:
            logger.warning(f"Item-Item retrieval in hybrid failed: {e}")

        # Map by product_id
        cb_map = {item["product_id"]: item for item in cb_recs}
        ii_map = {item["product_id"]: item for item in ii_recs}

        all_candidate_ids = set(cb_map.keys()).union(set(ii_map.keys()))

        merged = []
        for pid in all_candidate_ids:
            cb_item = cb_map.get(pid)
            ii_item = ii_map.get(pid)

            # Metadata fallback
            sample_item = cb_item or ii_item
            cb_score = cb_item["similarity_score"] if cb_item else 0.0
            ii_score = ii_item["similarity_score"] if ii_item else 0.0

            hybrid_score = (cb_score * self.content_weight) + (ii_score * self.interaction_weight)

            if hybrid_score < similarity_threshold:
                continue

            # Synthesize explanations
            cb_terms = cb_item["explanation"]["top_matching_terms"] if cb_item else []
            co_count = ii_item["explanation"]["co_occurrence_count"] if ii_item else 0
            shared_cat = (cb_item["explanation"]["shared_category"] if cb_item else False) or (ii_item["explanation"]["shared_category"] if ii_item else False)
            shared_brand = (cb_item["explanation"]["shared_brand"] if cb_item else False) or (ii_item["explanation"]["shared_brand"] if ii_item else False)

            reasons = []
            if cb_score > 0.15 and cb_terms:
                reasons.append(f"Content affinity ({', '.join(cb_terms[:2])})")
            if ii_score > 0.15 and co_count > 0:
                reasons.append(f"Behavioral affinity ({co_count} co-interactions)")
            if not reasons:
                if shared_cat:
                    reasons.append(f"Same category '{sample_item.get('category')}'")
                else:
                    reasons.append("Balanced blend of content and customer interaction patterns")

            confidence = "High" if hybrid_score >= 0.35 else ("Medium" if hybrid_score >= 0.18 else "Low")

            merged.append({
                "product_id": pid,
                "product_name": sample_item.get("product_name"),
                "category": sample_item.get("category"),
                "brand": sample_item.get("brand"),
                "price": sample_item.get("price"),
                "image_url": sample_item.get("image_url"),
                "rating": sample_item.get("rating"),
                "similarity_score": round(hybrid_score, 4),
                "content_score": round(cb_score, 4),
                "interaction_score": round(ii_score, 4),
                "explanation": {
                    "summary": "; ".join(reasons),
                    "content_match_score": round(cb_score, 4),
                    "interaction_match_score": round(ii_score, 4),
                    "shared_category": shared_cat,
                    "shared_brand": shared_brand,
                    "top_matching_terms": cb_terms,
                    "co_occurrence_count": co_count,
                    "confidence_tier": confidence
                }
            })

        # Sort descending by hybrid_score
        merged.sort(key=lambda x: x["similarity_score"], reverse=True)

        # Assign ranks
        results = []
        for i, item in enumerate(merged[:top_k]):
            item["rank"] = i + 1
            results.append(item)

        return results

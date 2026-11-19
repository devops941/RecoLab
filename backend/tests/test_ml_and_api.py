import pytest
import numpy as np
from app.ml.preprocessing.text_cleaner import clean_text, build_product_feature_text
from app.ml.content_based.tf_idf_engine import ContentBasedRecommender
from app.ml.item_item.collaborative_engine import ItemItemRecommender
from app.ml.hybrid.hybrid_engine import HybridRecommender
from app.ml.evaluation.evaluator import AlgorithmBenchmarker, train_test_split_interactions
from app.services.validation_service import DataValidationService


def test_text_cleaner():
    raw = "<b>Sony WH-1000XM5</b> Wireless & Bluetooth Headphones!"
    cleaned = clean_text(raw)
    assert "sony" in cleaned
    assert "headphones" in cleaned
    assert "<b>" not in cleaned


def test_product_validation():
    sample_records = [
        {"product_id": "P1", "product_name": "Test Item 1", "category": "Tech", "brand": "BrandA", "price": 99.0, "description": "Good item"},
        {"product_id": "", "product_name": "Invalid Item", "category": "Tech", "brand": "BrandA", "price": "invalid", "description": "Bad item"},
        {"product_id": "P1", "product_name": "Duplicate Item", "category": "Tech", "brand": "BrandA", "price": 49.0, "description": "Duplicate item"}
    ]
    valid, rejected, summary = DataValidationService.validate_product_records(sample_records)
    assert len(valid) == 1
    assert len(rejected) == 2
    assert summary.duplicate_records == 1
    assert summary.total_records == 3


def test_content_based_recommender():
    sample_prods = [
        {"product_id": "P101", "product_name": "Sony Wireless Headphones", "category": "Audio", "brand": "Sony", "description": "Noise cancelling audio headphones", "price": 300},
        {"product_id": "P102", "product_name": "Bose Noise Cancelling Headphones", "category": "Audio", "brand": "Bose", "description": "Acoustic high fidelity headphones", "price": 320},
        {"product_id": "P301", "product_name": "Espresso Machine", "category": "Kitchen", "brand": "Breville", "description": "Coffee maker with steam wand", "price": 600}
    ]
    cb = ContentBasedRecommender(dataset_id="test_cb")
    cb.fit(sample_prods)
    recs = cb.recommend(product_id="P101", top_k=2, similarity_threshold=0.0)
    assert len(recs) > 0
    # The most similar to Sony headphones should be Bose headphones, not the espresso machine!
    assert recs[0]["product_id"] == "P102"
    assert recs[0]["similarity_score"] > 0.1


def test_item_item_recommender():
    sample_prods = [
        {"product_id": "P1", "product_name": "Phone", "category": "Tech", "brand": "Apple", "price": 1000},
        {"product_id": "P2", "product_name": "Case", "category": "Accessories", "brand": "Spigen", "price": 20},
        {"product_id": "P3", "product_name": "Toaster", "category": "Home", "brand": "Generic", "price": 30}
    ]
    # Customers frequently co-purchase P1 and P2
    interactions = [
        {"customer_id": "U1", "product_id": "P1", "interaction_type": "purchase"},
        {"customer_id": "U1", "product_id": "P2", "interaction_type": "purchase"},
        {"customer_id": "U2", "product_id": "P1", "interaction_type": "purchase"},
        {"customer_id": "U2", "product_id": "P2", "interaction_type": "add_to_cart"},
        {"customer_id": "U3", "product_id": "P3", "interaction_type": "purchase"}
    ]
    ii = ItemItemRecommender(dataset_id="test_ii")
    ii.fit(interactions, sample_prods)
    recs = ii.recommend(product_id="P1", top_k=2, similarity_threshold=0.0)
    assert len(recs) > 0
    assert recs[0]["product_id"] == "P2"


def test_hybrid_recommender():
    sample_prods = [
        {"product_id": "P1", "product_name": "Running Shoes", "category": "Footwear", "brand": "Nike", "description": "Breathable shoes", "price": 120},
        {"product_id": "P2", "product_name": "Trail Shoes", "category": "Footwear", "brand": "Adidas", "description": "Tough trail running shoes", "price": 130},
        {"product_id": "P3", "product_name": "Water Bottle", "category": "Fitness", "brand": "Hydro", "description": "Stainless water flask", "price": 25}
    ]
    interactions = [
        {"customer_id": "U1", "product_id": "P1", "interaction_type": "purchase"},
        {"customer_id": "U1", "product_id": "P3", "interaction_type": "purchase"}
    ]
    cb = ContentBasedRecommender(dataset_id="test_hybrid_cb")
    cb.fit(sample_prods)
    ii = ItemItemRecommender(dataset_id="test_hybrid_ii")
    ii.fit(interactions, sample_prods)

    hybrid = HybridRecommender(cb, ii, content_weight=0.5, interaction_weight=0.5)
    recs = hybrid.recommend(product_id="P1", top_k=2, similarity_threshold=0.0)
    assert len(recs) > 0
    assert "content_score" in recs[0]
    assert "interaction_score" in recs[0]


def test_benchmarker_metrics():
    sample_prods = [
        {"product_id": "P1", "category": "Tech"},
        {"product_id": "P2", "category": "Tech"},
        {"product_id": "P3", "category": "Tech"}
    ]
    train_inter = [
        {"customer_id": "U1", "product_id": "P1", "interaction_type": "view"},
        {"customer_id": "U1", "product_id": "P2", "interaction_type": "purchase"}
    ]
    test_inter = [
        {"customer_id": "U1", "product_id": "P2", "interaction_type": "purchase"}
    ]
    benchmarker = AlgorithmBenchmarker(
        products=sample_prods,
        train_interactions=train_inter,
        test_interactions=test_inter,
        top_k=2
    )
    # Mock user recommendation containing hit
    user_recs = {"U1": ["P2", "P3"]}
    metrics = benchmarker.compute_metrics_for_recommendations(user_recs, 10.0, 5.0)
    assert metrics["precision_at_k"] > 0
    assert metrics["ndcg_at_k"] > 0
    assert metrics["catalog_coverage"] > 0

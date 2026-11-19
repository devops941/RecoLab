import os
import random
from datetime import datetime, timedelta, timezone
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.core.security import get_password_hash
from app.core.config import settings

SAMPLE_PRODUCTS = [
    # Electronics - Audio
    {"product_id": "P101", "product_name": "Sony WH-1000XM5 Wireless Headphones", "category": "Electronics", "subcategory": "Audio", "brand": "Sony", "description": "Industry-leading noise cancelling wireless headphones with dual processor and 8 microphones for superior clarity and bass.", "price": 398.00, "rating": 4.8, "stock_status": "In Stock", "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500"},
    {"product_id": "P102", "product_name": "Bose QuietComfort 45 Bluetooth Headphones", "category": "Electronics", "subcategory": "Audio", "brand": "Bose", "description": "Iconic acoustic noise cancellation headphones with Aware Mode and high fidelity audio for all-day comfort.", "price": 329.00, "rating": 4.7, "stock_status": "In Stock", "image_url": "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500"},
    {"product_id": "P103", "product_name": "Apple AirPods Max Space Gray", "category": "Electronics", "subcategory": "Audio", "brand": "Apple", "description": "Apple-designed dynamic driver provides high-fidelity audio with active noise cancellation and spatial sound.", "price": 549.00, "rating": 4.6, "stock_status": "In Stock", "image_url": "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500"},
    {"product_id": "P104", "product_name": "Sennheiser Momentum 4 Wireless", "category": "Electronics", "subcategory": "Audio", "brand": "Sennheiser", "description": "Audiophile-inspired 42mm transducer system delivering brilliant dynamics, clarity, and musicality with 60-hour battery.", "price": 349.95, "rating": 4.5, "stock_status": "In Stock", "image_url": "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500"},
    {"product_id": "P105", "product_name": "JBL Flip 6 Portable Bluetooth Speaker", "category": "Electronics", "subcategory": "Audio", "brand": "JBL", "description": "Bold JBL Original Pro Sound with 2-way speaker system, racetrack-shaped woofer, and IP67 waterproof construction.", "price": 129.95, "rating": 4.6, "stock_status": "In Stock", "image_url": "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500"},

    # Electronics - Computing & Wearables
    {"product_id": "P106", "product_name": "Apple MacBook Pro 16-inch M3 Max", "category": "Electronics", "subcategory": "Computers", "brand": "Apple", "description": "Liquid Retina XDR display, up to 128GB unified memory, powerhouse performance for machine learning and pro workflows.", "price": 2499.00, "rating": 4.9, "stock_status": "In Stock", "image_url": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500"},
    {"product_id": "P107", "product_name": "Dell XPS 15 9530 Laptop", "category": "Electronics", "subcategory": "Computers", "brand": "Dell", "description": "13th Gen Intel Core i9, 3.5K OLED touchscreen, NVIDIA GeForce RTX 4070 graphics for creative creators.", "price": 2199.00, "rating": 4.5, "stock_status": "In Stock", "image_url": "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500"},
    {"product_id": "P108", "product_name": "Logitech MX Master 3S Wireless Mouse", "category": "Electronics", "subcategory": "Accessories", "brand": "Logitech", "description": "Quiet clicks and 8K DPI any-surface tracking with MagSpeed electromagnetic scrolling for ultimate precision.", "price": 99.99, "rating": 4.8, "stock_status": "In Stock", "image_url": "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500"},
    {"product_id": "P109", "product_name": "Apple Watch Ultra 2 Titanium", "category": "Electronics", "subcategory": "Wearables", "brand": "Apple", "description": "Rugged and capable smartwatch with precision dual-frequency GPS, 3000-nit display, and ocean diving certification.", "price": 799.00, "rating": 4.8, "stock_status": "In Stock", "image_url": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500"},
    {"product_id": "P110", "product_name": "Garmin Fenix 7 Pro Sapphire Solar", "category": "Electronics", "subcategory": "Wearables", "brand": "Garmin", "description": "Multisport GPS smartwatch with solar charging lens, built-in LED flashlight, and advanced endurance metrics.", "price": 899.99, "rating": 4.7, "stock_status": "In Stock", "image_url": "https://images.unsplash.com/photo-1544117519-31a4b719223d?w=500"},

    # Apparel & Footwear
    {"product_id": "P201", "product_name": "Nike Air Zoom Pegasus 40 Running Shoes", "category": "Apparel", "subcategory": "Footwear", "brand": "Nike", "description": "Responsive road running shoes featuring dual Zoom Air units and engineered mesh for neutral runners.", "price": 130.00, "rating": 4.6, "stock_status": "In Stock", "image_url": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500"},
    {"product_id": "P202", "product_name": "Adidas Ultraboost Light Running Shoes", "category": "Apparel", "subcategory": "Footwear", "brand": "Adidas", "description": "Experience epic energy with our lightest Ultraboost ever made, with 30% lighter Boost material and Primeknit upper.", "price": 190.00, "rating": 4.7, "stock_status": "In Stock", "image_url": "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=500"},
    {"product_id": "P203", "product_name": "Patagonia Nano Puff Insulated Jacket", "category": "Apparel", "subcategory": "Outerwear", "brand": "Patagonia", "description": "Warm, windproof, water-resistant insulated jacket using lightweight 60-g PrimaLoft Gold Insulation Eco.", "price": 239.00, "rating": 4.8, "stock_status": "In Stock", "image_url": "https://images.unsplash.com/photo-1544441893-675973e31985?w=500"},
    {"product_id": "P204", "product_name": "The North Face Thermoball Eco Triclimate", "category": "Apparel", "subcategory": "Outerwear", "brand": "The North Face", "description": "Versatile 3-in-1 waterproof, breathable DryVent jacket with removable synthetic insulation inner layer.", "price": 299.00, "rating": 4.5, "stock_status": "In Stock", "image_url": "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500"},
    {"product_id": "P205", "product_name": "Lululemon Align High-Rise Pant 25", "category": "Apparel", "subcategory": "Fitness Apparel", "brand": "Lululemon", "description": "Weightless, buttery-soft Nulu fabric yoga pants designed for yoga and low-impact workouts.", "price": 98.00, "rating": 4.7, "stock_status": "In Stock", "image_url": "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=500"},

    # Home & Kitchen
    {"product_id": "P301", "product_name": "Breville Barista Touch Espresso Machine", "category": "Home & Kitchen", "subcategory": "Appliances", "brand": "Breville", "description": "Automated touchscreen espresso maker with integrated precision conical burr grinder and thermoJet heating.", "price": 999.95, "rating": 4.7, "stock_status": "In Stock", "image_url": "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500"},
    {"product_id": "P302", "product_name": "De'Longhi Magnifica S Automatic Espresso", "category": "Home & Kitchen", "subcategory": "Appliances", "brand": "De'Longhi", "description": "Compact bean-to-cup machine with manual cappuccino frother system and dual aroma control dial.", "price": 649.95, "rating": 4.5, "stock_status": "In Stock", "image_url": "https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=500"},
    {"product_id": "P303", "product_name": "Ninja Foodi 10-in-1 Smart XL Air Fryer", "category": "Home & Kitchen", "subcategory": "Cookware", "brand": "Ninja", "description": "DualZone technology allows cooking 2 foods 2 ways that finish at the same time with smart thermometer.", "price": 229.99, "rating": 4.8, "stock_status": "In Stock", "image_url": "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=500"},
    {"product_id": "P304", "product_name": "Dyson V15 Detect Cordless Vacuum", "category": "Home & Kitchen", "subcategory": "Cleaning", "brand": "Dyson", "description": "Intelligent cordless vacuum engineered with laser illumination revealing invisible dust on hard floors.", "price": 749.99, "rating": 4.6, "stock_status": "In Stock", "image_url": "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=500"},

    # Books & Learning
    {"product_id": "P401", "product_name": "Designing Machine Learning Systems", "category": "Books", "subcategory": "Data Science", "brand": "O'Reilly", "description": "An iterative process for production-ready applications by Chip Huyen covering real-time ML architecture.", "price": 49.99, "rating": 4.9, "stock_status": "In Stock", "image_url": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500"},
    {"product_id": "P402", "product_name": "Hands-On Recommendation Systems with Python", "category": "Books", "subcategory": "Data Science", "brand": "Packt", "description": "Master collaborative filtering, content-based algorithms, and matrix factorization using Python and Scikit-learn.", "price": 44.99, "rating": 4.7, "stock_status": "In Stock", "image_url": "https://images.unsplash.com/photo-1532012164546-f432f2e372fe?w=500"},
    {"product_id": "P403", "product_name": "Atomic Habits by James Clear", "category": "Books", "subcategory": "Self Improvement", "brand": "Penguin", "description": "An easy and proven way to build good habits and break bad ones with tiny changes and remarkable results.", "price": 18.00, "rating": 4.9, "stock_status": "In Stock", "image_url": "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500"}
]


async def seed_initial_data(db: AsyncIOMotorDatabase):
    """
    Seeds essential initial dataset, demo accounts, and sample data.
    """
    # 1. Seed Users
    admin = await db.users.find_one({"email": "admin@recolab.io"})
    if not admin:
        admin_doc = {
            "email": "admin@recolab.io",
            "full_name": "RecoLab Administrator",
            "hashed_password": get_password_hash("Admin@123456"),
            "role": "Super Admin",
            "is_active": True,
            "created_at": datetime.now(timezone.utc),
            "last_login": datetime.now(timezone.utc)
        }
        await db.users.insert_one(admin_doc)

    analyst = await db.users.find_one({"email": "analyst@recolab.io"})
    if not analyst:
        analyst_doc = {
            "email": "analyst@recolab.io",
            "full_name": "Sarah Miller (Data Scientist)",
            "hashed_password": get_password_hash("Analyst@123456"),
            "role": "Data Analyst",
            "is_active": True,
            "created_at": datetime.now(timezone.utc),
            "last_login": datetime.now(timezone.utc)
        }
        await db.users.insert_one(analyst_doc)

    # 2. Check if default products dataset exists
    ds_products = await db.datasets.find_one({"dataset_id": "ds_default_products"})
    if not ds_products:
        ds_products_doc = {
            "dataset_id": "ds_default_products",
            "name": "Global Retail Catalogue (2026)",
            "dataset_type": "products",
            "description": "Standard benchmark multi-category eCommerce catalogue featuring Electronics, Apparel, Home & Books.",
            "version": "1.0.0",
            "file_name": "sample_products_catalogue.csv",
            "file_path": os.path.join(settings.UPLOAD_DIRECTORY, "sample_products_catalogue.csv"),
            "file_size_bytes": 10240,
            "row_count": len(SAMPLE_PRODUCTS),
            "status": "valid",
            "validation_summary": {
                "total_records": len(SAMPLE_PRODUCTS),
                "valid_records": len(SAMPLE_PRODUCTS),
                "invalid_records": 0,
                "duplicate_records": 0,
                "missing_values": {},
                "data_quality_score": 100.0,
                "detected_columns": ["product_id", "product_name", "category", "brand", "price", "description"],
                "validation_messages": ["Production dataset verified with 100% schema compliance."]
            },
            "created_by": "system",
            "created_at": datetime.now(timezone.utc) - timedelta(days=30),
            "updated_at": datetime.now(timezone.utc)
        }
        await db.datasets.insert_one(ds_products_doc)

        # Insert products
        for p in SAMPLE_PRODUCTS:
            doc = dict(p)
            doc["dataset_id"] = "ds_default_products"
            doc["created_at"] = datetime.now(timezone.utc) - timedelta(days=25)
            await db.products.update_one(
                {"dataset_id": "ds_default_products", "product_id": p["product_id"]},
                {"$set": doc},
                upsert=True
            )

    # 3. Check if default customer interactions dataset exists
    ds_inter = await db.datasets.find_one({"dataset_id": "ds_default_interactions"})
    if not ds_inter:
        # Generate rich realistic customer interactions
        interactions_list = []
        customers = [f"CUST_{i:03d}" for i in range(1, 45)]
        interaction_types = ["view", "click", "add_to_cart", "purchase", "wishlist", "rating"]
        type_weights = [0.45, 0.25, 0.12, 0.08, 0.06, 0.04]

        # Natural affinity clusters
        audio_group = ["P101", "P102", "P103", "P104", "P105"]
        tech_group = ["P106", "P107", "P108", "P109", "P110"]
        apparel_group = ["P201", "P202", "P203", "P204", "P205"]
        kitchen_group = ["P301", "P302", "P303", "P304"]
        books_group = ["P401", "P402", "P403"]

        clusters = [audio_group, tech_group, apparel_group, kitchen_group, books_group]

        random.seed(42)
        base_date = datetime.now(timezone.utc) - timedelta(days=60)

        for cid in customers:
            # Pick primary interest cluster
            fav_cluster = random.choice(clusters)
            n_events = random.randint(6, 18)
            for _ in range(n_events):
                pid = random.choice(fav_cluster) if random.random() < 0.75 else random.choice(SAMPLE_PRODUCTS)["product_id"]
                itype = random.choices(interaction_types, weights=type_weights)[0]
                days_offset = random.randint(0, 60)
                event_date = base_date + timedelta(days=days_offset, hours=random.randint(0, 23))

                interactions_list.append({
                    "dataset_id": "ds_default_interactions",
                    "customer_id": cid,
                    "product_id": pid,
                    "interaction_type": itype,
                    "interaction_date": event_date,
                    "quantity": 1 if itype != "purchase" else random.randint(1, 2),
                    "rating": random.choice([4.0, 5.0, 4.5, 3.5]) if itype in ["rating", "purchase"] else None,
                    "created_at": event_date
                })

        ds_inter_doc = {
            "dataset_id": "ds_default_interactions",
            "name": "Omnichannel Customer Interactions (Q1)",
            "dataset_type": "interactions",
            "description": "500+ customer journeys including views, clicks, cart adds, purchases, and ratings.",
            "version": "1.0.0",
            "file_name": "sample_customer_interactions.csv",
            "file_path": os.path.join(settings.UPLOAD_DIRECTORY, "sample_customer_interactions.csv"),
            "file_size_bytes": 25600,
            "row_count": len(interactions_list),
            "status": "valid",
            "validation_summary": {
                "total_records": len(interactions_list),
                "valid_records": len(interactions_list),
                "invalid_records": 0,
                "duplicate_records": 0,
                "missing_values": {},
                "data_quality_score": 100.0,
                "detected_columns": ["customer_id", "product_id", "interaction_type", "interaction_date"],
                "validation_messages": ["Interaction temporal integrity and user linkages verified."]
            },
            "created_by": "system",
            "created_at": datetime.now(timezone.utc) - timedelta(days=28),
            "updated_at": datetime.now(timezone.utc)
        }
        await db.datasets.insert_one(ds_inter_doc)
        if interactions_list:
            await db.interactions.insert_many(interactions_list)

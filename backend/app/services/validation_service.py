import re
from typing import List, Dict, Any, Tuple
import pandas as pd
from app.schemas.dataset import ValidationSummary

VALID_INTERACTION_TYPES = {"view", "click", "add_to_cart", "purchase", "wishlist", "rating"}


class DataValidationService:
    @staticmethod
    def validate_product_records(records: List[Dict[str, Any]]) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]], ValidationSummary]:
        valid_records = []
        rejected_records = []
        seen_product_ids = set()
        missing_counts = {
            "product_id": 0,
            "product_name": 0,
            "category": 0,
            "brand": 0,
            "description": 0,
            "price": 0
        }
        duplicate_count = 0
        messages = []

        for idx, row in enumerate(records):
            errors = []
            pid = str(row.get("product_id", "")).strip()
            name = str(row.get("product_name", "")).strip()
            category = str(row.get("category", "")).strip()
            brand = str(row.get("brand", "")).strip()
            description = str(row.get("description", "")).strip()
            price_raw = row.get("price")

            # Validate Product ID
            if not pid or pid == "nan" or pid == "None":
                missing_counts["product_id"] += 1
                errors.append("Missing product_id")
            elif pid in seen_product_ids:
                duplicate_count += 1
                errors.append(f"Duplicate product_id: '{pid}'")
            else:
                seen_product_ids.add(pid)

            # Validate Product Name
            if not name or name == "nan":
                missing_counts["product_name"] += 1
                errors.append("Missing product_name")

            # Validate Category
            if not category or category == "nan":
                missing_counts["category"] += 1
                category = "General"

            # Validate Brand
            if not brand or brand == "nan":
                missing_counts["brand"] += 1
                brand = "Generic"

            # Validate Description
            if not description or description == "nan":
                missing_counts["description"] += 1
                description = name

            # Validate Price
            price = 0.0
            try:
                price = float(price_raw)
                if price < 0:
                    errors.append("Price cannot be negative")
            except (ValueError, TypeError):
                missing_counts["price"] += 1
                errors.append("Invalid or missing price format")

            if errors:
                rejected_copy = dict(row)
                rejected_copy["_validation_errors"] = errors
                rejected_copy["_row_index"] = idx + 1
                rejected_records.append(rejected_copy)
            else:
                clean_row = dict(row)
                clean_row["product_id"] = pid
                clean_row["product_name"] = name
                clean_row["category"] = category
                clean_row["brand"] = brand
                clean_row["description"] = description
                clean_row["price"] = price
                # Ensure rating is float
                try:
                    clean_row["rating"] = float(row.get("rating", 0.0) or 0.0)
                except Exception:
                    clean_row["rating"] = 0.0
                valid_records.append(clean_row)

        total = len(records)
        valid = len(valid_records)
        invalid = len(rejected_records)
        quality_score = round((valid / max(1, total)) * 100, 2)

        if duplicate_count > 0:
            messages.append(f"Found {duplicate_count} duplicate product ID(s).")
        if invalid > 0:
            messages.append(f"Found {invalid} records with data anomalies.")
        if valid == total:
            messages.append("All product records passed validation with 100% data integrity.")

        summary = ValidationSummary(
            total_records=total,
            valid_records=valid,
            invalid_records=invalid,
            duplicate_records=duplicate_count,
            missing_values=missing_counts,
            data_quality_score=quality_score,
            detected_columns=list(records[0].keys()) if records else [],
            rejected_sample=rejected_records[:10],
            validation_messages=messages
        )
        return valid_records, rejected_records, summary

    @staticmethod
    def validate_interaction_records(
        records: List[Dict[str, Any]],
        known_product_ids: set = None
    ) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]], ValidationSummary]:
        valid_records = []
        rejected_records = []
        seen_interactions = set()
        missing_counts = {
            "customer_id": 0,
            "product_id": 0,
            "interaction_type": 0,
            "interaction_date": 0
        }
        duplicate_count = 0
        orphan_count = 0
        messages = []

        for idx, row in enumerate(records):
            errors = []
            cid = str(row.get("customer_id", "")).strip()
            pid = str(row.get("product_id", "")).strip()
            itype = str(row.get("interaction_type", "")).strip().lower()
            idate_raw = row.get("interaction_date")

            # Validate Customer ID
            if not cid or cid == "nan" or cid == "None":
                missing_counts["customer_id"] += 1
                errors.append("Missing customer_id")

            # Validate Product ID
            if not pid or pid == "nan" or pid == "None":
                missing_counts["product_id"] += 1
                errors.append("Missing product_id")
            elif known_product_ids and pid not in known_product_ids:
                orphan_count += 1
                # Mark as orphan reference note

            # Validate Interaction Type
            if not itype or itype == "nan":
                missing_counts["interaction_type"] += 1
                errors.append("Missing interaction_type")
            elif itype not in VALID_INTERACTION_TYPES:
                # Normalize common synonyms
                synonyms = {"buy": "purchase", "purchased": "purchase", "cart": "add_to_cart", "browse": "view"}
                if itype in synonyms:
                    itype = synonyms[itype]
                else:
                    errors.append(f"Invalid interaction_type '{itype}'. Allowed: {', '.join(VALID_INTERACTION_TYPES)}")

            # Validate Date
            idate = None
            if not idate_raw or str(idate_raw).strip() in ["nan", "None", ""]:
                missing_counts["interaction_date"] += 1
                errors.append("Missing interaction_date")
            else:
                try:
                    idate = pd.to_datetime(idate_raw).to_pydatetime()
                except Exception:
                    errors.append(f"Invalid date format: '{idate_raw}'")

            # Deduplication key
            dedup_key = (cid, pid, itype, str(idate))
            if dedup_key in seen_interactions:
                duplicate_count += 1
                errors.append("Duplicate interaction event")
            else:
                seen_interactions.add(dedup_key)

            if errors:
                rejected_copy = dict(row)
                rejected_copy["_validation_errors"] = errors
                rejected_copy["_row_index"] = idx + 1
                rejected_records.append(rejected_copy)
            else:
                clean_row = dict(row)
                clean_row["customer_id"] = cid
                clean_row["product_id"] = pid
                clean_row["interaction_type"] = itype
                clean_row["interaction_date"] = idate
                try:
                    clean_row["quantity"] = int(row.get("quantity", 1) or 1)
                except Exception:
                    clean_row["quantity"] = 1
                try:
                    clean_row["rating"] = float(row.get("rating", 0.0)) if row.get("rating") is not None else None
                except Exception:
                    clean_row["rating"] = None
                valid_records.append(clean_row)

        total = len(records)
        valid = len(valid_records)
        invalid = len(rejected_records)
        quality_score = round((valid / max(1, total)) * 100, 2)

        if orphan_count > 0:
            messages.append(f"Detected {orphan_count} interactions referencing external product IDs.")
        if duplicate_count > 0:
            messages.append(f"Detected {duplicate_count} duplicate interaction events.")
        if invalid > 0:
            messages.append(f"Detected {invalid} invalid rows needing data sanitization.")
        if valid == total:
            messages.append("All interaction records passed validation successfully.")

        summary = ValidationSummary(
            total_records=total,
            valid_records=valid,
            invalid_records=invalid,
            duplicate_records=duplicate_count,
            missing_values=missing_counts,
            data_quality_score=quality_score,
            detected_columns=list(records[0].keys()) if records else [],
            rejected_sample=rejected_records[:10],
            validation_messages=messages
        )
        return valid_records, rejected_records, summary

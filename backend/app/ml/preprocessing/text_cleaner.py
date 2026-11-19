import re
from typing import List, Dict, Any, Optional


def clean_text(text: Optional[str]) -> str:
    if not text or not isinstance(text, str):
        return ""
    # Lowercase
    text = text.lower()
    # Remove HTML tags if any
    text = re.sub(r'<.*?>', ' ', text)
    # Remove non-alphanumeric except basic spacing
    text = re.sub(r'[^a-zA-Z0-9\s\-]', ' ', text)
    # Collapse whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def build_product_feature_text(product: Dict[str, Any]) -> str:
    """
    Combines product metadata into an enriched textual representation
    for TF-IDF feature extraction.
    """
    parts = []
    
    # Product Name (repeated for higher term importance)
    name = clean_text(product.get("product_name", ""))
    if name:
        parts.extend([name, name])
    
    # Category and subcategory
    cat = clean_text(product.get("category", ""))
    if cat:
        parts.extend([cat, cat])
    subcat = clean_text(product.get("subcategory", ""))
    if subcat:
        parts.append(subcat)
    
    # Brand
    brand = clean_text(product.get("brand", ""))
    if brand:
        parts.append(brand)
    
    # Product tags
    tags = product.get("product_tags", [])
    if isinstance(tags, list):
        parts.extend([clean_text(str(t)) for t in tags if t])
    elif isinstance(tags, str):
        parts.append(clean_text(tags))
        
    # Features
    features = product.get("features", [])
    if isinstance(features, list):
        parts.extend([clean_text(str(f)) for f in features if f])
        
    # Color
    color = clean_text(product.get("color", ""))
    if color:
        parts.append(color)

    # Description
    desc = clean_text(product.get("description", ""))
    if desc:
        parts.append(desc)
        
    return " ".join([p for p in parts if p])

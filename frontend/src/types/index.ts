export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'Super Admin' | 'Admin' | 'Data Analyst' | 'Viewer';
  is_active: boolean;
  created_at: string;
  last_login?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface ValidationSummary {
  total_records: number;
  valid_records: number;
  invalid_records: number;
  duplicate_records: number;
  missing_values: Record<string, number>;
  data_quality_score: number;
  detected_columns: string[];
  rejected_sample: any[];
  validation_messages: string[];
}

export interface Dataset {
  id: string;
  dataset_id: string;
  name: string;
  dataset_type: 'products' | 'interactions';
  description?: string;
  version: string;
  file_name: string;
  file_size_bytes: number;
  row_count: number;
  status: string;
  validation_summary?: ValidationSummary;
  created_by: string;
  created_at: string;
}

export interface Product {
  id: string;
  dataset_id: string;
  product_id: string;
  product_name: string;
  category: string;
  subcategory?: string;
  brand: string;
  description: string;
  price: number;
  rating?: number;
  image_url?: string;
  stock_status?: string;
  interaction_count?: number;
  average_rating?: number;
}

export interface RecommendationExplanation {
  summary: string;
  content_match_score?: number;
  interaction_match_score?: number;
  shared_category: boolean;
  shared_brand: boolean;
  top_matching_terms: string[];
  co_occurrence_count?: number;
  confidence_tier: 'High' | 'Medium' | 'Low';
}

export interface RecommendedProduct {
  rank: number;
  product_id: string;
  product_name: string;
  category: string;
  brand: string;
  price: number;
  image_url?: string;
  rating?: number;
  similarity_score: number;
  content_score?: number;
  interaction_score?: number;
  explanation: RecommendationExplanation;
}

export interface RecommendationResponse {
  run_id: string;
  dataset_id: string;
  algorithm: string;
  source_product: Product;
  recommendations: RecommendedProduct[];
  total_recommendations: number;
  execution_time_ms: number;
  parameters: Record<string, any>;
  created_at: string;
}

export interface BenchmarkMetrics {
  precision_at_k: number;
  recall_at_k: number;
  f1_at_k: number;
  map_at_k: number;
  ndcg_at_k: number;
  coverage: number;
  catalog_coverage: number;
  diversity: number;
  novelty: number;
  execution_time_ms: number;
  model_build_time_ms: number;
}

export interface AlgorithmBenchmarkResult {
  algorithm_name: string;
  display_name: string;
  metrics: BenchmarkMetrics;
  parameters: Record<string, any>;
  strengths: string[];
  tradeoffs: string[];
}

export interface BenchmarkResponse {
  experiment_id: string;
  dataset_id: string;
  interaction_dataset_id: string;
  top_k: number;
  test_split_ratio: number;
  split_strategy: string;
  results: AlgorithmBenchmarkResult[];
  best_algorithm_overall: string;
  best_by_metric: Record<string, string>;
  total_evaluated_users: number;
  total_test_interactions: number;
  execution_duration_sec: number;
  created_at: string;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  secondary_value?: number;
  extra?: Record<string, any>;
}

export interface BusinessInsightItem {
  title: string;
  category: string;
  supporting_data: string;
  explanation: string;
  business_impact_hypothesis: string;
  suggested_action: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface DashboardData {
  kpis: {
    total_products: number;
    total_customers: number;
    total_interactions: number;
    total_purchases: number;
    average_product_price: number;
    total_categories: number;
    total_recommendations_generated: number;
    average_similarity_score: number;
    active_datasets: number;
    completed_experiments: number;
  };
  behaviour: {
    interaction_type_distribution: ChartDataPoint[];
    top_viewed_products: ChartDataPoint[];
    top_purchased_products: ChartDataPoint[];
    category_engagement: ChartDataPoint[];
    monthly_trends: ChartDataPoint[];
    conversion_rate_percent: number;
    cart_abandonment_estimate_percent: number;
  };
  price: {
    average_price: number;
    median_price: number;
    min_price: number;
    max_price: number;
    price_distribution_buckets: ChartDataPoint[];
    category_average_prices: ChartDataPoint[];
    brand_price_comparisons: ChartDataPoint[];
    price_vs_interaction_scatter: Array<{
      product_name: string;
      price: number;
      interactions: number;
      category: string;
    }>;
  };
  demand: {
    demand_ranking: ChartDataPoint[];
    category_demand: ChartDataPoint[];
    daily_demand_trends: ChartDataPoint[];
    weekly_demand_trends: ChartDataPoint[];
    high_demand_products: Array<{ name: string; units: number }>;
    low_demand_products: Array<{ name: string; units: number }>;
  };
  insights: BusinessInsightItem[];
  dataset_id?: string;
}

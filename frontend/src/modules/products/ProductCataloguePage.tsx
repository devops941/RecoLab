import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ProductsApi } from '../../services/api';
import { Product } from '../../types';
import {
  Search,
  ShoppingBag,
  Star,
  Sparkles,
  Crown,
  Tag,
  DollarSign,
  ArrowRight,
  SlidersHorizontal
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ProductCataloguePage: React.FC = () => {
  const { activeDataset } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await ProductsApi.list({
        dataset_id: activeDataset,
        search: search || undefined,
        category: selectedCategory || undefined,
        brand: selectedBrand || undefined,
        page,
        page_size: 16
      });
      setProducts(res.data.items);
      setTotal(res.data.total);
    } catch (e) {
      console.error('Failed to load products', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilters = async () => {
    try {
      const res = await ProductsApi.filters(activeDataset);
      setCategories(res.data.categories || []);
      setBrands(res.data.brands || []);
    } catch (e) {
      console.error('Failed to load filters', e);
    }
  };

  useEffect(() => {
    fetchFilters();
  }, [activeDataset]);

  useEffect(() => {
    fetchProducts();
  }, [activeDataset, search, selectedCategory, selectedBrand, page]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-full bg-blue-50 text-blue-600">
              <ShoppingBag className="w-5 h-5" />
            </span>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Product Catalogue
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Browse catalogue metadata, inspect multi-attribute feature text, and trigger similarity recommendations.
          </p>
        </div>
        <div className="text-xs text-blue-600 font-semibold bg-blue-50 border border-blue-100 px-3.5 py-1.5 rounded-full">
          {products.length} of {total} products displayed
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white/85 backdrop-blur-xl rounded-2xl p-4 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search products by title, ID, brand or specs..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50/80 border border-slate-200 rounded-full focus:outline-none focus:border-blue-500 text-slate-800 placeholder-slate-400 font-medium"
          />
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
            className="text-xs px-3.5 py-2 bg-slate-50/80 border border-slate-200 rounded-full focus:outline-none focus:border-blue-500 font-medium text-slate-700 cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={selectedBrand}
            onChange={(e) => {
              setSelectedBrand(e.target.value);
              setPage(1);
            }}
            className="text-xs px-3.5 py-2 bg-slate-50/80 border border-slate-200 rounded-full focus:outline-none focus:border-blue-500 font-medium text-slate-700 cursor-pointer"
          >
            <option value="">All Brands</option>
            {brands.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>

          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory('');
              setSelectedBrand('');
              setPage(1);
            }}
            className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 border border-slate-200 rounded-full hover:bg-slate-50 transition-all"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Product Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-72 bg-white/60 border border-slate-200/80 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white/80 rounded-2xl p-12 text-center border border-slate-200">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No items match your criteria</h3>
          <p className="text-xs text-slate-500 mt-1">Try clearing filters or broadening search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <div
              key={p.product_id}
              className="bg-white/85 backdrop-blur-xl rounded-2xl overflow-hidden border border-slate-200/80 hover:border-blue-400/50 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.06)] transition-all duration-300 flex flex-col justify-between group transform hover:-translate-y-1"
            >
              <div>
                <div className="h-44 w-full bg-slate-100 overflow-hidden relative">
                  <img
                    src={p.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'}
                    alt={p.product_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-slate-800 shadow-sm border border-slate-200/60">
                    {p.category}
                  </div>
                  <div className="absolute top-2.5 right-2.5 bg-slate-900/80 backdrop-blur-md text-white px-2 py-0.5 rounded-full text-[10px] font-mono">
                    {p.product_id}
                  </div>
                </div>

                <div className="p-4">
                  <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">{p.brand}</div>
                  <h3 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug mb-1.5 group-hover:text-blue-600 transition-colors" title={p.product_name}>
                    {p.product_name}
                  </h3>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-3 font-normal">
                    {p.description}
                  </p>
                </div>
              </div>

              <div className="px-4 pb-4 pt-2 border-t border-slate-100 flex items-center justify-between bg-slate-50/40">
                <div>
                  <span className="text-base font-black text-slate-900 font-mono">${Number(p.price).toFixed(2)}</span>
                  <div className="flex items-center text-[10px] text-amber-500 space-x-1 mt-0.5">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="font-semibold text-slate-600">{p.rating || 4.5}</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/recommendations/explorer?productId=${p.product_id}`)}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[11px] font-semibold rounded-full shadow-sm transition-all"
                  title="Generate Recommendations"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Similar</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

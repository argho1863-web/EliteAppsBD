'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { Search, SlidersHorizontal, X, PackageX } from 'lucide-react';

function ProductsContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(d => setCategories(Array.isArray(d) ? d : [])).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    setProducts([]);
    const params = new URLSearchParams();
    if (activeCategory !== 'all') params.set('category', activeCategory);
    if (search) params.set('search', search);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    fetch(`/api/products?${params}`, { signal: controller.signal })
      .then(r => r.json())
      .then(data => {
        clearTimeout(timeout);
        let sorted = [...(Array.isArray(data) ? data : [])];
        if (sortBy === 'price-asc') sorted.sort((a, b) => a.price - b.price);
        else if (sortBy === 'price-desc') sorted.sort((a, b) => b.price - a.price);
        else if (sortBy === 'rating') sorted.sort((a, b) => b.rating - a.rating);
        setProducts(sorted.map(p => ({ ...p, _id: p._id?.$oid || p._id })));
      })
      .catch(err => { clearTimeout(timeout); if (err.name !== 'AbortError') setProducts([]); })
      .finally(() => setLoading(false));
    return () => { clearTimeout(timeout); controller.abort(); };
  }, [activeCategory, search, sortBy]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="pt-24 pb-20 px-4 max-w-7xl mx-auto w-full flex-1">
        <div className="mb-10">
          <p className="text-xs text-brand-gold uppercase tracking-widest font-semibold mb-2">Explore</p>
          <h1 className="font-display font-black text-4xl sm:text-5xl">All Products</h1>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
            <input type="text" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="input-dark pl-10 h-12" />
            {search && <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"><X size={14} /></button>}
          </div>
          <div className="flex items-center gap-3 glass rounded-xl px-4 py-2 border border-white/5">
            <SlidersHorizontal size={14} className="text-brand-gold/60" />
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="bg-transparent border-none text-sm text-white/80 focus:ring-0 cursor-pointer min-w-32 outline-none">
              <option value="newest" className="bg-brand-navy">Newest First</option>
              <option value="price-asc" className="bg-brand-navy">Price: Low to High</option>
              <option value="price-desc" className="bg-brand-navy">Price: High to Low</option>
              <option value="rating" className="bg-brand-navy">Highest Rated</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2.5 flex-wrap mb-10">
          <button onClick={() => setActiveCategory('all')} className={`px-5 py-2 rounded-xl text-sm font-bold tracking-wide transition-all ${activeCategory === 'all' ? 'bg-brand-gold text-brand-navy shadow-gold' : 'glass border border-white/10 text-white/60 hover:text-white'}`}>All</button>
          {categories.map((cat: any) => {
            const catId = cat._id?.$oid || cat._id;
            return (
              <button key={catId} onClick={() => setActiveCategory(cat.slug)}
                className={`px-5 py-2 rounded-xl text-sm font-bold tracking-wide transition-all whitespace-nowrap ${activeCategory === cat.slug ? 'bg-brand-gold text-brand-navy shadow-gold' : 'glass border border-white/10 text-white/60 hover:text-white'}`}>
                {cat.icon} <span className="ml-1.5">{cat.name}</span>
              </button>
            );
          })}
        </div>

        <p className="text-sm text-white/30 mb-6">{loading ? 'Loading products...' : `${products.length} product${products.length !== 1 ? 's' : ''} found`}</p>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="rounded-2xl bg-brand-navy-3 border border-white/5 overflow-hidden animate-pulse">
                <div className="h-52 bg-brand-navy-4" />
                <div className="p-4 space-y-2"><div className="h-3 bg-brand-navy-4 rounded w-1/3" /><div className="h-4 bg-brand-navy-4 rounded w-3/4" /><div className="h-5 bg-brand-navy-4 rounded w-1/4" /></div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24 flex flex-col items-center gap-4">
            <PackageX size={48} className="text-white/20" />
            <h3 className="font-display font-bold text-xl text-white/40">No products found</h3>
            <p className="text-sm text-white/25">{search ? 'Try a different search term' : 'No products available yet. Check back soon!'}</p>
            {search && <button onClick={() => setSearch('')} className="btn-gold px-6 py-2 rounded-xl text-sm font-semibold mt-2">Clear Search</button>}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" /></div>}>
      <ProductsContent />
    </Suspense>
  );
}

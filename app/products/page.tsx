'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { stagger } from '@/components/motion';
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

  const chip = (active: boolean) =>
    `px-5 py-2.5 min-h-[44px] rounded-xl text-sm font-semibold whitespace-nowrap transition-[color,background-color,border-color,transform] duration-150 active:scale-[0.97] ${active ? 'bg-brand-gold text-brand-navy shadow-gold' : 'glass border border-white/10 text-white/70 hover:text-white'}`;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="pt-24 pb-20 px-4 max-w-7xl mx-auto w-full flex-1">
        <div className="mb-10 animate-fade-up">
          <h1 className="font-display font-semibold text-4xl sm:text-5xl">All Products</h1>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-10 animate-fade-up stagger-i" style={stagger(1)}>
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/55" aria-hidden />
            <input type="search" aria-label="Search products" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="input-dark pl-10 pr-12 h-12" />
            {search && <button onClick={() => setSearch('')} aria-label="Clear search" className="absolute right-1 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center text-white/55 hover:text-white"><X size={14} /></button>}
          </div>
          <div className="flex items-center gap-3 glass rounded-xl px-4 py-2 border border-white/5 min-h-[48px]">
            <SlidersHorizontal size={14} className="text-brand-gold/60" aria-hidden />
            <select aria-label="Sort products" value={sortBy} onChange={e => setSortBy(e.target.value)} className="bg-transparent border-none text-sm text-white/80 focus:ring-0 cursor-pointer min-w-32 outline-none">
              <option value="newest" className="bg-brand-navy">Newest First</option>
              <option value="price-asc" className="bg-brand-navy">Price: Low to High</option>
              <option value="price-desc" className="bg-brand-navy">Price: High to Low</option>
              <option value="rating" className="bg-brand-navy">Highest Rated</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2.5 flex-wrap mb-10 animate-fade-up stagger-i" style={stagger(2)} role="group" aria-label="Filter by category">
          <button onClick={() => setActiveCategory('all')} aria-pressed={activeCategory === 'all'} className={chip(activeCategory === 'all')}>All</button>
          {categories.map((cat: any) => {
            const catId = cat._id?.$oid || cat._id;
            return (
              <button key={catId} onClick={() => setActiveCategory(cat.slug)} aria-pressed={activeCategory === cat.slug}
                className={chip(activeCategory === cat.slug)}>
                {cat.icon} <span className="ml-1.5">{cat.name}</span>
              </button>
            );
          })}
        </div>

        <p className="text-sm text-white/55 mb-6" aria-live="polite">{loading ? 'Loading products...' : `${products.length} product${products.length !== 1 ? 's' : ''} found`}</p>

        {loading ? (
          // still placeholders (no looping pulse): they hold the grid's height until the data lands
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" aria-hidden>
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="skeleton overflow-hidden">
                <div className="h-48 md:h-56 bg-brand-navy-4" />
                <div className="p-4 space-y-2"><div className="h-3 bg-brand-navy-4 rounded w-1/3" /><div className="h-4 bg-brand-navy-4 rounded w-3/4" /><div className="h-5 bg-brand-navy-4 rounded w-1/4" /></div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24 flex flex-col items-center gap-4 animate-fade-up">
            <PackageX size={48} className="text-white/55" />
            <h3 className="font-display font-semibold text-xl text-white/55">No products found</h3>
            <p className="text-sm text-white/55">{search ? 'Try a different search term' : 'No products available yet. Check back soon!'}</p>
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

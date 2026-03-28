'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { Zap, ArrowRight, Shield, Truck, Star, MessageCircle } from 'lucide-react';

export default function HomePage() {
  const [featured, setFeatured] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [latest, setLatest] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/products?featured=true&limit=8').then(r => r.json()),
      fetch('/api/categories').then(r => r.json()),
      fetch('/api/products?limit=12').then(r => r.json()),
    ]).then(([f, c, l]) => {
      setFeatured(Array.isArray(f) ? f : []);
      setCategories(Array.isArray(c) ? c : []);
      setLatest(Array.isArray(l) ? l : []);
    }).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="orb w-[600px] h-[600px] bg-brand-electric/10 -top-32 -left-32" />
        <div className="orb w-[500px] h-[500px] bg-brand-gold/8 top-1/2 -right-48" />
        <div className="orb w-[300px] h-[300px] bg-brand-accent/8 bottom-20 left-1/4" />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto pt-24 md:pt-32">
          <div className="inline-flex items-center gap-2 glass-gold rounded-full px-4 py-2 mb-8 animate-fade-up shadow-xl shadow-brand-gold/10">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-gold animate-pulse" />
            <span className="text-[10px] md:text-xs font-bold text-brand-gold tracking-[0.2em] uppercase">Bangladesh's #1 Digital Store</span>
          </div>

          <h1 className="text-responsive-h1 mb-6 animate-fade-up stagger-1">
            <span className="text-white">Premium</span><br />
            <span className="text-gold-gradient">Digital Apps</span><br />
            <span className="text-white/40 text-2xl sm:text-4xl md:text-5xl lg:text-6xl">for Everyone</span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-white/50 max-w-xl mx-auto mb-10 leading-relaxed animate-fade-up stagger-2 px-4">
            Discover top-tier software, apps, and digital tools. Pay securely with bKash, Nagad, Rocket, or Upay.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up stagger-3 px-6">
            <Link href="/products" className="w-full sm:w-auto btn-gold px-8 py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 shadow-gold">
              Browse Products <ArrowRight size={18} />
            </Link>
            <a href="https://wa.me/8801707776676" target="_blank" rel="noopener noreferrer"
              className="w-full sm:w-auto flex items-center justify-center gap-2 glass px-6 py-4 rounded-xl text-sm text-white/70 hover:text-white border border-white/10 hover:border-white/20 transition-all">
              <MessageCircle size={16} className="text-green-400" /> WhatsApp Support
            </a>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-16 max-w-lg mx-auto animate-fade-up stagger-4 px-4">
            {[{ val: '500+', label: 'Products' }, { val: '10K+', label: 'Users' }, { val: '4.9★', label: 'Rating' }].map(s => (
              <div key={s.label} className="glass rounded-xl p-3 sm:p-4">
                <p className="text-lg sm:text-xl font-bold text-gold-gradient font-display">{s.val}</p>
                <p className="text-[10px] sm:text-xs text-white/40 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-float hidden sm:flex">
          <div className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center pt-1.5">
            <div className="w-1 h-2 rounded-full bg-brand-gold animate-bounce" />
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="section-padding max-w-7xl mx-auto w-full">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs text-brand-gold uppercase tracking-widest font-semibold mb-2">Browse by</p>
              <h2 className="text-responsive-h2">Categories</h2>
            </div>
            <Link href="/products" className="text-sm text-brand-gold hover:underline flex items-center gap-1 mb-1">View all <ArrowRight size={14} /></Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((cat: any) => (
              <Link key={cat._id?.$oid || cat._id} href={`/products?category=${cat.slug}`}
                className="group glass rounded-2xl p-5 hover:border-brand-gold/20 border border-white/5 transition-all hover:bg-brand-gold/5">
                <span className="text-3xl block mb-3">{cat.icon || '📦'}</span>
                <p className="font-semibold text-sm text-white/80 group-hover:text-brand-gold transition-colors">{cat.name}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="section-padding max-w-7xl mx-auto w-full">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs text-brand-gold uppercase tracking-widest font-semibold mb-2">Hand-picked</p>
              <h2 className="text-responsive-h2">Featured</h2>
            </div>
            <Link href="/products?featured=true" className="text-sm text-brand-gold hover:underline flex items-center gap-1 mb-1">See all <ArrowRight size={14} /></Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featured.map((p: any, i: number) => <ProductCard key={p._id?.$oid || p._id} product={{ ...p, _id: p._id?.$oid || p._id }} index={i} />)}
          </div>
        </section>
      )}

      {/* Latest Products */}
      {latest.length > 0 && (
        <section className="section-padding max-w-7xl mx-auto w-full">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs text-brand-gold uppercase tracking-widest font-semibold mb-2">Just in</p>
              <h2 className="text-responsive-h2">Latest</h2>
            </div>
            <Link href="/products" className="text-sm text-brand-gold hover:underline flex items-center gap-1 mb-1">All products <ArrowRight size={14} /></Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {latest.map((p: any, i: number) => <ProductCard key={p._id?.$oid || p._id} product={{ ...p, _id: p._id?.$oid || p._id }} index={i} />)}
          </div>
        </section>
      )}

      {/* Features */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <Shield className="text-brand-gold" size={24} />, title: 'Secure Payments', desc: 'Pay via bKash, Nagad, Rocket, or Upay. 100% secure transactions.' },
              { icon: <Truck className="text-brand-gold" size={24} />, title: '48hr Delivery', desc: 'Digital products delivered to your WhatsApp or email within 48 hours.' },
              { icon: <Star className="text-brand-gold" size={24} />, title: 'Premium Quality', desc: 'Carefully curated products with 4.9★ average customer rating.' },
            ].map((f, i) => (
              <div key={i} className="glass rounded-2xl p-6 border border-white/5 hover:border-brand-gold/10 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-brand-gold/10 flex items-center justify-center mb-4">{f.icon}</div>
                <h3 className="font-display font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding">
        <div className="max-w-2xl mx-auto text-center">
          <div className="glass-gold rounded-[2rem] p-8 md:p-14 border border-brand-gold/20 shadow-2xl shadow-brand-gold/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/10 blur-[80px] -translate-y-1/2 translate-x-1/2" />
            <Zap size={32} className="text-brand-gold mx-auto mb-6" />
            <h2 className="font-display font-black text-3xl md:text-4xl lg:text-5xl mb-4 text-white">Ready to get <span className="text-gold-gradient">started?</span></h2>
            <p className="text-white/40 mb-10 text-sm md:text-base">Join thousands of happy customers across Bangladesh</p>
            <Link href="/products" className="w-full sm:w-auto btn-gold px-12 py-4 rounded-xl font-bold text-base inline-flex items-center justify-center gap-2 shadow-gold-strong">
              Shop Now <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

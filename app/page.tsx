'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import Hero3D from '@/components/Hero3D';
import Tilt from '@/components/Tilt';
import Reveal from '@/components/Reveal';
import Parallax from '@/components/Parallax';
import { ArrowRight, Shield, Truck, Star, MessageCircle } from 'lucide-react';

const features = [
  { icon: Shield, title: 'Mobile wallet payments', desc: 'Pay with bKash, Nagad, Rocket or Upay.' },
  { icon: Truck, title: 'Delivery within 48 hours', desc: 'Your order is sent to your WhatsApp or email.' },
  { icon: Star, title: 'Hand-picked catalogue', desc: 'Every product is reviewed before it is listed.' },
];

/** Holds the height of a product grid while the catalogue loads, so nothing below jumps. */
function GridSkeleton() {
  return (
    <section className="section-padding max-w-7xl mx-auto w-full" aria-hidden>
      <div className="skeleton h-9 w-40 mb-10" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[0, 1, 2, 3].map(i => <div key={i} className="skeleton h-[22rem]" />)}
      </div>
    </section>
  );
}

export default function HomePage() {
  const [featured, setFeatured] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [latest, setLatest] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/products?featured=true&limit=8').then(r => r.json()),
      fetch('/api/categories').then(r => r.json()),
      fetch('/api/products?limit=12').then(r => r.json()),
    ]).then(([f, c, l]) => {
      setFeatured(Array.isArray(f) ? f : []);
      setCategories(Array.isArray(c) ? c : []);
      setLatest(Array.isArray(l) ? l : []);
    }).catch(() => {}).finally(() => setLoaded(true));
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden pt-28 md:pt-32 pb-10 lg:pb-0 lg:min-h-[100svh] flex items-center">
        {/* decorative ruled grid on its own slow layer; text never moves with the scroll */}
        <Parallax speed={0.06} className="absolute inset-0 pointer-events-none" >
          <div className="hero-grid" aria-hidden />
        </Parallax>

        <div className="max-w-7xl mx-auto w-full px-6 sm:px-12 lg:px-20 grid lg:grid-cols-[1.05fr_1fr] gap-4 lg:gap-8 items-center">
          <div className="relative z-10">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium leading-[1.05] tracking-[-0.03em] mb-6 animate-fade-up">
              Apps, subscriptions and top-ups, delivered within 48 hours
            </h1>
            <p className="text-base md:text-lg text-white/70 max-w-lg mb-10 leading-relaxed animate-fade-up stagger-1">
              Pay with bKash, Nagad, Rocket or Upay. We send your order to WhatsApp or email.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-up stagger-2">
              <Link href="/products" className="btn-gold px-8 py-4 rounded-xl text-base flex items-center justify-center gap-2">
                Browse products <ArrowRight size={18} />
              </Link>
              <a href="https://wa.me/8801707776676" target="_blank" rel="noopener noreferrer"
                className="btn-key px-6 py-4 rounded-xl text-sm flex items-center justify-center gap-2">
                <MessageCircle size={16} className="text-white/70" /> WhatsApp support
              </a>
            </div>
          </div>

          <Hero3D className="h-[340px] sm:h-[440px] lg:h-[620px] w-full" />
        </div>
      </section>

      {!loaded && <GridSkeleton />}

      {/* Categories */}
      {categories.length > 0 && (
        <Reveal className="section-padding max-w-7xl mx-auto w-full">
          <div className="flex items-end justify-between mb-10">
            <h2 className="text-responsive-h2">Categories</h2>
            <Link href="/products" className="text-sm text-white/70 hover:text-white flex items-center gap-1 mb-1 py-2 transition-colors">View all <ArrowRight size={14} /></Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((cat: any) => (
              <Tilt key={cat._id?.$oid || cat._id} max={9}>
                <Link href={`/products?category=${cat.slug}`}
                  className="group glass rounded-2xl p-5 block preserve-3d transition-colors hover:bg-brand-navy-4">
                  <span className="text-3xl block mb-3 lift-2">{cat.icon || '📦'}</span>
                  <p className="font-medium text-sm text-white/90 lift-1">{cat.name}</p>
                </Link>
              </Tilt>
            ))}
          </div>
        </Reveal>
      )}

      {/* Featured Products */}
      {featured.length > 0 && (
        <Reveal className="section-padding max-w-7xl mx-auto w-full">
          <div className="flex items-end justify-between mb-10">
            <h2 className="text-responsive-h2">Featured</h2>
            <Link href="/products?featured=true" className="text-sm text-white/70 hover:text-white flex items-center gap-1 mb-1 py-2 transition-colors">See all <ArrowRight size={14} /></Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featured.map((p: any, i: number) => <ProductCard key={p._id?.$oid || p._id} product={{ ...p, _id: p._id?.$oid || p._id }} index={i} />)}
          </div>
        </Reveal>
      )}

      {/* Latest Products */}
      {latest.length > 0 && (
        <Reveal className="section-padding max-w-7xl mx-auto w-full">
          <div className="flex items-end justify-between mb-10">
            <h2 className="text-responsive-h2">Latest</h2>
            <Link href="/products" className="text-sm text-white/70 hover:text-white flex items-center gap-1 mb-1 py-2 transition-colors">All products <ArrowRight size={14} /></Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {latest.map((p: any, i: number) => <ProductCard key={p._id?.$oid || p._id} product={{ ...p, _id: p._id?.$oid || p._id }} index={i} />)}
          </div>
        </Reveal>
      )}

      {/* How it works */}
      <Reveal className="section-padding">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <Tilt key={i} max={6}>
              <div className="glass rounded-2xl p-6 preserve-3d">
                <div className="w-11 h-11 rounded-xl bg-brand-navy-4 border border-white/10 flex items-center justify-center mb-5 lift-3"
                  style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08), 0 6px 12px -4px rgba(0,0,0,0.6)' }}>
                  <f.icon className="text-brand-gold" size={20} />
                </div>
                <h3 className="font-medium text-lg mb-2 lift-1">{f.title}</h3>
                <p className="text-sm text-white/70 leading-relaxed lift-1">{f.desc}</p>
              </div>
            </Tilt>
          ))}
        </div>
      </Reveal>

      {/* CTA */}
      <Reveal className="section-padding">
        <div className="max-w-2xl mx-auto">
          <Tilt max={3}>
            <div className="glass-gold rounded-2xl p-8 md:p-14 text-center preserve-3d" style={{ boxShadow: 'var(--depth-2)' }}>
              <h2 className="font-medium text-3xl md:text-4xl mb-4 tracking-[-0.02em] lift-2">Find your next app</h2>
              <p className="text-white/70 mb-10 text-sm md:text-base lift-1">Apps, subscriptions and top-ups, all in one catalogue.</p>
              <Link href="/products" className="btn-gold px-12 py-4 rounded-xl text-base inline-flex items-center justify-center gap-2 lift-3">
                Browse products <ArrowRight size={18} />
              </Link>
            </div>
          </Tilt>
        </div>
      </Reveal>

      <Footer />
    </div>
  );
}

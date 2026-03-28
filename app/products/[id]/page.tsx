'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/components/CartContext';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { ShoppingCart, Zap, ArrowLeft, Star, Shield, Truck, Check, Send } from 'lucide-react';
import StockModal from '@/components/StockModal';

export const runtime = 'edge';

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <button
          key={s} type="button"
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(s)}
          className="focus:outline-none"
        >
          <Star
            size={24}
            className={`transition-colors ${s <= (hovered || value) ? 'text-amber-400 fill-amber-400' : 'text-white/20'}`}
          />
        </button>
      ))}
    </div>
  );
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { addItem, clearCart } = useCart();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState<any>(null);
  const [selectedAmount, setSelectedAmount] = useState<any>(null);

  // Reviews state
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/products/${id}`)
      .then(r => r.json())
      .then(data => { setProduct(data); setLoading(false); })
      .catch(() => setLoading(false));
    fetch(`/api/products/${id}/reviews`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setReviews(data);
      });
  }, [id]);

  useEffect(() => {
    if (session?.user?.email && reviews.length > 0) {
      setHasReviewed(reviews.some(r => r.userEmail === session.user?.email));
    }
  }, [reviews, session]);

  const effectivePrice = product?.productType === 'subscription'
    ? (selectedPeriod?.price ?? null)
    : product?.productType === 'topup'
      ? (selectedAmount?.price ?? null)
      : product?.price;

  const handleBuyNow = () => {
    if (!product) return;
    if (product.soldOut) {
      setShowStockModal(true);
      return;
    }
    if (!session) { router.push(`/auth/signin?callbackUrl=/products/${id}`); return; }
    if (product.productType === 'subscription' && !selectedPeriod) { toast.error('Please select a subscription period'); return; }
    if (product.productType === 'topup' && !selectedAmount) { toast.error('Please select a top-up amount'); return; }
    
    // Pass the correct price and choice to cart
    addItem({ 
      ...product, 
      price: effectivePrice, 
      selectedPeriod: selectedPeriod?.label, 
      selectedAmount: selectedAmount?.label 
    });
    router.push('/checkout');
  };

  const handleAddToCart = () => {
    if (!product) return;
    if (product.soldOut) {
      setShowStockModal(true);
      return;
    }
    if (product.productType === 'subscription' && !selectedPeriod) { toast.error('Please select a subscription period'); return; }
    if (product.productType === 'topup' && !selectedAmount) { toast.error('Please select a top-up amount'); return; }
    
    addItem({ 
      ...product, 
      price: effectivePrice, 
      selectedPeriod: selectedPeriod?.label, 
      selectedAmount: selectedAmount?.label 
    });
    toast.success(`${product.name} added to cart!`);
  };

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!session) { router.push(`/auth/signin?callbackUrl=/products/${id}`); return; }
    try {
      const res = await fetch(`/api/products/${id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: reviewRating }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('Review submitted!');
      setReviewRating(5);
      // Refresh reviews
      const updated = await fetch(`/api/products/${id}/reviews`).then(r => r.json());
      if (Array.isArray(updated)) { setReviews(updated); setHasReviewed(true); }
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" /></div>;
  if (!product) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-5xl">😕</p>
      <h2 className="font-display font-bold text-2xl">Product not found</h2>
      <Link href="/products" className="btn-gold px-6 py-3 rounded-xl font-bold">Browse Products</Link>
    </div>
  );

  const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
  const isSubscription = product.productType === 'subscription';
  const isTopup = product.productType === 'topup';

  // Total review count = admin-set base + actual submitted reviews
  const baseReviews = product.reviews || 0;
  const totalReviewCount = baseReviews + reviews.length;

  // Average rating = blend admin rating with actual reviews
  const avgRating = reviews.length > 0
    ? ((product.rating * baseReviews) + reviews.reduce((s: number, r: any) => s + r.rating, 0)) / totalReviewCount
    : product.rating || 4.5;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="pt-24 pb-20 px-4 max-w-7xl mx-auto w-full flex-1">
        <Link href="/products" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white mb-8 transition-colors"><ArrowLeft size={14} /> Back to Products</Link>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div>
            <div className="relative h-80 sm:h-96 rounded-2xl overflow-hidden bg-brand-navy-3 border border-white/5 mb-4">
              {product.images?.[activeImg] ? <Image src={product.images[activeImg]} alt={product.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
                : <div className="w-full h-full flex items-center justify-center"><Zap size={60} className="text-brand-gold/20" /></div>}
              {discount > 0 && <div className="absolute top-4 left-4 bg-brand-accent text-white text-xs font-bold px-3 py-1 rounded-full">-{discount}% OFF</div>}
            </div>
            {product.images?.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img: string, i: number) => (
                  <button key={i} onClick={() => setActiveImg(i)} className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${activeImg === i ? 'border-brand-gold' : 'border-white/10'}`}>
                    <Image src={img} alt={`view ${i + 1}`} fill className="object-cover" sizes="64px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <p className="text-xs text-brand-gold uppercase tracking-widest font-semibold mb-3">{product.category}</p>
            <h1 className="text-responsive-h2 mb-4 text-white">{product.name}</h1>

            {/* Rating row */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star key={s} size={16} className={s <= Math.round(avgRating) ? 'text-amber-400 fill-amber-400' : 'text-white/20'} />
                ))}
              </div>
              <span className="text-sm font-bold text-amber-400">{avgRating.toFixed(1)}</span>
              <span className="text-sm text-white/40">({totalReviewCount} reviews)</span>
            </div>

            <div className="flex items-baseline gap-3 mb-6 animate-fade-in" key={effectivePrice}>
              {(isSubscription || isTopup) ? (
                effectivePrice ? (
                  <span className="text-4xl font-black text-gold-gradient">৳{effectivePrice}</span>
                ) : (
                  <span className="text-xl font-bold text-brand-gold bg-brand-gold/10 px-4 py-2 rounded-xl border border-brand-gold/20">
                    {isSubscription ? 'Select a Period' : 'Select an Amount'}
                  </span>
                )
              ) : (
                <span className="text-4xl font-black text-gold-gradient">৳{product.price}</span>
              )}
              {product.originalPrice && !selectedPeriod && !selectedAmount && (
                <span className="text-lg text-white/30 line-through">৳{product.originalPrice}</span>
              )}
            </div>

            <p className="text-sm text-white/50 leading-relaxed mb-8">{product.description}</p>

            {isSubscription && product.periods?.length > 0 && (
              <div className="mb-8">
                <p className="text-xs text-white/40 uppercase tracking-[0.2em] mb-4 font-bold">Select Period</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {product.periods.map((p: any, i: number) => (
                    <button key={i} type="button"
                      disabled={p.soldOut}
                      onClick={() => !p.soldOut && setSelectedPeriod(p)}
                      className={`relative flex items-center justify-between px-5 py-4 rounded-xl border-2 transition-all ${
                        p.soldOut
                          ? 'border-red-500/20 bg-red-500/5 opacity-60 cursor-not-allowed'
                          : selectedPeriod?.label === p.label
                          ? 'border-amber-400 bg-amber-400/10 shadow-lg shadow-amber-400/10'
                          : 'border-white/10 hover:border-white/20 bg-white/5'
                      }`}>
                      <span className={`text-sm font-bold ${p.soldOut ? 'text-white/30' : selectedPeriod?.label === p.label ? 'text-amber-400' : 'text-white/70'}`}>{p.label}</span>
                      {p.soldOut
                        ? <span className="text-[10px] font-black uppercase tracking-widest text-red-400 bg-red-500/10 px-2 py-1 rounded-lg border border-red-500/20">Sold Out</span>
                        : <span className={`text-sm font-black ${selectedPeriod?.label === p.label ? 'text-amber-400' : 'text-white/50'}`}>৳{p.price}</span>
                      }
                      {selectedPeriod?.label === p.label && !p.soldOut && <Check size={14} className="absolute top-2 right-2 text-amber-400" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isTopup && product.topupAmounts?.length > 0 && (
              <div className="mb-8">
                <p className="text-xs text-white/40 uppercase tracking-[0.2em] mb-4 font-bold">Select Amount</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {product.topupAmounts.map((a: any, i: number) => (
                    <button key={i} type="button"
                      disabled={a.soldOut}
                      onClick={() => !a.soldOut && setSelectedAmount(a)}
                      className={`relative flex items-center justify-between px-5 py-4 rounded-xl border-2 transition-all ${
                        a.soldOut
                          ? 'border-red-500/20 bg-red-500/5 opacity-60 cursor-not-allowed'
                          : selectedAmount?.label === a.label
                          ? 'border-green-400 bg-green-400/10 shadow-lg shadow-green-400/10'
                          : 'border-white/10 hover:border-white/20 bg-white/5'
                      }`}>
                      <span className={`text-sm font-bold ${a.soldOut ? 'text-white/30' : selectedAmount?.label === a.label ? 'text-green-400' : 'text-white/70'}`}>{a.label}</span>
                      {a.soldOut
                        ? <span className="text-[10px] font-black uppercase tracking-widest text-red-400 bg-red-500/10 px-2 py-1 rounded-lg border border-red-500/20">Sold Out</span>
                        : <span className={`text-sm font-black ${selectedAmount?.label === a.label ? 'text-green-400' : 'text-white/50'}`}>৳{a.price}</span>
                      }
                      {selectedAmount?.label === a.label && !a.soldOut && <Check size={14} className="absolute top-2 right-2 text-green-400" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <button onClick={handleBuyNow}
                disabled={product.soldOut || (isSubscription && selectedPeriod?.soldOut) || (isTopup && selectedAmount?.soldOut)}
                className="w-full btn-gold py-4 rounded-xl font-bold flex items-center justify-center gap-2 text-base shadow-gold-strong transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100">
                <Zap size={18} /> Buy Now
              </button>
              <button onClick={handleAddToCart}
                disabled={product.soldOut || (isSubscription && selectedPeriod?.soldOut) || (isTopup && selectedAmount?.soldOut)}
                className="w-full glass border border-white/10 hover:border-brand-gold/30 py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 text-white/80 hover:text-white transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                <ShoppingCart size={18} /> Add to Cart
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[{ icon: <Shield size={16} />, title: 'Secure Payment' }, { icon: <Truck size={16} />, title: '48hr Delivery' }].map((b, i) => (
                <div key={i} className="glass-gold rounded-2xl px-5 py-4 flex items-center gap-3 border border-brand-gold/10">
                  <span className="text-brand-gold">{b.icon}</span>
                  <span className="text-xs text-white/70 font-bold uppercase tracking-wider">{b.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Reviews Section ── */}
        <div className="mt-16">
          <div className="flex items-center gap-3 mb-8">
            <h2 className="font-display font-black text-2xl">Customer Reviews</h2>
            <span className="glass px-3 py-1 rounded-full text-sm text-white/50 border border-white/10">{totalReviewCount} reviews</span>
          </div>

          {/* Rating summary */}
          <div className="glass rounded-2xl p-6 border border-white/8 mb-8 flex items-center gap-8">
            <div className="text-center">
              <p className="text-5xl font-black text-gold-gradient">{avgRating.toFixed(1)}</p>
              <div className="flex justify-center mt-2">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star key={s} size={16} className={s <= Math.round(avgRating) ? 'text-amber-400 fill-amber-400' : 'text-white/20'} />
                ))}
              </div>
              <p className="text-xs text-white/30 mt-1">{totalReviewCount} reviews</p>
            </div>
            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map(star => {
                const count = reviews.filter(r => r.rating === star).length + (star === Math.round(product.rating) ? baseReviews : 0);
                const pct = totalReviewCount > 0 ? (count / totalReviewCount) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-3">
                    <span className="text-xs text-white/40 w-3">{star}</span>
                    <Star size={12} className="text-amber-400 fill-amber-400 flex-shrink-0" />
                    <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-white/30 w-6 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Write a review form */}
          <div className="glass rounded-2xl p-6 border border-white/8 mb-8">
            <h3 className="font-bold text-base mb-4">Write a Review</h3>
            {!session ? (
              <div className="text-center py-6">
                <p className="text-white/40 text-sm mb-3">Sign in to leave a review</p>
                <Link href={`/auth/signin?callbackUrl=/products/${id}`} className="btn-gold px-6 py-2.5 rounded-xl text-sm font-semibold inline-block">Sign In</Link>
              </div>
            ) : hasReviewed ? (
              <div className="flex items-center gap-3 py-4 px-5 bg-green-500/10 border border-green-500/20 rounded-xl">
                <Check size={18} className="text-green-400 flex-shrink-0" />
                <p className="text-sm text-green-300">You have already reviewed this product. Thank you!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Your Rating</label>
                  <StarPicker value={reviewRating} onChange={setReviewRating} />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-gold px-6 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting
                    ? <><div className="w-4 h-4 border-2 border-brand-navy/40 border-t-brand-navy rounded-full animate-spin" /> Submitting...</>
                    : <><Send size={14} /> Submit Rating</>
                  }
                </button>
              </form>
            )}
          </div>

          {/* Reviews list */}
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review: any) => (
                <div key={review._id} className="glass rounded-2xl p-5 border border-white/8">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-brand-gold/20 flex items-center justify-center text-sm font-bold text-brand-gold">
                        {review.userName?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white/80">{review.userName}</p>
                        <p className="text-xs text-white/30">{new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                      </div>
                    </div>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} size={13} className={s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-white/20'} />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-white/30">
              <Star size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No reviews yet. Be the first to review!</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
      <StockModal 
        isOpen={showStockModal} 
        onClose={() => setShowStockModal(false)} 
      />
    </div>
  );
}

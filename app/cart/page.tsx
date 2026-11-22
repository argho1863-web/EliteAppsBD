'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Tilt from '@/components/Tilt';
import { useCart } from '@/components/CartContext';
import { stagger, prefersReducedMotion } from '@/components/motion';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Zap } from 'lucide-react';

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCart();
  const { data: session } = useSession();
  const router = useRouter();
  // id of the row that is collapsing out; the real removal happens when the collapse ends
  const [leaving, setLeaving] = useState<string | null>(null);

  useEffect(() => {
    // Clear previously saved customer details to force re-entry
    try { localStorage.removeItem('eliteCustomerDetails'); } catch {}
  }, []);

  const handleCheckout = () => {
    if (!session) { router.push('/auth/signin?callbackUrl=/checkout'); return; }
    router.push('/checkout');
  };

  const handleRemove = (id: string) => {
    if (prefersReducedMotion()) { removeItem(id); return; }
    setLeaving(id);
    setTimeout(() => { removeItem(id); setLeaving(null); }, 260);
  };

  if (items.length === 0) return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center gap-6 pt-20 px-4">
        <div className="w-24 h-24 rounded-2xl bg-brand-navy-4 border border-white/10 flex items-center justify-center animate-fade-up" style={{ boxShadow: 'var(--depth-1)' }}><ShoppingBag size={40} className="text-white/55" /></div>
        <div className="text-center animate-fade-up stagger-i" style={stagger(1)}>
          <h2 className="font-display font-semibold text-2xl mb-2">Your cart is empty</h2>
          <p className="text-white/55 text-sm mb-6">Add something from the catalogue to get started</p>
          <Link href="/products" className="btn-gold px-8 py-3.5 rounded-xl font-semibold inline-flex items-center gap-2">Browse products <ArrowRight size={16} /></Link>
        </div>
      </div>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="pt-24 pb-20 px-4 max-w-6xl mx-auto w-full flex-1">
        <div className="mb-8 animate-fade-up">
          <h1 className="font-display font-semibold text-4xl">Shopping cart</h1>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map(({ product, quantity }, i) => (
              <div key={product._id} className="row-collapse" data-leaving={leaving === product._id}>
                <div className="animate-fade-up stagger-i" style={stagger(i)}>
                  <Tilt max={2.5}>
                    <div className="glass rounded-2xl p-4 sm:p-6 border border-white/5 flex flex-col sm:flex-row gap-4 relative group">
                      <div className="flex gap-4 flex-1">
                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-brand-navy-4 flex-shrink-0 border border-white/5">
                          {product.images?.[0] ? <Image src={product.images[0]} alt={product.name} fill className="object-cover" sizes="96px" /> : <div className="w-full h-full flex items-center justify-center"><Zap size={24} className="text-brand-gold/20" /></div>}
                        </div>
                        <div className="flex-1 min-w-0 py-1 pr-10">
                          <p className="text-xs text-white/55 mb-1 font-medium">{product.category}</p>
                          <h3 className="font-medium text-sm sm:text-base leading-snug line-clamp-2 mb-2 text-white/90">{product.name}</h3>
                          <p className="text-brand-gold font-semibold text-lg tabular">৳{product.price.toFixed(0)}</p>
                        </div>
                      </div>

                      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4 pt-4 sm:pt-0 border-t sm:border-t-0 border-white/5">
                        <div className="flex items-center glass rounded-xl border border-white/10 shadow-inner">
                          <button onClick={() => updateQuantity(product._id, quantity - 1)} aria-label={`Decrease quantity of ${product.name}`}
                            className="w-11 h-11 flex items-center justify-center text-white/55 hover:text-white active:scale-90 transition-[color,transform] duration-150"><Minus size={14} /></button>
                          <span key={quantity} className="w-8 text-center text-sm font-medium text-white tabular animate-pop" aria-live="polite">{quantity}</span>
                          <button onClick={() => updateQuantity(product._id, quantity + 1)} aria-label={`Increase quantity of ${product.name}`}
                            className="w-11 h-11 flex items-center justify-center text-white/55 hover:text-white active:scale-90 transition-[color,transform] duration-150"><Plus size={14} /></button>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-white/55 mb-0.5 font-medium">Subtotal</p>
                          <p key={quantity} className="text-lg font-semibold text-white/80 tabular animate-fade-in">৳{(product.price * quantity).toFixed(0)}</p>
                        </div>
                      </div>

                      <button onClick={() => handleRemove(product._id)} aria-label={`Remove ${product.name} from cart`}
                        className="absolute top-2 right-2 text-white/55 hover:text-red-400 transition-colors bg-white/5 hover:bg-red-400/10 w-11 h-11 flex items-center justify-center rounded-lg active:scale-90">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </Tilt>
                </div>
              </div>
            ))}
            <div className="flex justify-start">
              <button onClick={clearCart} className="text-xs font-medium text-white/55 hover:text-red-400 transition-colors flex items-center gap-2 py-3 px-4 rounded-xl hover:bg-red-400/5">
                <Trash2 size={14} /> Clear shopping cart
              </button>
            </div>
          </div>

          <div className="animate-fade-up stagger-i" style={stagger(2)}>
            <div className="sticky top-24"><Tilt max={2.5}>
            <div className="glass rounded-2xl p-6 border border-white/8">
              <h3 className="font-display font-semibold text-xl mb-6">Order summary</h3>
              <div className="space-y-3 mb-6">
                {items.map(({ product, quantity }) => (
                  <div key={product._id} className="flex justify-between text-sm">
                    <span className="text-white/55 truncate mr-4 max-w-40">{product.name} ×{quantity}</span>
                    <span className="text-white/70 font-medium tabular">৳{(product.price * quantity).toFixed(0)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/8 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-white/80">Total</span>
                  <span key={totalPrice} className="text-2xl font-semibold text-gold-gradient tabular animate-pop origin-right">৳{totalPrice.toFixed(0)}</span>
                </div>
              </div>
              <button onClick={handleCheckout} className="btn-gold w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-gold text-base">
                Proceed to checkout <ArrowRight size={18} />
              </button>
              <div className="mt-4 text-center"><p className="text-xs text-white/55">Pay via bKash, Nagad, Rocket or Upay</p></div>
            </div>
            </Tilt></div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

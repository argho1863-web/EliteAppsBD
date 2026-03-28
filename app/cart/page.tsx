'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/components/CartContext';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Zap } from 'lucide-react';

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCart();
  const { data: session } = useSession();
  const router = useRouter();

  const handleCheckout = () => {
    if (!session) { router.push('/auth/signin?callbackUrl=/checkout'); return; }
    router.push('/checkout');
  };

  if (items.length === 0) return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center gap-6 pt-20 px-4">
        <div className="w-24 h-24 rounded-3xl bg-brand-gold/10 flex items-center justify-center"><ShoppingBag size={40} className="text-brand-gold/40" /></div>
        <div className="text-center">
          <h2 className="font-display font-bold text-2xl mb-2">Your cart is empty</h2>
          <p className="text-white/40 text-sm mb-6">Add some amazing products to get started</p>
          <Link href="/products" className="btn-gold px-8 py-3.5 rounded-xl font-bold inline-flex items-center gap-2">Browse Products <ArrowRight size={16} /></Link>
        </div>
      </div>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="pt-24 pb-20 px-4 max-w-6xl mx-auto w-full flex-1">
        <div className="mb-8">
          <p className="text-xs text-brand-gold uppercase tracking-widest font-semibold mb-2">Your Cart</p>
          <h1 className="font-display font-black text-4xl">Shopping Cart</h1>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map(({ product, quantity }) => (
              <div key={product._id} className="glass rounded-2xl p-4 sm:p-6 border border-white/5 flex flex-col sm:flex-row gap-4 relative group">
                <div className="flex gap-4 flex-1">
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-brand-navy-4 flex-shrink-0 border border-white/5 shadow-lg shadow-black/20">
                    {product.images?.[0] ? <Image src={product.images[0]} alt={product.name} fill className="object-cover" sizes="96px" /> : <div className="w-full h-full flex items-center justify-center"><Zap size={24} className="text-brand-gold/20" /></div>}
                  </div>
                  <div className="flex-1 min-w-0 py-1">
                    <p className="text-[10px] text-brand-gold uppercase tracking-widest mb-1 font-bold">{product.category}</p>
                    <h3 className="font-bold text-sm sm:text-base leading-snug line-clamp-2 mb-2 text-white/90">{product.name}</h3>
                    <p className="text-brand-gold font-black text-lg">৳{product.price.toFixed(0)}</p>
                  </div>
                </div>
                
                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4 pt-4 sm:pt-0 border-t sm:border-t-0 border-white/5">
                  <div className="flex items-center glass rounded-xl border border-white/10 shadow-inner">
                    <button onClick={() => updateQuantity(product._id, quantity - 1)} className="w-9 h-9 flex items-center justify-center text-white/40 hover:text-white transition-colors"><Minus size={14} /></button>
                    <span className="w-8 text-center text-sm font-black text-white">{quantity}</span>
                    <button onClick={() => updateQuantity(product._id, quantity + 1)} className="w-9 h-9 flex items-center justify-center text-white/40 hover:text-white transition-colors"><Plus size={14} /></button>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-white/30 uppercase tracking-tighter mb-0.5 font-bold">Subtotal</p>
                    <p className="text-lg font-black text-white/80">৳{(product.price * quantity).toFixed(0)}</p>
                  </div>
                </div>

                <button onClick={() => removeItem(product._id)} 
                  className="absolute top-4 right-4 text-white/20 hover:text-red-400 transition-colors bg-white/5 hover:bg-red-400/10 p-2 rounded-lg">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <div className="flex justify-start">
              <button onClick={clearCart} className="text-xs font-bold uppercase tracking-widest text-white/20 hover:text-red-400 transition-colors flex items-center gap-2 py-2 px-4 rounded-xl hover:bg-red-400/5">
                <Trash2 size={14} /> Clear shopping cart
              </button>
            </div>
          </div>

          <div>
            <div className="glass rounded-2xl p-6 border border-white/8 sticky top-24">
              <h3 className="font-display font-bold text-xl mb-6">Order Summary</h3>
              <div className="space-y-3 mb-6">
                {items.map(({ product, quantity }) => (
                  <div key={product._id} className="flex justify-between text-sm">
                    <span className="text-white/50 truncate mr-4 max-w-40">{product.name} ×{quantity}</span>
                    <span className="text-white/70 font-medium">৳{(product.price * quantity).toFixed(0)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/8 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-white/80">Total</span>
                  <span className="text-2xl font-black text-gold-gradient">৳{totalPrice.toFixed(0)}</span>
                </div>
              </div>
              <button onClick={handleCheckout} className="btn-gold w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-gold text-base">
                Proceed to Checkout <ArrowRight size={18} />
              </button>
              <div className="mt-4 text-center"><p className="text-xs text-white/30">Pay via bKash, Nagad, Rocket or Upay</p></div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

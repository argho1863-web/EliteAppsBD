'use client';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Star, Zap } from 'lucide-react';
import { useCart } from '@/components/CartContext';
import toast from 'react-hot-toast';
import { useState } from 'react';
import StockModal from './StockModal';

interface Product {
  _id: string; name: string; price: number; originalPrice?: number;
  priceMin?: number; priceMax?: number;
  images: string[]; category: string; featured: boolean;
  rating: number; reviews: number; stock: number; soldOut?: boolean;
  productType?: 'app' | 'subscription' | 'topup';
}

export default function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { addItem } = useCart();

  const [showStockModal, setShowStockModal] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (product.soldOut) {
      setShowStockModal(true);
      return;
    }
    addItem(product as any);
    toast.success(`${product.name} added to cart!`);
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  return (
    <Link href={`/products/${product._id}`}>
      <div className="product-card group relative bg-brand-navy-3 rounded-2xl overflow-hidden border border-white/5 cursor-pointer" style={{ animationDelay: `${index * 0.07}s` }}>
        <div className="relative h-48 md:h-56 bg-brand-navy-4 overflow-hidden">
          {product.images?.[0] ? (
            <Image src={product.images[0]} alt={product.name} fill className={`object-cover transition-transform duration-700 ${!product.soldOut ? 'group-hover:scale-110' : 'opacity-40'}`} sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-navy-3 to-brand-navy-4">
              <Zap size={40} className="text-brand-gold/20" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-navy-3 via-transparent to-transparent opacity-80" />

          {/* Sold Out Stamp — left side */}
          {product.soldOut && (
            <div className="absolute inset-y-0 left-0 w-full flex items-center justify-start pointer-events-none z-10 overflow-hidden">
              <div className="bg-red-600/90 text-white font-black text-[10px] tracking-[0.2em] uppercase px-4 py-2 shadow-2xl skew-x-[-12deg] -translate-x-2 border-r border-red-400/50">
                OUT OF STOCK
              </div>
            </div>
          )}

          {/* Other badges */}
          {!product.soldOut && (
            <div className="absolute top-3 left-3 flex gap-2 z-20">
              {product.featured && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-gold-gradient text-brand-navy shadow-lg shadow-black/30">Featured</span>
              )}
              {discount > 0 && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-brand-accent text-white shadow-lg shadow-black/30">-{discount}%</span>
              )}
            </div>
          )}

          {/* Add to cart button - Always visible on mobile, hover on desktop */}
          <button 
            onClick={handleAddToCart} 
            className={`absolute bottom-3 right-3 rounded-xl p-3 transition-all duration-300 shadow-xl z-20 ${
              product.soldOut 
                ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                : 'btn-gold lg:opacity-0 lg:translate-y-2 lg:group-hover:opacity-100 lg:group-hover:translate-y-0'
            }`}
          >
            <ShoppingCart size={18} />
          </button>
        </div>

        <div className="p-4">
          <p className="text-xs text-brand-gold/70 uppercase tracking-widest mb-1.5 font-semibold">{product.category}</p>
          <h3 className={`font-display font-bold text-sm leading-snug mb-2 line-clamp-2 transition-colors ${product.soldOut ? 'text-white/50' : 'text-white/90 group-hover:text-brand-gold'}`}>{product.name}</h3>
          <div className="flex items-center gap-1.5 mb-3">
            <div className="flex">
              {[1,2,3,4,5].map(s => (
                <Star key={s} size={10} className={s <= Math.round(product.rating) ? 'star-filled fill-current' : 'star-empty'} />
              ))}
            </div>
            <span className="text-[11px] text-white/30">({product.reviews})</span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              {(product.productType === 'subscription' || product.productType === 'topup') && product.priceMin && product.priceMax ? (
                <span className={`text-lg font-bold ${product.soldOut ? 'text-white/30' : 'text-gold-gradient'}`}>
                  ৳{product.priceMin}–{product.priceMax}
                </span>
              ) : (
                <span className={`text-lg font-bold ${product.soldOut ? 'text-white/30' : 'text-gold-gradient'}`}>৳{product.price.toFixed(0)}</span>
              )}
              {product.originalPrice && <span className="text-xs text-white/30 line-through ml-2">৳{product.originalPrice}</span>}
            </div>
            {product.soldOut ? (
              <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider">Sold Out</span>
            ) : (
              <span className="text-[10px] text-white/30 font-mono">{product.stock > 0 ? `${product.stock} left` : 'Out of stock'}</span>
            )}
          </div>
        </div>
      </div>
      
      <StockModal 
        isOpen={showStockModal} 
        onClose={() => setShowStockModal(false)} 
      />
    </Link>
  );
}

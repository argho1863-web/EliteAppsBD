'use client';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Star } from 'lucide-react';
import { useCart } from '@/components/CartContext';
import toast from 'react-hot-toast';
import { useState } from 'react';
import StockModal from './StockModal';
import Tilt from './Tilt';

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
    toast.success(`${product.name} added to cart`);
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
  const ranged = (product.productType === 'subscription' || product.productType === 'topup') && product.priceMin && product.priceMax;

  return (
    <Link href={`/products/${product._id}`} className="block h-full">
      <Tilt className="h-full" innerClassName="h-full rounded-2xl" max={8}>
        <div className="product-card group relative h-full bg-brand-navy-3 rounded-2xl border border-white/5 cursor-pointer preserve-3d"
          style={{ boxShadow: 'var(--depth-1)' }}>

          {/* Media plane. Badges and the cart key are siblings of the image so they can sit above it in 3D. */}
          <div className="relative h-48 md:h-56 preserve-3d">
            <div className="absolute inset-0 bg-brand-navy-4 overflow-hidden rounded-t-2xl">
              {product.images?.[0] ? (
                <Image src={product.images[0]} alt={product.name} fill className={`object-cover ${product.soldOut ? 'opacity-40' : ''}`} sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl font-medium text-white/10 select-none" aria-hidden>
                  {product.name?.[0]}
                </div>
              )}
            </div>

            <div className="absolute top-3 left-3 flex gap-2 lift-2">
              {product.soldOut ? (
                <span className="text-[11px] font-medium px-2 py-1 rounded-md bg-brand-navy-2 text-red-400 border border-red-500/30">Out of stock</span>
              ) : (
                <>
                  {product.featured && (
                    <span className="text-[11px] font-semibold px-2 py-1 rounded-md bg-brand-gold text-brand-navy">Featured</span>
                  )}
                  {discount > 0 && (
                    <span className="text-[11px] font-semibold px-2 py-1 rounded-md bg-brand-accent text-white">-{discount}%</span>
                  )}
                </>
              )}
            </div>

            <button
              onClick={handleAddToCart}
              aria-label={product.soldOut ? `${product.name} is out of stock` : `Add ${product.name} to cart`}
              className={`absolute bottom-3 right-3 rounded-xl p-3 lift-3 ${product.soldOut ? 'btn-key text-red-400' : 'btn-gold'}`}
            >
              <ShoppingCart size={18} />
            </button>
          </div>

          <div className="p-4 preserve-3d">
            <p className="text-xs text-white/55 mb-1.5">{product.category}</p>
            <h3 className={`font-medium text-sm leading-snug mb-2 line-clamp-2 ${product.soldOut ? 'text-white/55' : 'text-white/90'}`}>{product.name}</h3>
            <div className="flex items-center gap-1.5 mb-3">
              <div className="flex">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star key={s} size={10} className={s <= Math.round(product.rating) ? 'star-filled fill-current' : 'star-empty'} />
                ))}
              </div>
              <span className="text-[11px] text-white/55 tabular">({product.reviews})</span>
            </div>
            <div className="flex items-end justify-between lift-1">
              <div>
                <span className={`text-lg font-semibold tabular ${product.soldOut ? 'text-white/55' : 'text-white'}`}>
                  {ranged ? `৳${product.priceMin}–${product.priceMax}` : `৳${product.price.toFixed(0)}`}
                </span>
                {product.originalPrice && <span className="text-xs text-white/55 line-through ml-2 tabular">৳{product.originalPrice}</span>}
              </div>
              {!product.soldOut && (
                <span className="text-[11px] text-white/55 font-mono tabular">{product.stock > 0 ? `${product.stock} left` : 'Out of stock'}</span>
              )}
            </div>
          </div>
        </div>
      </Tilt>

      <StockModal isOpen={showStockModal} onClose={() => setShowStockModal(false)} />
    </Link>
  );
}

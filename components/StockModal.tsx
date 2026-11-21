'use client';
import { X, ShoppingBag, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface StockModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StockModal({ isOpen, onClose }: StockModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md glass rounded-2xl p-8 animate-scale-up">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-white/55 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="text-center">
          <div className="w-20 h-20 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-6 border border-red-500/20">
            <ShoppingBag size={40} className="text-red-400" />
          </div>
          
          <h3 className="font-medium text-2xl mb-3 text-white">Out of stock</h3>
          <p className="text-white/70 text-base leading-relaxed mb-10">
            <strong className="text-white/90 font-medium">This product is out of stock</strong> right now. Check back later or look at something else in the catalogue.
          </p>

          <div className="flex flex-col gap-3">
            <Link 
              href="/products" 
              onClick={onClose}
              className="btn-gold w-full py-4 rounded-xl flex items-center justify-center gap-2"
            >
              Browse other products
              <ArrowRight size={18} />
            </Link>
            
            <button 
              onClick={onClose}
              className="text-sm text-white/55 hover:text-white transition-colors py-2"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

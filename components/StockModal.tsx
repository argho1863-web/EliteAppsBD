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
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md glass border border-white/10 rounded-3xl p-8 shadow-2xl animate-scale-up overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-gold/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-red-500/5 rounded-full blur-3xl" />

        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-white/30 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="text-center">
          <div className="w-20 h-20 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-6 border border-red-500/20">
            <ShoppingBag size={40} className="text-red-400" />
          </div>
          
          <h3 className="font-display font-black text-2xl mb-3 text-white">Out of Stock!</h3>
          <p className="text-white/50 text-base leading-relaxed mb-10">
            We're sorry! <strong className="text-white/80">This Product Is Out Of Stock</strong> at the moment. Please check back later or explore our other premium offerings.
          </p>

          <div className="flex flex-col gap-3">
            <Link 
              href="/products" 
              onClick={onClose}
              className="btn-gold w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 group"
            >
              Browse other products
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
            
            <button 
              onClick={onClose}
              className="text-sm text-white/30 hover:text-white transition-colors py-2"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

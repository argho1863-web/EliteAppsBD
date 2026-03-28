'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/components/CartContext';
import toast from 'react-hot-toast';
import { ArrowLeft, ArrowRight, ClipboardList } from 'lucide-react';

export default function DetailsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { items } = useCart();
  const [details, setDetails] = useState<Record<string, string>>({});
  const [ready, setReady] = useState(false);

  // Collect all required fields from cart items (deduplicated)
  const allFields: { label: string; placeholder: string; required: boolean }[] = [];
  const seenLabels = new Set<string>();
  
  for (const { product } of items) {
    // FIXED: Cast product as any to access requiredDetails
    const p = product as any;
    if (p.requiredDetails && Array.isArray(p.requiredDetails)) {
      for (const field of p.requiredDetails) {
        // Safety: Filter out any fields that are labeled 'password' as per user request
        if (field.label?.toLowerCase().includes('password')) continue;
        
        if (!seenLabels.has(field.label)) {
          seenLabels.add(field.label);
          allFields.push(field);
        }
      }
    }
  }

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/details');
      return;
    }
    if (status === 'authenticated' && items.length === 0) {
      router.push('/products');
      return;
    }
    if (status === 'authenticated') {
      // Check if any cart item requires details using 'any' casting
      const hasFields = items.some(({ product }: any) => 
        product.requiredDetails && Array.isArray(product.requiredDetails) && product.requiredDetails.length > 0
      );

      // If no fields needed, go straight to checkout
      if (!hasFields && items.length > 0) {
        try { localStorage.removeItem('eliteCustomerDetails'); } catch {}
        router.push('/checkout');
        return;
      }
      setReady(true);
    }
  }, [status, items, router]);

  if (!ready || status === 'loading') return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
    </div>
  );

  function handleChange(label: string, value: string) {
    setDetails(prev => ({ ...prev, [label]: value }));
  }

  function handleSubmit() {
    // Validate required fields
    for (const field of allFields) {
      if (field.required && !details[field.label]?.trim()) {
        toast.error(`${field.label} is required`);
        return;
      }
    }
    // Save to localStorage using the key expected by CheckoutPage
    try {
      localStorage.setItem('eliteCustomerDetails', JSON.stringify(details));
    } catch (e) {
      console.error('Could not save details', e);
    }
    router.push('/checkout');
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="pt-24 pb-20 px-4 max-w-2xl mx-auto w-full flex-1">
        <Link href="/cart" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={14} /> Back to Cart
        </Link>
        <div className="mb-8">
          <p className="text-xs text-brand-gold uppercase tracking-widest font-semibold mb-2">Step 1 of 2</p>
          <h1 className="font-display font-black text-4xl">Your Details</h1>
          <p className="text-sm text-white/40 mt-2">We need a few details to complete your order.</p>
        </div>

        <div className="glass rounded-2xl p-8 border border-white/8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-brand-gold/10 flex items-center justify-center">
              <ClipboardList size={20} className="text-brand-gold" />
            </div>
            <div>
              <h2 className="font-bold text-base">Order Information</h2>
              <p className="text-xs text-white/40">Please fill in all required fields</p>
            </div>
          </div>

          <div className="space-y-5">
            {allFields.map((field, i) => (
              <div key={i}>
                <label className="block text-xs text-white/50 mb-1.5 font-medium uppercase tracking-wider">
                  {field.label} {field.required && <span className="text-red-400">*</span>}
                </label>
                <input
                  type="text"
                  className="input-dark w-full"
                  value={details[field.label] || ''}
                  onChange={e => handleChange(field.label, e.target.value)}
                  placeholder={field.placeholder || `Enter your ${field.label.toLowerCase()}`}
                />
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            className="btn-gold w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 mt-8 text-sm"
          >
            Continue to Payment <ArrowRight size={16} />
          </button>
        </div>

        {session?.user && (
          <p className="text-center text-xs text-white/30 mt-4">
            Ordering as <span className="text-white/50 font-medium">{session.user.email}</span>
          </p>
        )}
      </div>
      <Footer />
    </div>
  );
}

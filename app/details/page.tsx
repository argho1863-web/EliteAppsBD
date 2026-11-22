'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/components/CartContext';
import { stagger } from '@/components/motion';
import toast from 'react-hot-toast';
import { ArrowLeft, ArrowRight, ClipboardList } from 'lucide-react';

export default function DetailsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { items } = useCart();
  const [details, setDetails] = useState<Record<string, string>>({});
  const [ready, setReady] = useState(false);
  // label of the first field that failed validation; drives the shake and the red outline
  const [invalid, setInvalid] = useState<string | null>(null);

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
    if (invalid === label) setInvalid(null);
  }

  function handleSubmit() {
    // Validate required fields
    for (let i = 0; i < allFields.length; i++) {
      const field = allFields[i];
      if (field.required && !details[field.label]?.trim()) {
        // clear first so the shake replays if the same field fails twice in a row
        setInvalid(null);
        requestAnimationFrame(() => {
          setInvalid(field.label);
          document.getElementById(`detail-${i}`)?.focus();
        });
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
        <Link href="/cart" className="inline-flex items-center gap-2 text-sm text-white/55 hover:text-white mb-8 py-2 transition-colors animate-fade-in">
          <ArrowLeft size={14} /> Back to Cart
        </Link>
        <div className="mb-8 animate-fade-up">
          <p className="text-xs text-white/55 font-medium mb-2">Step 1 of 2</p>
          <h1 className="font-display font-semibold text-4xl">Your Details</h1>
          <p className="text-sm text-white/55 mt-2">We need a few details to complete your order.</p>
        </div>

        <div className="glass rounded-2xl p-6 sm:p-8 border border-white/8 animate-fade-up stagger-i" style={stagger(1)}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-brand-gold/10 flex items-center justify-center">
              <ClipboardList size={20} className="text-brand-gold" />
            </div>
            <div>
              <h2 className="font-semibold text-base">Order Information</h2>
              <p className="text-xs text-white/55">Please fill in all required fields</p>
            </div>
          </div>

          <div className="space-y-5">
            {allFields.map((field, i) => (
              <div key={i} className="animate-fade-up stagger-i" style={stagger(i + 2)}>
                <label htmlFor={`detail-${i}`} className="block text-xs text-white/55 mb-1.5 font-medium">
                  {field.label} {field.required && <span className="text-red-400" aria-hidden>*</span>}
                </label>
                <input
                  id={`detail-${i}`}
                  type="text"
                  className={`input-dark w-full ${invalid === field.label ? 'animate-shake !border-red-400/70' : ''}`}
                  value={details[field.label] || ''}
                  onChange={e => handleChange(field.label, e.target.value)}
                  placeholder={field.placeholder || `Enter your ${field.label.toLowerCase()}`}
                  required={field.required}
                  aria-invalid={invalid === field.label}
                  autoComplete="off"
                />
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            className="btn-gold w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 mt-8 text-sm"
          >
            Continue to Payment <ArrowRight size={16} />
          </button>
        </div>

        {session?.user && (
          <p className="text-center text-xs text-white/55 mt-4 animate-fade-in">
            Ordering as <span className="text-white/55 font-medium">{session.user.email}</span>
          </p>
        )}
      </div>
      <Footer />
    </div>
  );
}

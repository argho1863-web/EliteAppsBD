'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/components/CartContext';
import toast from 'react-hot-toast';
import { ArrowLeft, Copy, Check, Zap } from 'lucide-react';

const PAYMENT_METHODS = [
  { id: 'bkash', name: 'bKash', color: '#E2136E', bg: '#E2136E', number: '01758613840', ussd: '*247#', txPattern: /^[A-Z0-9]{10}$/i, txHint: '10 characters (e.g. 8K7L9M2N1P)'},
  { id: 'nagad', name: 'Nagad', color: '#F7941D', bg: '#c0392b', number: '01758613840', ussd: '*167#', txPattern: /^[A-Z0-9]{8,12}$/i, txHint: '8-12 characters (e.g. 71A6B2C3D)'},
  { id: 'rocket', name: 'Rocket', color: '#8B2FC9', bg: '#6B21A8', number: '01707776676', ussd: '*322#', txPattern: /^[0-9]{8,12}$/i, txHint: '8-12 digits (e.g. 12345678)'},
  { id: 'upay', name: 'Upay', color: '#1D4ED8', bg: '#1D4ED8', number: '01707776676', ussd: '*268#', txPattern: /^[A-Z0-9]{8,15}$/i, txHint: '8-15 characters'},
];

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCart();
  const [selectedMethod, setSelectedMethod] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [txError, setTxError] = useState('');
  const [customerDetails, setCustomerDetails] = useState<Record<string, string>>({});

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin?callbackUrl=/checkout');
    if (status === 'authenticated' && items.length === 0) router.push('/products');
  }, [status, items, router]);

  useEffect(() => {
    // Read customer details from localStorage
    try {
      const saved = localStorage.getItem('eliteCustomerDetails');
      if (saved) setCustomerDetails(JSON.parse(saved));
    } catch {}

    // Check if any cart item requires details
    const requiredLabels = new Set<string>();
    items.forEach(({ product }: any) => {
      if (product.requiredDetails && Array.isArray(product.requiredDetails)) {
        product.requiredDetails.forEach((f: any) => {
          if (f.required && !f.label?.toLowerCase().includes('password')) {
            requiredLabels.add(f.label);
          }
        });
      }
    });

    if (requiredLabels.size > 0) {
      try {
        const saved = localStorage.getItem('eliteCustomerDetails');
        if (!saved) {
          router.push('/details');
          return;
        }
        const parsed = JSON.parse(saved);
        for (const label of requiredLabels) {
          if (!parsed[label] || !parsed[label].trim()) {
            router.push('/details');
            return;
          }
        }
      } catch {
        router.push('/details');
        return;
      }
    }
  }, [items, router]);

  if (status === 'loading' || items.length === 0) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const selectedPayment = PAYMENT_METHODS.find(p => p.id === selectedMethod);

  function copyNumber() {
    if (!selectedPayment) return;
    navigator.clipboard.writeText(selectedPayment.number);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }

  function handleTxChange(val: string) {
    setTransactionId(val);
    if (!selectedPayment || !val.trim()) { setTxError(''); return; }
    if (!selectedPayment.txPattern.test(val.trim())) {
      setTxError(`Invalid format. Expected: ${selectedPayment.txHint}`);
    } else { setTxError(''); }
  }

  const isTxValid = selectedPayment && transactionId.trim() && selectedPayment.txPattern.test(transactionId.trim());
  const hasDetails = Object.keys(customerDetails).length > 0;

  const handleSubmit = async () => {
    if (!selectedMethod) { toast.error('Select a payment method'); return; }
    if (!transactionId.trim()) { toast.error('Enter your transaction ID'); return; }
    if (!isTxValid) { toast.error(`Invalid Transaction ID. Expected: ${selectedPayment?.txHint}`); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // FIXED: Casting product as any for custom properties
          items: items.map(({ product, quantity }) => ({
            productId: product._id, 
            productName: product.name, 
            price: product.price,
            quantity, 
            image: product.images?.[0] || '',
            selectedPeriod: (product as any).selectedPeriod || null,
            selectedAmount: (product as any).selectedAmount || null,
          })),
          totalAmount: totalPrice,
          paymentMethod: selectedMethod,
          transactionId: transactionId.trim(),
          customerDetails,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to place order');
      clearCart();
      try { localStorage.removeItem('eliteCustomerDetails'); } catch {}
      toast.success('Order placed successfully!');
      router.push(`/order-success?orderId=${data.orderId}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to place order');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="pt-24 pb-20 px-4 max-w-5xl mx-auto w-full flex-1">
        <Link href="/cart" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={14} /> Back to Cart
        </Link>
        <div className="mb-8">
          <p className="text-xs text-brand-gold uppercase tracking-widest font-semibold mb-2">
            {hasDetails ? 'Step 2 of 2' : 'Checkout'}
          </p>
          <h1 className="font-display font-black text-4xl">Complete Payment</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-6">

            {/* Details summary */}
            {hasDetails && (
              <div className="glass rounded-2xl p-5 border border-brand-gold/20 bg-brand-gold/5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-brand-gold">📋 Your Details</h3>
                  <Link href="/details" className="text-xs text-white/40 hover:text-white transition-colors">Edit</Link>
                </div>
                <div className="space-y-1.5">
                  {Object.entries(customerDetails).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-xs">
                      <span className="text-white/40">{key}</span>
                      <span className="text-white/80 font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payment method */}
            <div className="glass rounded-2xl p-6 border border-white/8 shadow-xl shadow-black/10">
              <h2 className="font-display font-black text-xl mb-6 flex items-center gap-3 text-white/90">
                <span className="w-8 h-8 rounded-xl bg-brand-gold text-brand-navy text-xs font-black flex items-center justify-center shadow-gold">
                  {hasDetails ? '2' : '1'}
                </span>
                Payment Method
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {PAYMENT_METHODS.map(method => (
                  <button key={method.id}
                    onClick={() => { setSelectedMethod(method.id); setTransactionId(''); setTxError(''); setCopied(false); }}
                    className={`rounded-2xl p-5 border-2 text-left transition-all font-black text-base shadow-sm ${selectedMethod === method.id ? 'border-current scale-[1.02] shadow-xl' : 'border-white/10 hover:border-white/20 bg-white/5 opacity-70 hover:opacity-100'}`}
                    style={selectedMethod === method.id ? { borderColor: method.color, background: `${method.color}15`, color: method.color } : {}}>
                    <div className="flex items-center justify-between">
                      <span>{method.name}</span>
                      {selectedMethod === method.id && <Check size={18} />}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {selectedPayment && (
              <div className="rounded-2xl p-6 animate-fade-up" style={{ background: selectedPayment.bg }}>
                <h2 className="font-bold text-white text-center text-base mb-5">Enter Transaction ID</h2>
                <div className="mb-2">
                  <input type="text" value={transactionId}
                    onChange={e => handleTxChange(e.target.value.toUpperCase())}
                    placeholder={`${selectedPayment.name} Transaction ID`}
                    className={`w-full rounded-xl px-4 py-3 text-sm text-gray-800 font-mono outline-none border-2 ${txError ? 'border-red-400' : isTxValid ? 'border-green-400' : 'border-transparent'}`}
                    style={{ background: 'rgba(255,255,255,0.95)' }} />
                </div>
                {txError && <p className="text-xs text-red-200 mb-4 px-1 font-bold animate-pulse">⚠️ {txError}</p>}
                {isTxValid && <p className="text-xs text-green-200 mb-4 px-1 font-bold">✅ Verified Format: {transactionId}</p>}
                {!txError && !isTxValid && <p className="text-xs text-white/60 mb-4 px-1">Example: {selectedPayment.txHint}</p>}
                <p className="text-[10px] text-white/50 mb-4 px-1 uppercase tracking-tighter">Your Transaction ID will be verified manually by our team.</p>
                <ul className="space-y-3 text-sm text-white/90 mb-5">
                  <li className="flex items-start gap-2"><span>•</span><span>Dial <strong>{selectedPayment.ussd}</strong> or open the <strong>{selectedPayment.name}</strong> app.</span></li>
                  <li className="flex items-start gap-2"><span>•</span><span>Click <strong className="text-yellow-300">"Send Money"</strong>.</span></li>
                  <li className="flex items-start gap-2"><span>•</span>
                    <span>Recipient: <strong className="text-yellow-300 font-mono">{selectedPayment.number}</strong>{' '}
                      <button onClick={copyNumber} className="inline-flex items-center gap-1 text-xs bg-black/30 hover:bg-black/50 px-2 py-0.5 rounded-lg ml-1">
                        {copied ? <Check size={11} /> : <Copy size={11} />}{copied ? 'Copied' : 'Copy'}
                      </button>
                    </span>
                  </li>
                  <li className="flex items-start gap-2"><span>•</span><span>Amount: <strong className="text-yellow-300">৳{totalPrice.toFixed(0)}</strong></span></li>
                  <li className="flex items-start gap-2"><span>•</span><span>Enter PIN. You'll get a confirmation SMS with your Transaction ID.</span></li>
                  <li className="flex items-start gap-2"><span>•</span><span>Enter that <strong className="text-yellow-300">Transaction ID</strong> above and click VERIFY.</span></li>
                </ul>
                <button onClick={handleSubmit} disabled={loading || !isTxValid}
                  className="w-full py-4 rounded-xl font-black text-white text-base tracking-widest disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:brightness-90"
                  style={{ background: 'rgba(0,0,0,0.35)' }}>
                  {loading ? <span className="flex items-center justify-center gap-2"><div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Processing...</span> : 'VERIFY'}
                </button>
              </div>
            )}
          </div>

          {/* Order summary */}
          <div className="lg:col-span-2">
            <div className="glass rounded-2xl p-6 border border-white/8 sticky top-24">
              <h3 className="font-display font-bold text-lg mb-5">Order Summary</h3>
              <div className="space-y-3 mb-5 max-h-60 overflow-y-auto pr-1">
                {items.map(({ product, quantity }) => (
                  <div key={product._id} className="flex gap-3">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-brand-navy-4 flex-shrink-0">
                      {product.images?.[0] ? <Image src={product.images[0]} alt={product.name} fill className="object-cover" sizes="48px" />
                        : <div className="w-full h-full flex items-center justify-center"><Zap size={16} className="text-brand-gold/20" /></div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white/70 font-medium line-clamp-1">{product.name}</p>
                      {(product as any).selectedPeriod && <p className="text-xs text-amber-400/80">📅 {(product as any).selectedPeriod}</p>}
                      {(product as any).selectedAmount && <p className="text-xs text-green-400/80">💰 {(product as any).selectedAmount}</p>}
                      <p className="text-xs text-white/40">Qty: {quantity}</p>
                    </div>
                    <p className="text-xs font-bold text-white/70">৳{(product.price * quantity).toFixed(0)}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/8 pt-4">
                <div className="flex justify-between items-center"><span className="text-sm text-white/60">Subtotal</span><span className="font-medium">৳{totalPrice.toFixed(0)}</span></div>
                <div className="flex justify-between items-center mt-2"><span className="text-sm text-white/60">Delivery</span><span className="text-green-400 text-sm font-medium">Free</span></div>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/8">
                  <span className="font-bold">Total</span>
                  <span className="text-2xl font-black text-gold-gradient">৳{totalPrice.toFixed(0)}</span>
                </div>
              </div>
              {session?.user && (
                <div className="mt-5 pt-5 border-t border-white/8">
                  <p className="text-xs text-white/30 mb-1">Ordering as</p>
                  <p className="text-sm text-white/70 font-medium">{session.user.name}</p>
                  <p className="text-xs text-white/40">{session.user.email}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

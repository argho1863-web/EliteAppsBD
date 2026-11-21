'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CheckCircle, MessageCircle, Mail, ArrowRight, Package, Clock, ShieldCheck } from 'lucide-react';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); if (!orderId) router.push('/'); }, [orderId, router]);
  if (!mounted || !orderId) return null;

  const shortId = orderId.slice(-8).toUpperCase();

  return (
    <div className="min-h-screen bg-brand-navy flex flex-col relative overflow-hidden">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-6 py-24 relative z-10">
        <div className="w-full max-w-2xl animate-fade-up">
          <div className="glass rounded-2xl p-8 md:p-16 border border-green-500/20 text-center">
            <div className="relative w-28 h-28 mx-auto mb-10">
              <div className="relative w-28 h-28 bg-green-500/10 border-2 border-green-500/40 rounded-full flex items-center justify-center">
                <CheckCircle className="w-14 h-14 text-green-400" />
              </div>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-semibold mb-4 tracking-tight leading-tight">
              <span className="text-white">Order placed</span>
            </h1>
            
            <p className="text-white/55 text-base md:text-lg mb-4 font-semibold tracking-tight">
              Your order <span className="text-brand-gold font-mono">#{shortId}</span> is confirmed.
            </p>
            <p className="text-white/55 text-xs md:text-sm mb-12 font-medium max-w-md mx-auto leading-relaxed">
              We sent a receipt to your email. Your order will be reviewed and delivered within 48 hours.
            </p>

            {/* Responsive Stepper */}
            <div className="flex items-center justify-between gap-2 mb-12 px-2 max-w-sm mx-auto">
              {[
                { icon: Package, label: 'Placed', done: true },
                { icon: ShieldCheck, label: 'Review', done: false },
                { icon: Clock, label: 'Process', done: false },
                { icon: CheckCircle, label: 'Delivered', done: false }
              ].map((step, i) => (
                <div key={i} className="flex flex-1 items-center last:flex-none">
                  <div className={`flex flex-col items-center gap-2 group ${i === 0 ? 'opacity-100' : 'opacity-30'}`}>
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border transition-colors ${step.done ? 'bg-green-500/20 border-green-500/50 ' : 'bg-white/5 border-white/10'}`}>
                      <step.icon className={`w-5 h-5 ${step.done ? 'text-green-400' : 'text-white/55'}`} />
                    </div>
                    <span className="text-xs font-medium text-white/55 truncate max-w-[50px]">{step.label}</span>
                  </div>
                  {i < 3 && <div className={`flex-1 h-px mx-2 transition-colors ${i === 0 ? 'bg-green-500/30' : 'bg-white/5'}`} />}
                </div>
              ))}
            </div>

            <div className="glass-gold rounded-2xl p-8 mb-8 text-left">
              <h3 className="text-brand-gold font-medium text-xs mb-6 flex items-center gap-3">
                <MessageCircle className="w-5 h-5" /> Need Assistance?
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <a href="https://wa.me/8801707776676" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-green-500/5 border border-green-500/10 rounded-2xl hover:bg-green-500/10 hover:border-green-500/30 transition-colors group shadow-sm">
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center transition-transform"><MessageCircle className="w-6 h-6 text-green-400" /></div>
                  <div className="min-w-0">
                    <p className="text-white font-medium text-sm">WhatsApp</p>
                    <p className="text-white/55 text-xs font-medium truncate">Live Support Chat</p>
                  </div>
                </a>
                <a href="mailto:help@eliteappsbd.qzz.io"
                  className="flex items-center gap-4 p-4 bg-sky-500/5 border border-sky-500/10 rounded-2xl hover:bg-sky-500/10 hover:border-sky-500/30 transition-colors group shadow-sm">
                  <div className="w-12 h-12 bg-sky-500/20 rounded-xl flex items-center justify-center transition-transform"><Mail className="w-6 h-6 text-sky-400" /></div>
                  <div className="min-w-0">
                    <p className="text-white font-medium text-sm">Email Us</p>
                    <p className="text-white/55 text-xs font-medium truncate">24/7 Support Desk</p>
                  </div>
                </a>
              </div>
            </div>

            <div className="bg-amber-400/5 border border-amber-400/10 rounded-2xl p-5 mb-10 text-left flex items-start gap-4">
              <Clock size={16} className="mt-0.5 flex-shrink-0 text-white/70" />
              <p className="text-xs font-medium text-amber-200/60 leading-relaxed">
                <strong className="text-amber-400">Delivery Update:</strong> Products are typically delivered to your registered email address within <span className="text-white">48 hours</span> of approval.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products" className="btn-gold px-8 py-4 rounded-2xl font-semibold text-xs flex items-center justify-center gap-3 shadow-gold transition-colors">
                Explore More <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/" className="px-8 py-4 rounded-2xl font-medium text-xs border border-white/5 text-white/55 hover:border-white/20 hover:text-white transition-colors bg-white/2">
                Home Hub
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" /></div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}

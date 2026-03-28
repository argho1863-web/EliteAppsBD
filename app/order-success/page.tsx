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
        {/* Celebratory Orbs */}
        <div className="absolute top-1/4 left-1/4 w-[40%] h-[40%] bg-green-500/10 blur-[120px] rounded-full animate-pulse-slow pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[40%] h-[40%] bg-brand-gold/10 blur-[120px] rounded-full animate-pulse-slow pointer-events-none" style={{ animationDelay: '2s' }} />

        <div className="w-full max-w-2xl animate-fade-up">
          <div className="glass rounded-[3rem] p-8 md:p-16 border border-green-500/20 text-center shadow-2xl shadow-green-500/5">
            <div className="relative w-28 h-28 mx-auto mb-10">
              <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping-slow" />
              <div className="relative w-28 h-28 bg-green-500/10 border-2 border-green-500/40 rounded-full flex items-center justify-center shadow-lg shadow-green-500/20">
                <CheckCircle className="w-14 h-14 text-green-400" />
              </div>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tight leading-tight">
              <span className="text-gold-gradient">Order Placed</span><br />
              <span className="text-white">Successfully! 🎉</span>
            </h1>
            
            <p className="text-white/40 text-base md:text-lg mb-4 font-bold tracking-tight">
              Your order <span className="text-amber-400 font-mono">#{shortId}</span> has been secured.
            </p>
            <p className="text-white/20 text-xs md:text-sm mb-12 font-medium max-w-md mx-auto leading-relaxed">
              We&apos;ve sent a detailed receipt to your email. Our elite team will review and fulfill your request within the next 48 hours.
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
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border transition-all ${step.done ? 'bg-green-500/20 border-green-500/50 shadow-lg shadow-green-500/10' : 'bg-white/5 border-white/10'}`}>
                      <step.icon className={`w-5 h-5 ${step.done ? 'text-green-400' : 'text-white/40'}`} />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/30 truncate max-w-[50px]">{step.label}</span>
                  </div>
                  {i < 3 && <div className={`flex-1 h-px mx-2 transition-all ${i === 0 ? 'bg-green-500/30' : 'bg-white/5'}`} />}
                </div>
              ))}
            </div>

            <div className="glass-gold rounded-[2rem] p-8 mb-8 text-left shadow-xl shadow-brand-gold/5">
              <h3 className="text-brand-gold font-black text-xs uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                <MessageCircle className="w-5 h-5" /> Need Assistance?
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <a href="https://wa.me/8801707776676" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-green-500/5 border border-green-500/10 rounded-2xl hover:bg-green-500/10 hover:border-green-500/30 transition-all group shadow-sm active:scale-95">
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"><MessageCircle className="w-6 h-6 text-green-400" /></div>
                  <div className="min-w-0">
                    <p className="text-white font-black text-sm uppercase tracking-wider">WhatsApp</p>
                    <p className="text-white/30 text-[10px] font-bold truncate">Live Support Chat</p>
                  </div>
                </a>
                <a href="mailto:help@eliteappsbd.qzz.io"
                  className="flex items-center gap-4 p-4 bg-sky-500/5 border border-sky-500/10 rounded-2xl hover:bg-sky-500/10 hover:border-sky-500/30 transition-all group shadow-sm active:scale-95">
                  <div className="w-12 h-12 bg-sky-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"><Mail className="w-6 h-6 text-sky-400" /></div>
                  <div className="min-w-0">
                    <p className="text-white font-black text-sm uppercase tracking-wider">Email Us</p>
                    <p className="text-white/30 text-[10px] font-bold truncate">24/7 Support Desk</p>
                  </div>
                </a>
              </div>
            </div>

            <div className="bg-amber-400/5 border border-amber-400/10 rounded-2xl p-5 mb-10 text-left flex items-start gap-4">
              <div className="mt-1 flex-shrink-0">⏱️</div>
              <p className="text-xs font-bold text-amber-200/60 leading-relaxed uppercase tracking-wide">
                <strong className="text-amber-400">Delivery Update:</strong> Products are typically delivered to your registered email address within <span className="text-white">48 hours</span> of approval.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products" className="btn-gold px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-gold transition-all active:scale-95">
                Explore More <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/" className="px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs border border-white/5 text-white/30 hover:border-white/20 hover:text-white transition-all active:scale-95 bg-white/2">
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

'use client';
import Link from 'next/link';
import { Zap, MessageCircle, Mail, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-brand-navy-2">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gold-gradient flex items-center justify-center"><Zap size={16} className="text-brand-navy" /></div>
              <span className="font-display font-bold text-lg"><span className="text-gold-gradient">EliteApps</span><span className="text-white/50 ml-1 text-sm font-normal">BD</span></span>
            </Link>
            <p className="text-sm text-white/40 leading-relaxed max-w-xs mb-5">Bangladesh's premier digital app store. Premium products, secure payments, fast delivery.</p>
            <div className="flex gap-3">
              <a href="https://wa.me/8801707776676" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs glass px-3 py-2 rounded-lg border border-white/10 hover:border-green-500/30 text-white/50 hover:text-green-400 transition-all">
                <MessageCircle size={13} /> WhatsApp Support
              </a>
              <a href="mailto:help@eliteappsbd.qzz.io"
                className="flex items-center gap-2 text-xs glass px-3 py-2 rounded-lg border border-white/10 hover:border-blue-500/30 text-white/50 hover:text-blue-400 transition-all">
                <Mail size={13} /> Email Support
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-4">Store</h4>
            <ul className="space-y-2.5">
              {[{ label: 'All Products', href: '/products' }, { label: 'Cart', href: '/cart' }].map(l => (
                <li key={l.href}><Link href={l.href} className="text-sm text-white/40 hover:text-brand-gold transition-colors">{l.label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-4">Account</h4>
            <ul className="space-y-2.5">
              {[{ label: 'Sign In', href: '/auth/signin' }, { label: 'Sign Up', href: '/auth/signup' }].map(l => (
                <li key={l.href}><Link href={l.href} className="text-sm text-white/40 hover:text-brand-gold transition-colors">{l.label}</Link></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 py-6 border-t border-white/5 mb-6">
          <span className="text-xs text-white/20">We accept:</span>
          {[{ name: 'bKash', color: '#E2136E', emoji: '🅱️' }, { name: 'Nagad', color: '#F7941D', emoji: '🆖' }, { name: 'Rocket', color: '#8B5CF6', emoji: '🚀' }, { name: 'Upay', color: '#10B981', emoji: '💸' }].map(p => (
            <span key={p.name} className="flex items-center gap-1.5 text-xs glass px-3 py-1.5 rounded-lg border border-white/8 font-medium" style={{ color: p.color }}>
              {p.emoji} {p.name}
            </span>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-4 border-t border-white/5">
          <p className="text-xs text-white/25">© {new Date().getFullYear()} EliteApps BD. All rights reserved.</p>
          <p className="text-xs text-white/20 flex items-center gap-1">Made with <Heart size={10} className="text-brand-accent" /> in Bangladesh</p>
        </div>
      </div>
    </footer>
  );
}

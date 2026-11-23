'use client';
import Link from 'next/link';
import { MessageCircle, Mail } from 'lucide-react';

const wallets = [
  { name: 'bKash', color: '#E2136E' },
  { name: 'Nagad', color: '#F7941D' },
  { name: 'Rocket', color: '#9CA3AF' },
  { name: 'Upay', color: '#10B981' },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-brand-navy-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg btn-gold flex items-center justify-center text-sm">E</div>
              <span className="font-medium text-lg tracking-tight">EliteApps<span className="text-white/55 ml-1 text-sm font-normal">BD</span></span>
            </Link>
            <p className="text-sm text-white/70 leading-relaxed max-w-xs mb-5">Apps, subscriptions and top-ups for Bangladesh. Pay with a mobile wallet and get your order on WhatsApp or email.</p>
            <div className="flex flex-wrap gap-3">
              <a href="https://wa.me/8801707776676" target="_blank" rel="noopener noreferrer"
                className="btn-key flex items-center gap-2 text-xs px-4 py-2.5 min-h-[44px] rounded-lg text-white/80">
                <MessageCircle size={13} /> WhatsApp support
              </a>
              <a href="mailto:help@eliteappsbd.qzz.io"
                className="btn-key flex items-center gap-2 text-xs px-4 py-2.5 min-h-[44px] rounded-lg text-white/80">
                <Mail size={13} /> Email support
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-white/90 mb-4">Store</h4>
            <ul className="space-y-0 sm:space-y-2.5">
              {[{ label: 'All products', href: '/products' }, { label: 'Cart', href: '/cart' }].map(l => (
                <li key={l.href}><Link href={l.href} className="text-sm text-white/70 hover:text-white transition-colors inline-flex items-center min-h-[44px] sm:min-h-0">{l.label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-medium text-white/90 mb-4">Account</h4>
            <ul className="space-y-0 sm:space-y-2.5">
              {[{ label: 'Sign in', href: '/auth/signin' }, { label: 'Sign up', href: '/auth/signup' }].map(l => (
                <li key={l.href}><Link href={l.href} className="text-sm text-white/70 hover:text-white transition-colors inline-flex items-center min-h-[44px] sm:min-h-0">{l.label}</Link></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 py-6 border-t border-white/5 mb-6">
          <span className="text-xs text-white/55">We accept</span>
          {wallets.map(w => (
            <span key={w.name} className="glass flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg font-medium text-white/90">
              <span className="w-2 h-2 rounded-sm" style={{ background: w.color }} aria-hidden />
              {w.name}
            </span>
          ))}
        </div>

        <p className="text-xs text-white/55 pt-4 border-t border-white/5">© {new Date().getFullYear()} EliteApps BD. All rights reserved.</p>
      </div>
    </footer>
  );
}

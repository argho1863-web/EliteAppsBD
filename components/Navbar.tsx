'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { useCart } from '@/components/CartContext';
import { ShoppingCart, Menu, X, Zap, User, LogOut, Settings, ChevronDown, Package } from 'lucide-react';

export default function Navbar() {
  const { data: session } = useSession();
  const { totalItems } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isAdmin = (session?.user as any)?.role === 'admin';

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-brand-navy/60 backdrop-blur-sm z-40 md:hidden animate-fade-in" onClick={() => setMobileOpen(false)} />
      )}

      <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass border-b border-white/5 shadow-lg shadow-black/30' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20 transition-all duration-300">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-gold-gradient flex items-center justify-center shadow-gold group-hover:scale-110 transition-transform">
                <Zap size={16} className="text-brand-navy font-bold" />
              </div>
              <span className="font-display font-bold text-lg md:text-xl tracking-tight">
                <span className="text-gold-gradient">EliteApps</span>
                <span className="text-white/70 ml-1 text-sm font-normal">BD</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-sm font-medium text-white/70 hover:text-white transition-colors relative group/link">
                Home
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-gold transition-all duration-300 group-hover/link:w-full" />
              </Link>
              <Link href="/products" className="text-sm font-medium text-white/70 hover:text-white transition-colors relative group/link">
                Products
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-gold transition-all duration-300 group-hover/link:w-full" />
              </Link>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              <Link href="/cart" className="relative group text-white/70 hover:text-white transition-colors p-2">
                <ShoppingCart size={20} className="group-hover:scale-110 transition-transform" />
                {totalItems > 0 && (
                  <span className="absolute top-0 right-0 w-4.5 h-4.5 rounded-full bg-brand-gold text-brand-navy text-[10px] font-bold flex items-center justify-center border-2 border-brand-navy">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </Link>

              {session ? (
                <div className="relative">
                  <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 glass rounded-full px-1.5 py-1.5 sm:px-3 hover:border-brand-gold/30 border border-white/10 transition-all">
                    {session.user?.image ? (
                      <Image src={session.user.image} alt="avatar" width={28} height={28} className="rounded-full shadow-lg shadow-black/20" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-gold-gradient flex items-center justify-center text-xs font-bold text-brand-navy">
                        {session.user?.name?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <span className="hidden lg:block text-sm font-medium text-white/80 max-w-24 truncate">{session.user?.name?.split(' ')[0]}</span>
                    <ChevronDown size={14} className={`hidden sm:block text-white/50 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                      <div className="absolute right-0 top-full mt-3 w-56 glass rounded-2xl border border-white/10 shadow-2xl shadow-black/50 overflow-hidden z-50 animate-fade-up">
                        <div className="px-5 py-4 border-b border-white/5 bg-white/5">
                          <p className="text-[10px] text-brand-gold uppercase tracking-widest font-bold mb-1">Account</p>
                          <p className="text-sm text-white font-medium truncate">{session.user?.name}</p>
                          <p className="text-xs text-white/40 truncate">{session.user?.email}</p>
                        </div>
                        {isAdmin && (
                          <Link href="/admin" onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-5 py-3 text-sm text-brand-gold hover:bg-white/5 transition-colors group">
                            <Settings size={16} className="group-hover:rotate-45 transition-transform" /> Admin Panel
                          </Link>
                        )}
                        <button onClick={() => { signOut({ callbackUrl: '/' }); setUserMenuOpen(false); }}
                          className="w-full flex items-center gap-3 px-5 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/5 transition-colors">
                          <LogOut size={16} /> Sign Out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/auth/signin" className="hidden sm:block text-sm text-white/70 hover:text-white transition-colors px-3 py-1.5 focus:outline-none">Log In</Link>
                  <Link href="/auth/signup" className="btn-gold text-xs sm:text-sm px-4 py-2 sm:py-2.5 rounded-xl">Sign Up</Link>
                </div>
              )}

              <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-white hover:text-brand-gold transition-colors p-2 z-50">
                {mobileOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Content */}
        {mobileOpen && (
          <div className="md:hidden fixed top-16 left-0 right-0 glass border-t border-white/5 animate-fade-in shadow-2xl z-50 overflow-hidden">
            <div className="p-4 space-y-2 bg-brand-navy/95">
              {[
                { href: '/', label: 'Home', icon: <Zap size={16} /> },
                { href: '/products', label: 'Products', icon: <Package size={16} /> },
                { href: '/cart', label: 'My Cart', icon: <ShoppingCart size={16} /> }
              ].map(item => (
                <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-4 px-5 py-4 text-base font-medium text-white/80 hover:text-brand-gold hover:bg-white/5 rounded-xl transition-all">
                  <span className="text-brand-gold/50">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
              
              {isAdmin && (
                <div className="pt-4 mt-4 border-t border-white/5">
                  <Link href="/admin" onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-4 px-5 py-4 text-base font-bold text-brand-gold hover:bg-brand-gold/10 rounded-xl transition-all">
                    <Settings size={16} /> Admin Panel
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

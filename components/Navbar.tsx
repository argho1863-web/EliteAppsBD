'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useCart } from '@/components/CartContext';
import { ShoppingCart, Menu, X, Home, User, LogOut, Settings, ChevronDown, Package } from 'lucide-react';

export default function Navbar() {
  const { data: session } = useSession();
  const { totalItems } = useCart();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // close menus when the route changes
  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  // Escape closes whatever is open; the page behind the drawer doesn't scroll
  useEffect(() => {
    if (!mobileOpen && !userMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileOpen(false);
        setUserMenuOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileOpen, userMenuOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [mobileOpen]);

  const isAdmin = (session?.user as any)?.role === 'admin';

  const mobileLinks = [
    { href: '/', label: 'Home', icon: <Home size={16} /> },
    { href: '/products', label: 'Products', icon: <Package size={16} /> },
    { href: '/cart', label: 'My Cart', icon: <ShoppingCart size={16} /> },
  ];

  return (
    <>
      {/* Mobile backdrop: always mounted so it can fade out as well as in */}
      <div
        className="drawer-backdrop fixed inset-0 bg-brand-navy/70 z-40 md:hidden"
        data-open={mobileOpen}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      <div className={`fixed top-0 left-0 right-0 z-50 pt-[env(safe-area-inset-top)] transition-colors duration-300 ${scrolled ? 'glass border-b border-white/5' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg btn-gold flex items-center justify-center text-sm md:text-base">
                E
              </div>
              <span className="font-semibold text-lg md:text-xl tracking-tight">
                EliteApps
                <span className="text-white/55 ml-1 text-sm font-normal">BD</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
                Home
              </Link>
              <Link href="/products" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
                Products
              </Link>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              <Link
                href="/cart"
                aria-label={totalItems > 0 ? `Cart, ${totalItems} ${totalItems === 1 ? 'item' : 'items'}` : 'Cart'}
                className="relative group text-white/70 hover:text-white transition-colors p-3 -m-1"
              >
                <ShoppingCart size={20} />
                {totalItems > 0 && (
                  <span
                    key={totalItems}
                    className="animate-pop absolute top-1 right-1 w-[18px] h-[18px] rounded-full bg-brand-gold text-brand-navy text-[10px] font-semibold tabular flex items-center justify-center border-2 border-brand-navy"
                  >
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </Link>

              {session ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    aria-haspopup="menu"
                    aria-expanded={userMenuOpen}
                    aria-label="Account menu"
                    className="flex items-center gap-2 glass rounded-full px-1.5 py-1.5 sm:px-3 hover:border-white/20 border border-white/10 transition-colors min-h-[44px]">
                    {session.user?.image ? (
                      <Image src={session.user.image} alt="" width={28} height={28} className="rounded-full" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-brand-gold flex items-center justify-center text-xs font-semibold text-brand-navy">
                        {session.user?.name?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <span className="hidden lg:block text-sm font-medium text-white/80 max-w-24 truncate">{session.user?.name?.split(' ')[0]}</span>
                    <ChevronDown size={14} className={`hidden sm:block text-white/50 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                      <div className="absolute right-0 top-full mt-3 w-56 glass rounded-2xl border border-white/10 shadow-2xl shadow-black/50 overflow-hidden z-50 animate-fade-up origin-top-right">
                        <div className="px-5 py-4 border-b border-white/5 bg-white/5">
                          <p className="text-sm text-white font-medium truncate">{session.user?.name}</p>
                          <p className="text-xs text-white/55 truncate">{session.user?.email}</p>
                        </div>
                        {isAdmin && (
                          <Link href="/admin" onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-5 py-3 text-sm text-white hover:bg-white/5 transition-colors">
                            <Settings size={16} /> Admin Panel
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
                  <Link href="/auth/signup" className="btn-gold text-xs sm:text-sm px-4 py-2 sm:py-2.5 rounded-xl inline-flex items-center">Sign Up</Link>
                </div>
              )}

              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
                className="md:hidden text-white hover:text-brand-gold transition-colors p-3 -mr-2 z-50"
              >
                {mobileOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu: slides down, links settle in one after another, reverses on close */}
        <div
          id="mobile-menu"
          data-open={mobileOpen}
          className="drawer-panel md:hidden fixed top-[calc(4rem+env(safe-area-inset-top))] left-0 right-0 glass border-t border-white/5 shadow-2xl z-50 overflow-hidden"
        >
          <div className="p-4 space-y-2 bg-brand-navy/95">
            {mobileLinks.map((item, i) => (
              <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                style={{ '--i': i } as React.CSSProperties}
                className="drawer-item flex items-center gap-4 px-5 py-4 text-base font-medium text-white/80 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
                <span className="text-white/55">{item.icon}</span>
                {item.label}
              </Link>
            ))}

            {isAdmin && (
              <div className="pt-4 mt-4 border-t border-white/5">
                <Link href="/admin" onClick={() => setMobileOpen(false)}
                  style={{ '--i': mobileLinks.length } as React.CSSProperties}
                  className="drawer-item flex items-center gap-4 px-5 py-4 text-base font-medium text-white hover:bg-white/5 rounded-xl transition-colors">
                  <Settings size={16} /> Admin Panel
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

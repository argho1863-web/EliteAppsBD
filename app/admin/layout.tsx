'use client';
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Zap, LayoutDashboard, Package, ShoppingBag, Tag, ArrowLeft, LogOut, Star } from 'lucide-react';

const navItems = [
  { href: '/admin', icon: <LayoutDashboard size={16} />, label: 'Dashboard' },
  { href: '/admin/products', icon: <Package size={16} />, label: 'Products' },
  { href: '/admin/orders', icon: <ShoppingBag size={16} />, label: 'Orders' },
  { href: '/admin/categories', icon: <Tag size={16} />, label: 'Categories' },
  { href: '/admin/reviews', icon: <Star size={16} />, label: 'Reviews' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin');
    else if (status === 'authenticated' && (session?.user as any)?.role !== 'admin') router.push('/');
  }, [session, status, router]);

  // Close sidebar on navigation change (for mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Escape closes the drawer; the page behind it doesn't scroll while it is open
  useEffect(() => {
    if (!sidebarOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSidebarOpen(false); };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [sidebarOpen]);

  if (status === 'loading') return <div className="min-h-screen flex items-center justify-center bg-brand-navy"><div className="w-10 h-10 border-4 border-brand-gold border-t-transparent rounded-full animate-spin" /></div>;
  if ((session?.user as any)?.role !== 'admin') return null;

  return (
    <div className="min-h-screen flex bg-brand-navy">
      {/* Mobile Sidebar Overlay: always mounted so it fades out as well as in */}
      <div className="drawer-backdrop fixed inset-0 bg-brand-navy/80 z-40 lg:hidden" data-open={sidebarOpen} onClick={() => setSidebarOpen(false)} aria-hidden="true" />

      {/* Sidebar: slides on small screens, and is out of the tab order while closed (see .admin-sidebar) */}
      <aside data-open={sidebarOpen} id="admin-sidebar" className="admin-sidebar w-64 bg-brand-navy-2 border-r border-white/5 flex flex-col fixed left-0 top-0 bottom-0 z-50 pt-[env(safe-area-inset-top)] lg:translate-x-0">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gold-gradient flex items-center justify-center shadow-gold transition-transform">
              <Zap size={20} className="text-brand-navy font-semibold" />
            </div>
            <div>
              <span className="font-display font-semibold text-lg text-gold-gradient block leading-none">EliteApps</span>
              <span className="text-xs font-medium text-white/55">Admin Panel</span>
            </div>
          </Link>
          <button onClick={() => setSidebarOpen(false)} aria-label="Close menu" className="lg:hidden text-white/55 hover:text-white w-11 h-11 -mr-3 flex items-center justify-center"><ArrowLeft size={20} /></button>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar" aria-label="Admin">
          <p className="text-xs text-white/55 font-medium mb-4 px-3">Main Menu</p>
          {navItems.map(item => (
            <Link key={item.href} href={item.href} aria-current={pathname === item.href ? 'page' : undefined}
              className={`admin-nav-item py-3.5 px-5 rounded-xl flex items-center gap-4 transition-[background-color,color,transform] duration-150 active:scale-[0.98] ${pathname === item.href ? 'bg-brand-navy-4 text-white border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]' : 'text-white/55 hover:bg-white/5 hover:text-white'}`}>
              <span className={pathname === item.href ? 'text-brand-gold' : 'text-white/55 group-hover:text-white'}>{item.icon}</span>
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-2 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <Link href="/" className="admin-nav-item py-3 px-5 text-xs font-medium text-white/55 hover:text-brand-gold flex items-center gap-3">
            <ArrowLeft size={14} /> Back to Store
          </Link>
          <button onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full admin-nav-item py-3 px-5 text-xs font-medium text-red-400 hover:bg-red-400/10 flex items-center gap-3">
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-64 min-h-screen min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 border-b border-white/5 flex items-center justify-between px-4 sticky top-0 bg-brand-navy/80 z-30 pt-[env(safe-area-inset-top)] box-content">
          <button onClick={() => setSidebarOpen(true)} aria-label="Open menu" aria-expanded={sidebarOpen} aria-controls="admin-sidebar"
            className="text-white/70 hover:text-white w-11 h-11 flex items-center justify-center active:scale-90 transition-transform">
            <LayoutDashboard size={24} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gold-gradient flex items-center justify-center font-medium text-brand-navy text-xs">
              {session?.user?.name?.[0]}
            </div>
          </div>
        </header>

        {/* each admin page fades in on its own; the sidebar stays put (opacity only: no transform around fixed children) */}
        <main key={pathname} className="page-enter flex-1 p-4 sm:p-8 lg:p-10 min-w-0">{children}</main>
      </div>
    </div>
  );
}

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

  if (status === 'loading') return <div className="min-h-screen flex items-center justify-center bg-brand-navy"><div className="w-10 h-10 border-4 border-brand-gold border-t-transparent rounded-full animate-spin" /></div>;
  if ((session?.user as any)?.role !== 'admin') return null;

  return (
    <div className="min-h-screen flex bg-brand-navy">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-brand-navy/80 backdrop-blur-sm z-40 lg:hidden animate-fade-in" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`w-64 bg-brand-navy-2 border-r border-white/5 flex flex-col fixed left-0 top-0 bottom-0 z-50 transition-transform duration-300 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gold-gradient flex items-center justify-center shadow-gold group-hover:rotate-12 transition-transform">
              <Zap size={20} className="text-brand-navy font-bold" />
            </div>
            <div>
              <span className="font-display font-black text-lg text-gold-gradient block leading-none">EliteApps</span>
              <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Admin Panel</span>
            </div>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/40 hover:text-white"><ArrowLeft size={20} /></button>
        </div>
        
        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar">
          <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-bold mb-4 px-3">Main Menu</p>
          {navItems.map(item => (
            <Link key={item.href} href={item.href} className={`admin-nav-item py-3.5 px-5 rounded-xl flex items-center gap-4 transition-all ${pathname === item.href ? 'bg-brand-gold/10 text-brand-gold shadow-lg shadow-brand-gold/5 border border-brand-gold/10' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}>
              <span className={pathname === item.href ? 'text-brand-gold' : 'text-white/20 group-hover:text-white/40'}>{item.icon}</span>
              <span className="font-bold text-sm tracking-wide">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-2">
          <Link href="/" className="admin-nav-item py-3 px-5 text-xs font-bold uppercase tracking-widest text-white/40 hover:text-brand-gold flex items-center gap-3">
            <ArrowLeft size={14} /> Back to Store
          </Link>
          <button onClick={() => signOut({ callbackUrl: '/' })} 
            className="w-full admin-nav-item py-3 px-5 text-xs font-bold uppercase tracking-widest text-red-400 hover:bg-red-400/10 flex items-center gap-3">
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-64 min-h-screen">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 border-b border-white/5 flex items-center justify-between px-6 sticky top-0 bg-brand-navy/80 backdrop-blur-md z-30">
          <button onClick={() => setSidebarOpen(true)} className="text-white/70 hover:text-white">
            <LayoutDashboard size={24} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gold-gradient flex items-center justify-center font-black text-brand-navy text-xs">
              {session?.user?.name?.[0]}
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 sm:p-8 lg:p-10">{children}</main>
      </div>
    </div>
  );
}

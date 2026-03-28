'use client';
import { useState, useEffect, useRef } from 'react';
import { Package, ShoppingBag, Tag, DollarSign, Clock, CheckCircle, XCircle, RotateCcw, X, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Reset modal state
  const [showReset, setShowReset] = useState(false);
  const [resetPassword, setResetPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [resetting, setResetting] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (showReset) setTimeout(() => passwordRef.current?.focus(), 100);
  }, [showReset]);

  async function fetchData() {
    setLoading(true);
    Promise.all([
      fetch('/api/admin/orders').then(r => r.json()),
      fetch('/api/products').then(r => r.json()),
      fetch('/api/categories').then(r => r.json()),
    ]).then(([o, p, c]) => {
      setOrders(Array.isArray(o) ? o : []);
      setProducts(Array.isArray(p) ? p : []);
      setCategories(Array.isArray(c) ? c : []);
    }).finally(() => setLoading(false));
  }

  async function handleReset() {
    if (!resetPassword.trim()) { toast.error('Enter your password'); return; }
    setResetting(true);
    try {
      const res = await fetch('/api/admin/orders/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: resetPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Reset failed');
      toast.success(`Reset complete — ${data.deleted} orders deleted`);
      setShowReset(false);
      setResetPassword('');
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Reset failed');
    } finally {
      setResetting(false);
    }
  }

  const totalRevenue = orders.filter(o => o.status !== 'cancelled').reduce((s: number, o: any) => s + (o.totalAmount || 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const approvedOrders = orders.filter(o => o.status === 'approved').length;
  const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;

  const stats = [
    { label: 'Total Revenue', value: `৳${totalRevenue.toFixed(0)}`, icon: <DollarSign size={20} />, color: 'text-brand-gold', bg: 'bg-brand-gold/10' },
    { label: 'Total Orders', value: orders.length, icon: <ShoppingBag size={20} />, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Products', value: products.length, icon: <Package size={20} />, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { label: 'Categories', value: categories.length, icon: <Tag size={20} />, color: 'text-green-400', bg: 'bg-green-400/10' },
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <p className="text-[10px] text-brand-gold uppercase tracking-[0.2em] font-black mb-2 px-1">Overview</p>
          <h1 className="text-responsive-h2 text-white">Dashboard</h1>
        </div>
        <button
          onClick={() => setShowReset(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-3 rounded-2xl border border-red-500/20 bg-red-500/5 text-red-500 hover:bg-red-500 hover:text-white transition-all text-xs font-black uppercase tracking-widest shadow-lg shadow-red-500/5"
        >
          <RotateCcw size={16} />
          Reset All Orders
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <div key={i} className="glass rounded-[2rem] p-8 border border-white/5 shadow-xl shadow-black/20 hover:border-brand-gold/20 transition-all group">
            <div className={`w-14 h-14 rounded-2xl ${s.bg} flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform`}>
              <span className={s.color}>{s.icon}</span>
            </div>
            <p className={`text-3xl font-black mb-2 ${s.color} tracking-tighter`}>{s.value}</p>
            <p className="text-[10px] text-white/30 uppercase font-black tracking-[0.2em]">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Order Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Pending', count: pendingOrders, icon: <Clock size={18} />, color: 'text-yellow-400', bg: 'bg-yellow-400/5', border: 'border-yellow-400/10', href: '/admin/orders?status=pending' },
          { label: 'Approved', count: approvedOrders, icon: <CheckCircle size={18} />, color: 'text-green-400', bg: 'bg-green-400/5', border: 'border-green-400/10', href: '/admin/orders?status=approved' },
          { label: 'Cancelled', count: cancelledOrders, icon: <XCircle size={18} />, color: 'text-red-400', bg: 'bg-red-400/5', border: 'border-red-400/10', href: '/admin/orders?status=cancelled' },
        ].map((s, i) => (
          <Link key={i} href={s.href} className={`glass rounded-2xl p-6 border ${s.border} ${s.bg} hover:scale-[1.02] transition-all flex items-center gap-5 group shadow-sm shadow-black/10`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${s.border} bg-white/2`}>
              <span className={s.color}>{s.icon}</span>
            </div>
            <div>
              <p className={`text-2xl font-black ${s.color}`}>{s.count}</p>
              <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">{s.label} Orders</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="glass rounded-2xl border border-white/5 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h2 className="font-semibold text-sm">Recent Orders</h2>
          <Link href="/admin/orders" className="text-xs text-brand-gold hover:underline">View all</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['Order ID', 'Customer', 'Amount', 'Payment', 'Status', 'Date'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs text-white/30 font-medium uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 8).map((order: any) => (
                <tr key={order._id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3 text-xs font-mono text-white/60">#{(order._id || '').slice(-8).toUpperCase()}</td>
                  <td className="px-4 py-3">
                    <p className="text-xs font-medium text-white/80">{order.userName}</p>
                    <p className="text-[11px] text-white/30">{order.userEmail}</p>
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-brand-gold">৳{order.totalAmount}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs glass-gold px-2 py-0.5 rounded-md font-medium text-brand-gold uppercase">{order.paymentMethod}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold uppercase status-${order.status}`}>{order.status}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-white/30">{new Date(order.createdAt).toLocaleDateString('en-BD')}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && <div className="text-center py-12 text-white/30 text-sm">No orders yet</div>}
        </div>
      </div>
    </div>
  );
      }

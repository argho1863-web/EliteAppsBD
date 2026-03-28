'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Clock, Search, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

interface Order {
  _id: string; userName: string; userEmail: string; userPassword?: string;
  items: Array<{ productName: string; price: number; quantity: number }>;
  totalAmount: number; paymentMethod: string; transactionId: string;
  status: 'pending' | 'approved' | 'cancelled'; createdAt: string;
}

const STATUS_COLORS: Record<string, string> = { 
  pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', 
  approved: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', 
  cancelled: 'bg-red-500/10 text-red-500 border-red-500/20' 
};

const STATUS_ICONS: Record<string, React.ReactNode> = { 
  pending: <Clock size={12} />, 
  approved: <CheckCircle size={12} />, 
  cancelled: <XCircle size={12} /> 
};

function OrdersContent() {
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [actioning, setActioning] = useState<string | null>(null);

  useEffect(() => { fetchOrders(); }, []);

  async function fetchOrders() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/orders');
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch { setOrders([]); }
    finally { setLoading(false); }
  }

  async function handleApprove(id: string) {
    setActioning(id + '-approve');
    try {
      const res = await fetch(`/api/orders/${id}/approve`, { method: 'POST' });
      if (res.ok) {
        setOrders(prev => prev.map(o => o._id === id ? { ...o, status: 'approved' } : o));
        toast.custom((t) => (
          <div className={`${t.visible ? 'animate-fade-up' : 'opacity-0'} flex flex-col gap-1 glass-gold border border-brand-gold/30 rounded-2xl px-6 py-4 shadow-gold max-w-sm`}>
            <div className="flex items-center gap-2"><CheckCircle size={18} className="text-green-400" /><span className="font-bold text-white">Order Approved!</span></div>
            <p className="text-sm text-white/60">Your Order Has Been Approved. The Credentials Will Be Sent To Customer Email Within 48 Hours.</p>
          </div>
        ), { duration: 5000 });
      } else toast.error('Failed to approve order');
    } catch { toast.error('Failed to approve order'); }
    finally { setActioning(null); }
  }

  async function handleCancel(id: string) {
    setActioning(id + '-cancel');
    try {
      const res = await fetch(`/api/orders/${id}/cancel`, { method: 'POST' });
      if (res.ok) {
        setOrders(prev => prev.map(o => o._id === id ? { ...o, status: 'cancelled' } : o));
        toast.custom((t) => (
          <div className={`${t.visible ? 'animate-fade-up' : 'opacity-0'} flex flex-col gap-1 glass border border-red-500/30 rounded-2xl px-6 py-4 shadow-card max-w-sm`}>
            <div className="flex items-center gap-2"><XCircle size={18} className="text-red-400" /><span className="font-bold text-white">Order Cancelled</span></div>
            <p className="text-sm text-white/60">Customer notified. They will get their money back within 48 hours.</p>
          </div>
        ), { duration: 5000 });
      } else toast.error('Failed to cancel order');
    } catch { toast.error('Failed to cancel order'); }
    finally { setActioning(null); }
  }

  const filtered = orders.filter(o => {
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchSearch = !search || o.userName?.toLowerCase().includes(search.toLowerCase()) || o.userEmail?.toLowerCase().includes(search.toLowerCase()) || (o._id || '').slice(-8).toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <p className="text-[10px] text-brand-gold uppercase tracking-[0.2em] font-black mb-2 px-1">Manage</p>
          <h1 className="text-responsive-h2 text-white">Orders</h1>
        </div>
        <button onClick={fetchOrders} className="w-full sm:w-auto p-3.5 rounded-2xl glass border border-white/10 text-white/50 hover:text-brand-gold transition-all flex items-center justify-center shadow-lg shadow-black/10"><RefreshCw size={18} /></button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
          <input className="input-dark h-12 pl-12 text-sm font-bold" placeholder="Search by name, email or ID…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-2">
          {['all', 'pending', 'approved', 'cancelled'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === s ? 'btn-gold shadow-gold' : 'glass border border-white/10 text-white/40 hover:text-white'}`}>{s}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><div className="w-12 h-12 border-4 border-brand-gold border-t-transparent rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-[2rem] border border-white/5 py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4"><Search size={24} className="text-white/20" /></div>
          <p className="text-sm font-bold uppercase tracking-widest text-white/20">No orders found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(order => (
            <div key={order._id} className="glass rounded-[2rem] border border-white/5 overflow-hidden shadow-xl shadow-black/10 group transition-all hover:border-white/10">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 px-6 sm:px-8 py-6">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span className="text-[10px] font-black tracking-[0.2em] text-white/30 uppercase">#{(order._id || '').slice(-8).toUpperCase()}</span>
                    <span className={`text-[10px] px-3 py-1 rounded-lg font-black uppercase tracking-widest flex items-center gap-2 border shadow-sm ${STATUS_COLORS[order.status]}`}>
                      {STATUS_ICONS[order.status]} {order.status}
                    </span>
                  </div>
                  <p className="text-base font-black text-white/90 truncate mb-0.5">{order.userName}</p>
                  <p className="text-xs text-white/30 truncate font-medium">{order.userEmail}</p>
                </div>
                
                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4 py-4 sm:py-0 border-t sm:border-t-0 border-white/5">
                  <div className="text-left sm:text-right">
                    <p className="text-2xl font-black text-brand-gold tracking-tighter">৳{order.totalAmount}</p>
                    <p className="text-[10px] text-white/20 uppercase font-black tracking-[0.2em]">{order.paymentMethod}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {order.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleApprove(order._id)} disabled={actioning === order._id + '-approve'}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest disabled:opacity-50 transition-all shadow-lg shadow-emerald-500/20 active:scale-95">
                          {actioning === order._id + '-approve' ? <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : 'Approve'}
                        </button>
                        <button onClick={() => handleCancel(order._id)} disabled={actioning === order._id + '-cancel'}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 text-[10px] font-black uppercase tracking-widest disabled:opacity-50 transition-all active:scale-95">
                          {actioning === order._id + '-cancel' ? <div className="w-3 h-3 border-2 border-red-500/40 border-t-red-500 rounded-full animate-spin" /> : 'Cancel'}
                        </button>
                      </div>
                    )}
                    <button onClick={() => setExpanded(expanded === order._id ? null : order._id)} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${expanded === order._id ? 'bg-white text-brand-navy' : 'glass border border-white/10 text-white/40 hover:text-white'}`}>
                      {expanded === order._id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                  </div>
                </div>
              </div>
              
              {expanded === order._id && (
                <div className="border-t border-white/5 bg-white/2 animate-fade-down">
                  <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div>
                      <h3 className="text-[10px] text-brand-gold uppercase tracking-[0.2em] mb-6 font-black">Ordered Items</h3>
                      <div className="space-y-4">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex justify-between items-center group/item">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-white/80 group-hover/item:text-white transition-colors">{item.productName}</span>
                              <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Quantity: {item.quantity}</span>
                            </div>
                            <span className="text-sm font-black text-brand-gold">৳{(item.price * item.quantity).toFixed(0)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-6">
                      <h3 className="text-[10px] text-brand-gold uppercase tracking-[0.2em] mb-6 font-black">Payment Details</h3>
                      <div className="space-y-4">
                        {[
                          { label: 'Transaction ID', value: order.transactionId, mono: true },
                          { label: 'Customer Pass', value: order.userPassword, mono: true, color: 'text-amber-400' },
                          { label: 'Order Date', value: new Date(order.createdAt).toLocaleString('en-BD') },
                          { label: 'Grand Total', value: `৳${order.totalAmount}`, bold: true, color: 'text-brand-gold' },
                        ].map((d, i) => d.value ? (
                          <div key={i} className="flex justify-between items-center text-xs">
                            <span className="text-white/40 font-bold uppercase tracking-widest">{d.label}</span>
                            <span className={`${d.mono ? 'font-mono bg-white/5 px-2 py-1 rounded' : ''} ${d.bold ? 'font-black text-base' : 'font-bold'} ${d.color || 'text-white/80'}`}>{d.value}</span>
                          </div>
                        ) : null)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" /></div>}>
      <OrdersContent />
    </Suspense>
  );
}

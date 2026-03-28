'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Star, CheckCircle, XCircle, Trash2, MessageSquare } from 'lucide-react';

interface Review {
  _id: string;
  productId: string;
  userName: string;
  userEmail: string;
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt: string;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  async function fetchReviews() {
    setLoading(true);
    try {
      const res = await fetch('/api/reviews');
      const data = await res.json();
      if (Array.isArray(data)) {
        setReviews(data);
      }
    } catch (err) {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleApproval(id: string, currentStatus: boolean) {
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isApproved: !currentStatus })
      });
      if (res.ok) {
        setReviews(prev => prev.map(r => r._id === id ? { ...r, isApproved: !currentStatus } : r));
        toast.success(!currentStatus ? 'Review approved and is now public' : 'Review hidden from public');
      } else {
        toast.error('Failed to update review status');
      }
    } catch (err) {
      toast.error('Something went wrong');
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Are you sure you want to permanently delete this review?')) return;
    try {
      const res = await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setReviews(prev => prev.filter(r => r._id !== id));
        toast.success('Review deleted');
      } else {
        toast.error('Failed to delete review');
      }
    } catch (err) {
      toast.error('Something went wrong');
    }
  }

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs text-brand-gold uppercase tracking-widest font-semibold mb-1">Manage</p>
          <h1 className="font-display font-black text-2xl md:text-3xl flex items-center gap-3">
            <Star size={28} className="text-brand-gold" /> Customer Reviews
          </h1>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <div className="w-12 h-12 border-4 border-brand-gold border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="glass rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl shadow-black/20">
          <div className="px-8 py-5 border-b border-white/5 flex items-center justify-between">
            <span className="text-sm font-bold text-white/40 uppercase tracking-widest">
              {reviews.length} Total Reviews
            </span>
          </div>
          
          {reviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-white/20">
              <MessageSquare size={48} className="opacity-20" />
              <p className="text-sm font-bold uppercase tracking-widest">No reviews submitted yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/2 border-b border-white/5">
                    {['Date', 'Customer', 'Rating', 'Comment', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-6 py-5 text-[10px] text-white/30 font-black uppercase tracking-[0.2em]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {reviews.map(review => (
                    <tr key={review._id} className={`hover:bg-white/2 transition-colors group ${!review.isApproved ? 'bg-black/20' : ''}`}>
                      <td className="px-6 py-4">
                        <p className="text-xs font-bold text-white/60">
                          {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-white/90">{review.userName}</p>
                        <p className="text-[10px] text-white/40">{review.userEmail}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map(s => (
                            <Star key={s} size={12} className={s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-white/20'} />
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <p className="text-sm text-white/70 line-clamp-2" title={review.comment}>{review.comment}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border ${
                          review.isApproved 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : 'bg-amber-400/10 text-amber-400 border-amber-400/20'
                        }`}>
                          {review.isApproved ? <><CheckCircle size={12} /> Public</> : <><Star size={12} /> Pending</>}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => handleToggleApproval(review._id, review.isApproved)} 
                            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shadow-lg ${
                              review.isApproved 
                                ? 'bg-amber-400/10 text-amber-400 hover:bg-amber-400 hover:text-white border border-amber-400/20' 
                                : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white border border-emerald-500/20'
                            }`}
                            title={review.isApproved ? "Hide Review" : "Approve Review"}
                          >
                            {review.isApproved ? <XCircle size={14} /> : <CheckCircle size={14} />}
                          </button>
                          
                          <button 
                            onClick={() => handleDelete(review._id)} 
                            className="w-9 h-9 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 flex items-center justify-center transition-all shadow-lg shadow-red-500/5"
                            title="Delete Review"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

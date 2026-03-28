'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2, Tag, X } from 'lucide-react';

interface Category { _id: string; name: string; slug: string; icon: string; description?: string; createdAt: string; }

const EMOJI_OPTIONS = ['📱', '💻', '🎮', '🎵', '📺', '🔑', '🛡️', '☁️', '🎨', '📚', '💎', '⚡', '🌟', '🔥', '💡', '🎯', '🛒', '🎁', '💳', '🔒'];

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('📦');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => { fetchCategories(); }, []);

  async function fetchCategories() {
    setLoading(true);
    const res = await fetch('/api/categories');
    const data = await res.json();
    setCategories(Array.isArray(data) ? data.map((c: any) => ({ ...c, _id: c._id?.$oid || c._id })) : []);
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { toast.error('Category name is required'); return; }
    setSaving(true);
    const res = await fetch('/api/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: name.trim(), icon, description }) });
    if (res.ok) {
      toast.success('Category created!');
      setName(''); setIcon('📦'); setDescription(''); setShowForm(false);
      fetchCategories();
    } else { const err = await res.json(); toast.error(err.error || 'Failed to create category'); }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    const res = await fetch('/api/categories', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    if (res.ok) { toast.success('Category deleted'); setCategories(prev => prev.filter(c => c._id !== id)); }
    else toast.error('Failed to delete');
    setDeleteId(null);
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <p className="text-[10px] text-brand-gold uppercase tracking-[0.2em] font-black mb-2 px-1">Manage</p>
          <h1 className="text-responsive-h2 text-white">Categories</h1>
        </div>
        <button onClick={() => setShowForm(v => !v)} className="w-full sm:w-auto btn-gold flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-gold transition-all">
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? 'Discard Changes' : 'Create Category'}
        </button>
      </div>

      {showForm && (
        <div className="glass rounded-[2rem] border border-white/10 p-8 mb-8 shadow-2xl animate-fade-up">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-brand-gold/10 flex items-center justify-center text-brand-gold"><Tag size={20} /></div>
            <h2 className="text-sm font-black uppercase tracking-widest">New Category</h2>
          </div>
          <form onSubmit={handleCreate} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <label className="text-[10px] text-white/30 uppercase tracking-[0.2em] mb-2 block font-bold">Category Name *</label>
                <input className="input-dark h-12 px-5 text-base" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Streaming Services" required />
              </div>
              <div>
                <label className="text-[10px] text-white/30 uppercase tracking-[0.2em] mb-2 block font-bold">Description</label>
                <input className="input-dark h-12 px-5 text-base" value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional description" />
              </div>
            </div>
            <div>
              <label className="text-[10px] text-white/30 uppercase tracking-[0.2em] mb-4 block font-bold">Icon Emoji</label>
              <div className="flex flex-wrap gap-3">
                {EMOJI_OPTIONS.map(e => (
                  <button key={e} type="button" onClick={() => setIcon(e)} className={`w-12 h-12 rounded-xl text-2xl transition-all shadow-sm ${icon === e ? 'bg-gold-gradient text-brand-navy shadow-gold scale-110' : 'glass border border-white/10 hover:border-white/20 hover:scale-105'}`}>{e}</button>
                ))}
                <input type="text" className="input-dark w-24 h-12 text-center text-xl font-bold border-dashed" value={icon} onChange={e => setIcon(e.target.value)} placeholder="✏️" maxLength={4} />
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              <button type="submit" disabled={saving} className="btn-gold px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest disabled:opacity-50 shadow-gold">
                {saving ? 'Creating…' : 'Finalize Category'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest border border-white/10 text-white/40 hover:text-white transition-all">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-24"><div className="w-12 h-12 border-4 border-brand-gold border-t-transparent rounded-full animate-spin" /></div>
      ) : categories.length === 0 ? (
        <div className="glass rounded-[2rem] border border-white/5 py-24 text-center">
          <Tag size={48} className="mx-auto text-white/10 mb-6" />
          <p className="text-sm font-bold uppercase tracking-widest text-white/20">No categories found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map(cat => (
            <div key={cat._id} className="glass rounded-[2rem] border border-white/5 hover:border-brand-gold/20 p-8 transition-all group shadow-xl hover:shadow-brand-gold/5">
              <div className="flex items-start justify-between mb-8">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shadow-inner">{cat.icon}</div>
                <div className="flex items-center gap-2">
                  {deleteId === cat._id ? (
                    <div className="flex items-center gap-2 animate-fade-in">
                      <button onClick={() => handleDelete(cat._id)} className="text-[10px] font-black uppercase bg-red-500 text-white px-3 py-1.5 rounded-lg shadow-lg shadow-red-500/20">Confirm</button>
                      <button onClick={() => setDeleteId(null)} className="text-[10px] font-black uppercase text-white/40 px-2 py-1.5 hover:text-white">Cancel</button>
                    </div>
                  ) : (
                    <button onClick={() => setDeleteId(cat._id)} className="opacity-0 group-hover:opacity-100 w-10 h-10 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 flex items-center justify-center transition-all shadow-lg">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
              <h3 className="font-black text-lg text-white/90 mb-2 tracking-tight group-hover:text-brand-gold transition-colors">{cat.name}</h3>
              {cat.description && <p className="text-xs text-white/40 font-medium line-clamp-2 mb-4 leading-relaxed">{cat.description}</p>}
              <div className="mt-auto px-3 py-1.5 rounded-lg bg-white/5 inline-block">
                <p className="text-[10px] font-black tracking-widest text-white/20 uppercase truncate">{cat.slug}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

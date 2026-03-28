'use client';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Plus, Trash2, Pencil, X, Upload, Star, Package, AlertTriangle } from 'lucide-react';

interface Variant { label: string; price: number; soldOut?: boolean; }
interface Product { _id: string; name: string; description: string; price: number; originalPrice?: number; images: string[]; category: string; stock: number; featured: boolean; rating: number; soldOut?: boolean; productType?: 'app' | 'subscription' | 'topup'; periods?: Variant[]; topupAmounts?: Variant[]; requiredDetails?: { label: string; placeholder: string; required: boolean }[]; reviews?: number; }
interface Category { _id: string; name: string; }

const emptyForm = { name: '', description: '', price: '', originalPrice: '', category: '', stock: '99', featured: false, rating: '4.5', soldOut: false, productType: 'app' as 'app' | 'subscription' | 'topup', periods: [] as Variant[], topupAmounts: [] as Variant[], requiredDetails: [] as { label: string; placeholder: string; required: boolean }[], reviews: '0' };

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    const [prods, cats] = await Promise.all([fetch('/api/products').then(r => r.json()), fetch('/api/categories').then(r => r.json())]);
    setProducts(Array.isArray(prods) ? prods.map((p: any) => ({ ...p, _id: p._id?.$oid || p._id })) : []);
    setCategories(Array.isArray(cats) ? cats.map((c: any) => ({ ...c, _id: c._id?.$oid || c._id })) : []);
    setLoading(false);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    let successCount = 0;
    const urls: string[] = [];
    
    for (const file of Array.from(files)) {
      try {
        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch('/api/upload', { method: 'POST', body: fd });
        const data = await res.json();
        
        if (res.ok && data.url) {
          urls.push(data.url);
          successCount++;
        } else {
          toast.error(`Failed to upload ${file.name}: ${data.error || 'Unknown error'}`);
        }
      } catch (err: any) {
        toast.error(`Error uploading ${file.name}: ${err.message}`);
      }
    }
    
    if (urls.length > 0) {
      setImages(prev => [...prev, ...urls]);
      toast.success(`${successCount} image(s) uploaded successfully`);
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || (!form.price && form.productType === 'app') || !form.category) { toast.error('Required fields are missing'); return; }
    setSaving(true);
    const payload = { 
      ...form, 
      price: form.productType === 'app' ? parseFloat(form.price) : 0, 
      originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : undefined, 
      stock: parseInt(form.stock), 
      rating: parseFloat(form.rating), 
      reviews: parseInt(form.reviews) || 0,
      images 
    };
    const url = editId ? `/api/products/${editId}` : '/api/products';
    const method = editId ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (res.ok) {
      toast.success(editId ? 'Product updated!' : 'Product created!');
      setShowForm(false); setForm(emptyForm); setImages([]); setEditId(null);
      fetchAll();
    } else { const err = await res.json(); toast.error(err.error || 'Failed to save product'); }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    if (res.ok) { toast.success('Product deleted'); setProducts(prev => prev.filter(p => p._id !== id)); }
    else toast.error('Failed to delete');
    setDeleteId(null);
  }

  async function handleToggleSoldOut(product: Product) {
    const newSoldOut = !product.soldOut;
    const res = await fetch(`/api/products/${product._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ soldOut: newSoldOut }),
    });
    if (res.ok) {
      setProducts(prev => prev.map(p => p._id === product._id ? { ...p, soldOut: newSoldOut } : p));
      toast.success(newSoldOut ? 'Marked as Sold Out' : 'Back in stock!');
    } else toast.error('Failed to update');
  }

  function openEdit(p: Product) {
    setForm({ 
      name: p.name, 
      description: p.description, 
      price: (p.price || 0).toString(), 
      originalPrice: p.originalPrice?.toString() || '', 
      category: p.category, 
      stock: p.stock.toString(), 
      featured: p.featured, 
      rating: p.rating.toString(), 
      reviews: p.reviews?.toString() || '0',
      soldOut: p.soldOut || false,
      productType: p.productType || 'app',
      periods: p.periods || [],
      topupAmounts: p.topupAmounts || [],
      requiredDetails: p.requiredDetails || []
    });
    setImages(p.images || []); setEditId(p._id); setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function closeForm() { setShowForm(false); setEditId(null); setForm(emptyForm); setImages([]); }

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs text-brand-gold uppercase tracking-widest font-semibold mb-1">Manage</p>
          <h1 className="font-display font-black text-2xl md:text-3xl">Products</h1>
        </div>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); setImages([]); }} className="btn-gold flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold">
          <Plus size={16} /> Add Product
        </button>
      </div>

      {showForm && (
        <div className="glass rounded-2xl border border-white/10 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-lg">{editId ? 'Edit Product' : 'New Product'}</h2>
            <button onClick={closeForm}><X size={18} className="text-white/50 hover:text-white" /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="lg:col-span-2">
              <label className="text-[10px] text-white/30 uppercase tracking-[0.2em] mb-2 block font-bold">Product Name *</label>
              <input className="input-dark h-12 px-5 text-base" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Netflix Premium 1 Month" required />
            </div>
            <div className="lg:col-span-2">
              <label className="text-[10px] text-white/30 uppercase tracking-[0.2em] mb-2 block font-bold">Description</label>
              <textarea className="input-dark min-h-[100px] px-5 py-4 resize-none text-base" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe the product..." />
            </div>
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6 rounded-[1.5rem] bg-white/5 border border-white/10 mb-2">
              <div className="sm:col-span-2 lg:col-span-1">
                <label className="text-[10px] text-brand-gold uppercase tracking-[0.2em] mb-2 block font-black">Product Type</label>
                <select className="input-dark border-brand-gold/30 h-12 px-4 font-bold text-brand-gold" value={form.productType} onChange={e => setForm(f => ({ ...f, productType: e.target.value as any }))} required>
                  <option value="app" className="bg-brand-navy">Standard App</option>
                  <option value="subscription" className="bg-brand-navy">App Subscription</option>
                  <option value="topup" className="bg-brand-navy">Top Up</option>
                </select>
              </div>
              {form.productType === 'app' && (
                <div>
                  <label className="text-[10px] text-white/30 uppercase tracking-[0.2em] mb-2 block font-bold">Fixed Price (৳)</label>
                  <input className="input-dark h-12 px-5 font-bold" type="number" min="0" step="1" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="299" required={form.productType === 'app'} />
                </div>
              )}
              <div>
                <label className="text-[10px] text-white/30 uppercase tracking-[0.2em] mb-2 block font-bold">Original Price (৳)</label>
                <input className="input-dark h-12 px-5 text-white/40" type="number" min="0" step="1" value={form.originalPrice} onChange={e => setForm(f => ({ ...f, originalPrice: e.target.value }))} placeholder="499 (optional)" />
              </div>
            </div>

            {/* Dynamic Variants for Subscription */}
            {form.productType === 'subscription' && (
              <div className="lg:col-span-2 glass p-6 sm:p-8 rounded-[2rem] border border-amber-400/20 bg-amber-400/5 mb-4 shadow-xl shadow-amber-400/5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                  <div>
                    <h3 className="text-base font-black text-amber-400 uppercase tracking-[0.2em]">Subscription Periods</h3>
                    <p className="text-[10px] text-white/30 uppercase mt-1">Manage multiple pricing tiers</p>
                  </div>
                  <button type="button" onClick={() => setForm(f => ({ ... f, periods: [...f.periods, { label: '', price: 0, soldOut: false }] }))} className="w-full sm:w-auto bg-amber-400 text-brand-navy px-6 py-2.5 rounded-xl font-black text-xs hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20">
                    <Plus size={14} /> Add Period
                  </button>
                </div>
                {form.periods.length === 0 && <div className="text-center py-10 border-2 border-dashed border-white/5 rounded-2xl"><p className="text-xs text-white/20 uppercase tracking-widest">No periods added yet</p></div>}
                <div className="grid grid-cols-1 gap-4">
                  {form.periods.map((p, i) => (
                    <div key={`p-${i}`} className="flex flex-col sm:flex-row gap-4 items-end glass bg-white/5 p-4 rounded-2xl border border-white/10 group">
                      <div className="w-full sm:flex-[3]">
                        <label className="text-[10px] text-white/20 uppercase tracking-widest mb-1.5 block font-bold ml-1">Period Label</label>
                        <input className="input-dark h-14 px-6 text-lg font-bold" placeholder="e.g. 1 Month" value={p.label} onChange={e => {
                          const newP = [...form.periods];
                          newP[i] = { ...newP[i], label: e.target.value };
                          setForm(f => ({ ...f, periods: newP }));
                        }} />
                      </div>
                      <div className="w-full sm:flex-1 min-w-[140px]">
                        <label className="text-[10px] text-white/20 uppercase tracking-widest mb-1.5 block font-bold ml-1">Price (৳)</label>
                        <input className="input-dark h-14 px-6 text-lg font-black text-amber-400" type="number" placeholder="0" value={p.price || ''} onChange={e => {
                          const newP = [...form.periods];
                          newP[i] = { ...newP[i], price: parseFloat(e.target.value) || 0 };
                          setForm(f => ({ ...f, periods: newP }));
                        }} />
                      </div>
                      <div className="flex flex-col items-center justify-center px-4 h-14 bg-black/20 rounded-xl border border-white/5">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={p.soldOut} onChange={e => {
                            const newP = [...form.periods];
                            newP[i] = { ...newP[i], soldOut: e.target.checked };
                            setForm(f => ({ ...f, periods: newP }));
                          }} className="w-4 h-4 accent-red-500" />
                          <span className="text-[10px] font-black uppercase tracking-tighter text-white/50">Sold Out</span>
                        </label>
                      </div>
                      <button type="button" onClick={() => setForm(f => ({ ...f, periods: f.periods.filter((_, j) => j !== i) }))} className="w-full sm:w-14 h-14 bg-red-400/10 text-red-400 hover:bg-red-400 hover:text-white rounded-xl flex items-center justify-center transition-all">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dynamic Variants for Top Up */}
            {form.productType === 'topup' && (
              <div className="lg:col-span-2 glass p-6 sm:p-8 rounded-[2rem] border border-green-400/20 bg-green-400/5 mb-4 shadow-xl shadow-green-400/5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                  <div>
                    <h3 className="text-base font-black text-green-400 uppercase tracking-[0.2em]">Top Up Amounts</h3>
                    <p className="text-[10px] text-white/30 uppercase mt-1">Manage game currency packages</p>
                  </div>
                  <button type="button" onClick={() => setForm(f => ({ ...f, topupAmounts: [...f.topupAmounts, { label: '', price: 0, soldOut: false }] }))} className="w-full sm:w-auto bg-green-400 text-brand-navy px-6 py-2.5 rounded-xl font-black text-xs hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-lg shadow-green-400/20">
                    <Plus size={14} /> Add Amount
                  </button>
                </div>
                {form.topupAmounts.length === 0 && <div className="text-center py-10 border-2 border-dashed border-white/5 rounded-2xl"><p className="text-xs text-white/20 uppercase tracking-widest">No amounts added yet</p></div>}
                <div className="grid grid-cols-1 gap-4">
                  {form.topupAmounts.map((a, i) => (
                    <div key={`a-${i}`} className="flex flex-col sm:flex-row gap-4 items-end glass bg-white/5 p-4 rounded-2xl border border-white/10 group">
                      <div className="w-full sm:flex-[3]">
                        <label className="text-[10px] text-white/20 uppercase tracking-widest mb-1.5 block font-bold ml-1">Package Name</label>
                        <input className="input-dark h-14 px-6 text-lg font-bold" placeholder="e.g. 100 Diamonds" value={a.label} onChange={e => {
                          const newA = [...form.topupAmounts];
                          newA[i] = { ...newA[i], label: e.target.value };
                          setForm(f => ({ ...f, topupAmounts: newA }));
                        }} />
                      </div>
                      <div className="w-full sm:flex-1 min-w-[140px]">
                        <label className="text-[10px] text-white/20 uppercase tracking-widest mb-1.5 block font-bold ml-1">Price (৳)</label>
                        <input className="input-dark h-14 px-6 text-lg font-black text-green-400" type="number" placeholder="0" value={a.price || ''} onChange={e => {
                          const newA = [...form.topupAmounts];
                          newA[i] = { ...newA[i], price: parseFloat(e.target.value) || 0 };
                          setForm(f => ({ ...f, topupAmounts: newA }));
                        }} />
                      </div>
                      <div className="flex flex-col items-center justify-center px-4 h-14 bg-black/20 rounded-xl border border-white/5">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={a.soldOut} onChange={e => {
                            const newA = [...form.topupAmounts];
                            newA[i] = { ...newA[i], soldOut: e.target.checked };
                            setForm(f => ({ ...f, topupAmounts: newA }));
                          }} className="w-4 h-4 accent-red-500" />
                          <span className="text-[10px] font-black uppercase tracking-tighter text-white/50">Sold Out</span>
                        </label>
                      </div>
                      <button type="button" onClick={() => setForm(f => ({ ...f, topupAmounts: f.topupAmounts.filter((_, j) => j !== i) }))} className="w-full sm:w-14 h-14 bg-red-400/10 text-red-400 hover:bg-red-400 hover:text-white rounded-xl flex items-center justify-center transition-all">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Required Customer Details */}
            <div className="lg:col-span-2 glass p-6 sm:p-8 rounded-[2rem] border border-blue-400/20 bg-blue-400/5 mb-4 shadow-xl shadow-blue-400/5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                  <h3 className="text-base font-black text-blue-400 uppercase tracking-[0.2em]">Customer Information Requirement</h3>
                  <p className="text-[10px] text-white/30 uppercase mt-1">Specify info customers must provide (e.g., Player ID, WhatsApp, Account Email)</p>
                </div>
                <button type="button" onClick={() => setForm(f => ({ ...f, requiredDetails: [...f.requiredDetails, { label: '', placeholder: '', required: true }] }))} className="w-full sm:w-auto bg-blue-400 text-brand-navy px-6 py-2.5 rounded-xl font-black text-xs hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-lg shadow-blue-400/20">
                  <Plus size={14} /> Add Requirement
                </button>
              </div>
              {form.requiredDetails.length === 0 && <div className="text-center py-10 border-2 border-dashed border-white/5 rounded-2xl"><p className="text-xs text-white/20 uppercase tracking-widest">No extra details required</p></div>}
              <div className="grid grid-cols-1 gap-4">
                {form.requiredDetails.map((req, i) => (
                  <div key={`req-${i}`} className="flex flex-col sm:flex-row gap-4 items-end glass bg-white/5 p-4 rounded-2xl border border-white/10 group">
                    <div className="w-full sm:flex-[2]">
                      <label className="text-[10px] text-white/20 uppercase tracking-widest mb-1.5 block font-bold ml-1">Label (e.g., WhatsApp Number)</label>
                      <input className="input-dark h-14 px-6 text-[13px] font-bold" placeholder="WhatsApp Number" value={req.label} onChange={e => {
                        const newR = [...form.requiredDetails];
                        newR[i] = { ...newR[i], label: e.target.value };
                        setForm(f => ({ ...f, requiredDetails: newR }));
                      }} />
                    </div>
                    <div className="w-full sm:flex-[2]">
                      <label className="text-[10px] text-white/20 uppercase tracking-widest mb-1.5 block font-bold ml-1">Placeholder Text</label>
                      <input className="input-dark h-14 px-6 text-[13px] font-medium" placeholder="Enter your 11-digit number" value={req.placeholder} onChange={e => {
                        const newR = [...form.requiredDetails];
                        newR[i] = { ...newR[i], placeholder: e.target.value };
                        setForm(f => ({ ...f, requiredDetails: newR }));
                      }} />
                    </div>
                    <div className="w-full sm:flex-1 min-w-[120px] flex items-center justify-center h-14 bg-black/20 rounded-xl px-4 border border-white/5">
                      <label className="flex items-center gap-2 cursor-pointer w-full justify-center">
                        <input type="checkbox" className="w-4 h-4 accent-blue-400" checked={req.required} onChange={e => {
                          const newR = [...form.requiredDetails];
                          newR[i] = { ...newR[i], required: e.target.checked };
                          setForm(f => ({ ...f, requiredDetails: newR }));
                        }} />
                        <span className="text-xs font-bold text-white/70 uppercase tracking-wider">Required</span>
                      </label>
                    </div>
                    <button type="button" onClick={() => setForm(f => ({ ...f, requiredDetails: f.requiredDetails.filter((_, j) => j !== i) }))} className="w-full sm:w-14 h-14 bg-red-400/10 text-red-400 hover:bg-red-400 hover:text-white rounded-xl flex items-center justify-center transition-all">
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-white/40 uppercase tracking-wider mb-1.5 block">Category *</label>
              <select className="input-dark" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} required>
                <option value="">Select category</option>
                {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-white/40 uppercase tracking-wider mb-1.5 block">Stock</label>
              <input className="input-dark" type="number" min="0" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-white/40 uppercase tracking-wider mb-1.5 block">Rating (0–5)</label>
              <input className="input-dark" type="number" min="0" max="5" step="0.1" value={form.rating} onChange={e => setForm(f => ({ ...f, rating: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-white/40 uppercase tracking-wider mb-1.5 block">Base Reviews Count</label>
              <input className="input-dark" type="number" min="0" value={form.reviews} onChange={e => setForm(f => ({ ...f, reviews: e.target.value }))} placeholder="Fake initial count (e.g. 150)" />
            </div>
            <div className="flex flex-col gap-3 pt-2">
              <div className="flex items-center gap-3">
                <input type="checkbox" id="featured" checked={form.featured as boolean} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))} className="w-4 h-4 accent-amber-400" />
                <label htmlFor="featured" className="text-sm text-white/70 flex items-center gap-1.5"><Star size={14} className="text-amber-400" /> Featured on homepage</label>
              </div>
              {/* Sold Out Toggle */}
              <div className="flex items-center gap-4 group/toggle">
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, soldOut: !f.soldOut }))}
                  className={`relative w-12 h-6 rounded-full transition-all duration-500 shadow-inner ${form.soldOut ? 'bg-red-500 shadow-red-500/20' : 'bg-white/10 border border-white/10'}`}
                >
                  <span className={`absolute top-1 left-1 w-4 h-4 rounded-full shadow-md transition-all duration-500 transform ${form.soldOut ? 'translate-x-6 bg-white' : 'translate-x-0 bg-white/60 group-hover/toggle:bg-white'}`} />
                </button>
                <div className="flex flex-col">
                  <label className={`text-sm font-bold transition-colors cursor-pointer ${form.soldOut ? 'text-red-400' : 'text-white/70'}`} onClick={() => setForm(f => ({ ...f, soldOut: !f.soldOut }))}>
                    {form.soldOut ? 'Marked as Sold Out' : 'Available in Stock'}
                  </label>
                  <span className="text-[10px] text-white/30 uppercase tracking-tighter">Availability Status</span>
                </div>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Product Images</label>
              <div className="flex flex-wrap gap-3 mb-3">
                {images.map((img, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-white/10">
                    <Image src={img} alt="" fill className="object-cover" />
                    <button type="button" onClick={() => setImages(prev => prev.filter((_, j) => j !== i))} className="absolute top-1 right-1 w-5 h-5 bg-red-500/80 rounded-full flex items-center justify-center"><X size={10} /></button>
                  </div>
                ))}
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="w-20 h-20 rounded-xl border-2 border-dashed border-white/20 hover:border-brand-gold/50 flex flex-col items-center justify-center gap-1 text-white/30 hover:text-brand-gold transition-all text-xs">
                  {uploading ? <div className="w-4 h-4 border border-amber-400 border-t-transparent rounded-full animate-spin" /> : <><Upload size={16} /><span>Upload</span></>}
                </button>
                <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
              </div>
            </div>
            <div className="md:col-span-2 flex gap-3 pt-2">
              <button type="submit" disabled={saving} className="btn-gold px-6 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50">
                {saving ? 'Saving…' : editId ? 'Update Product' : 'Create Product'}
              </button>
              <button type="button" onClick={closeForm} className="px-6 py-2.5 rounded-xl text-sm border border-white/10 text-white/60 hover:text-white transition-colors">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-24"><div className="w-12 h-12 border-4 border-brand-gold border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="glass rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl shadow-black/20">
          <div className="px-8 py-5 border-b border-white/5 flex items-center justify-between">
            <span className="text-sm font-bold text-white/40 uppercase tracking-widest">{products.length} Products Found</span>
          </div>
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-white/20">
              <Package size={48} className="opacity-20" />
              <p className="text-sm font-bold uppercase tracking-widest">No products available</p>
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/2 border-b border-white/5">
                    {['Product', 'Category', 'Price', 'Status', 'Featured', 'Actions'].map(h => (
                      <th key={h} className="px-6 py-5 text-[10px] text-white/30 font-black uppercase tracking-[0.2em]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {products.map(p => (
                    <tr key={p._id} className="hover:bg-white/2 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-brand-navy-4 border border-white/10 flex-shrink-0 shadow-lg group-hover:scale-105 transition-transform">
                            {p.images?.[0] ? <Image src={p.images[0]} alt={p.name} fill className="object-cover" sizes="48px" /> : <div className="w-full h-full flex items-center justify-center text-white/10"><Package size={20} /></div>}
                            {p.soldOut && <div className="absolute inset-0 bg-red-500/60 flex items-center justify-center backdrop-blur-[1px]"><span className="text-[8px] text-white font-black uppercase tracking-tighter">Sold Out</span></div>}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-white/90 truncate max-w-[180px]">{p.name}</p>
                            <p className="text-[10px] text-white/20 uppercase font-bold tracking-widest mt-0.5">{p.productType || 'App'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-black uppercase tracking-widest glass-gold px-3 py-1 rounded-lg text-brand-gold border border-brand-gold/10">
                          {p.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-black text-brand-gold">৳{p.price}</p>
                        {p.originalPrice && <p className="text-[10px] text-white/20 line-through font-bold">৳{p.originalPrice}</p>}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleSoldOut(p)}
                          className={`text-[9px] px-3 py-1.5 rounded-xl font-black uppercase tracking-widest transition-all duration-300 border shadow-sm ${
                            p.soldOut 
                              ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-400 hover:text-white' 
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-400 hover:text-white'
                          }`}
                        >
                          {p.soldOut ? 'Sold Out' : 'Active'}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${p.featured ? 'bg-amber-400/10 text-amber-400 border border-amber-400/20 shadow-lg shadow-amber-400/5' : 'bg-white/5 text-white/10'}`}>
                          <Star size={14} className={p.featured ? 'fill-amber-400' : ''} />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <button onClick={() => openEdit(p)} className="w-9 h-9 rounded-xl bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white border border-blue-500/20 flex items-center justify-center transition-all shadow-lg shadow-blue-500/5"><Pencil size={14} /></button>
                          {deleteId === p._id ? (
                            <div className="flex items-center gap-2 animate-fade-in">
                              <button onClick={() => handleDelete(p._id)} className="text-[10px] font-black uppercase bg-red-500 text-white px-4 py-2 rounded-xl shadow-lg shadow-red-500/20">Confirm</button>
                              <button onClick={() => setDeleteId(null)} className="text-[10px] font-black uppercase text-white/40 px-3 py-2 hover:text-white">Cancel</button>
                            </div>
                          ) : (
                            <button onClick={() => setDeleteId(p._id)} className="w-9 h-9 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 flex items-center justify-center transition-all shadow-lg shadow-red-500/5"><Trash2 size={14} /></button>
                          )}
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

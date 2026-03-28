'use client';
import { Suspense, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Zap, Mail, Lock, User, UserPlus, ShieldCheck, AlertCircle } from 'lucide-react';

function SignUpContent() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'verify'>('form');
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { toast.error('All fields required'); return; }
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: form.name, email: form.email, password: form.password }) });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Signup failed'); return; }
      toast.success('Verification code sent to your email!');
      setStep('verify');
    } catch { toast.error('Something went wrong'); }
    finally { setLoading(false); }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) { toast.error('Enter the verification code'); return; }
    setVerifying(true);
    try {
      const res = await fetch('/api/auth/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: form.name, email: form.email, password: form.password, code }) });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Verification failed'); return; }
      toast.success('Account created! Signing you in...');
      const signInRes = await signIn('credentials', { email: form.email, password: form.password, redirect: false });
      if (signInRes?.ok) router.push('/');
      else toast.error('Account created but sign-in failed. Please sign in manually.');
    } catch { toast.error('Something went wrong'); }
    finally { setVerifying(false); }
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: form.name, email: form.email, password: form.password }) });
      if (res.ok) toast.success('New verification code sent!');
      else toast.error('Failed to resend code');
    } catch { toast.error('Something went wrong'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-brand-navy">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-brand-gold/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] bg-brand-electric/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 w-full max-w-md animate-fade-in">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gold-gradient flex items-center justify-center shadow-gold group-hover:rotate-12 transition-transform">
              <Zap size={24} className="text-brand-navy font-bold" />
            </div>
            <span className="font-display font-black text-2xl text-gold-gradient tracking-tight">EliteApps BD</span>
          </Link>
          <h1 className="mt-8 text-responsive-h2 text-white">
            {step === 'form' ? 'Create account' : 'Verify email'}
          </h1>
          <p className="text-sm font-medium text-white/30 mt-2 uppercase tracking-widest leading-relaxed px-4">
            {step === 'form' ? 'Join our elite community' : `Code sent to ${form.email}`}
          </p>
        </div>

        {step === 'form' && (
          <div className="flex items-start gap-4 bg-amber-400/5 border border-amber-400/20 rounded-2xl p-5 mb-8 shadow-xl shadow-amber-400/5">
            <div className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center flex-shrink-0">
              <AlertCircle size={18} className="text-amber-400" />
            </div>
            <p className="text-xs text-amber-100/70 leading-relaxed font-medium">
              <strong className="text-amber-400">Pro Tip:</strong> Use a real email address to ensure you receive your digital assets and order receipts instantly.
            </p>
          </div>
        )}

        <div className="glass rounded-[2rem] p-8 sm:p-10 border border-white/5 shadow-2xl shadow-black/40">
          {step === 'verify' ? (
            <form onSubmit={handleVerify} className="space-y-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-brand-gold/10 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner"><ShieldCheck size={36} className="text-brand-gold animate-bounce-subtle" /></div>
                <p className="text-sm font-bold text-white/60 mb-2">Check your inbox</p>
                <p className="text-xs text-white/30">Enter the 6-digit verification code</p>
              </div>
              <div className="space-y-3">
                <label className="block text-[10px] text-white/30 uppercase tracking-widest font-black text-center">Security Code</label>
                <input type="text" value={code} onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" className="input-dark h-16 text-center text-3xl font-mono font-black tracking-[0.3em] bg-white/5 border-dashed border-2" maxLength={6} autoFocus />
              </div>
              <button type="submit" disabled={verifying || code.length !== 6} className="btn-gold w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 disabled:opacity-50 shadow-gold active:scale-95 transition-all">
                {verifying ? <div className="w-5 h-5 border-2 border-brand-navy/30 border-t-brand-navy rounded-full animate-spin" /> : <><ShieldCheck size={18} /> Complete Setup</>}
              </button>
              <div className="text-center space-y-4">
                <button type="button" onClick={handleResend} disabled={loading} className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-brand-gold transition-colors disabled:opacity-50">
                  {loading ? 'Sending Code...' : "Didn't get code? Resend Now"}
                </button>
                <div className="h-px bg-white/5 w-12 mx-auto" />
                <button type="button" onClick={() => setStep('form')} className="text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors flex items-center justify-center gap-2 mx-auto italic">← Wrong email? Update it</button>
              </div>
            </form>
          ) : (
            <>
              <button onClick={() => signIn('google', { callbackUrl: '/' })} disabled={googleLoading}
                className="w-full flex items-center justify-center gap-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl py-4 text-sm font-black uppercase tracking-widest text-white transition-all mb-8 disabled:opacity-50 group active:scale-95 shadow-lg">
                {googleLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (
                  <svg width="20" height="20" viewBox="0 0 24 24" className="group-hover:scale-110 transition-transform">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                Google Account
              </button>
              <div className="flex items-center gap-4 mb-8">
                <div className="flex-1 h-px bg-white/5" /><span className="text-[10px] text-white/20 uppercase font-black tracking-[0.2em]">or use email</span><div className="flex-1 h-px bg-white/5" />
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-[10px] text-white/30 uppercase tracking-widest font-black ml-1">Full Name</label>
                  <div className="relative">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                    <input name="name" type="text" value={form.name} onChange={handleChange} placeholder="John Doe" className="input-dark h-14 pl-12 pr-6 text-base font-medium" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] text-white/30 uppercase tracking-widest font-black ml-1">Email Address</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                    <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="name@email.com" className="input-dark h-14 pl-12 pr-6 text-base font-medium" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] text-white/30 uppercase tracking-widest font-black ml-1">Password</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                    <input name="password" type={showPass ? 'text' : 'password'} value={form.password} onChange={handleChange} placeholder="••••••••" className="input-dark h-14 pl-12 pr-12 text-base font-medium" required />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors">
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] text-white/30 uppercase tracking-widest font-black ml-1">Confirm Password</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                    <input name="confirm" type={showPass ? 'text' : 'password'} value={form.confirm} onChange={handleChange} placeholder="••••••••" className="input-dark h-14 pl-12 pr-6 text-base font-medium" required />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn-gold w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 mt-4 disabled:opacity-50 shadow-gold active:scale-95 transition-all">
                  {loading ? <div className="w-5 h-5 border-2 border-brand-navy/30 border-t-brand-navy rounded-full animate-spin" /> : <><UserPlus size={18} /> Register Now</>}
                </button>
              </form>
            </>
          )}
        </div>
        <p className="text-center text-sm font-medium text-white/30 mt-8">
          Member of the elite?{' '}
          <Link href="/auth/signin" className="text-brand-gold hover:text-white transition-colors underline underline-offset-4 decoration-brand-gold/30">Sign in to your account</Link>
        </p>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" /></div>}>
      <SignUpContent />
    </Suspense>
  );
}

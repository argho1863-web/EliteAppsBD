'use client';
import { Suspense, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { stagger } from '@/components/motion';
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
  // the card shakes once per failed attempt; the class clears itself when the animation ends
  const [shaking, setShaking] = useState(false);
  const shake = () => { setShaking(false); requestAnimationFrame(() => setShaking(true)); };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { toast.error('All fields required'); shake(); return; }
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); shake(); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); shake(); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: form.name, email: form.email, password: form.password }) });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Signup failed'); shake(); return; }
      toast.success('Verification code sent to your email!');
      setStep('verify');
    } catch { toast.error('Something went wrong'); }
    finally { setLoading(false); }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) { toast.error('Enter the verification code'); shake(); return; }
    setVerifying(true);
    try {
      const res = await fetch('/api/auth/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: form.name, email: form.email, password: form.password, code }) });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Verification failed'); shake(); return; }
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
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-10 animate-fade-up">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-xl btn-gold flex items-center justify-center text-xl">E</div>
            <span className="font-display font-semibold text-2xl text-gold-gradient tracking-tight">EliteApps BD</span>
          </Link>
          <h1 key={step} className="mt-8 text-responsive-h2 text-white animate-fade-in">
            {step === 'form' ? 'Create account' : 'Verify email'}
          </h1>
          <p key={`${step}-sub`} className="text-sm font-medium text-white/55 mt-2 leading-relaxed px-4 animate-fade-in">
            {step === 'form' ? 'Join our elite community' : `Code sent to ${form.email}`}
          </p>
        </div>

        {step === 'form' && (
          <div className="flex items-start gap-4 bg-amber-400/5 border border-amber-400/20 rounded-2xl p-5 mb-8 animate-fade-up stagger-i" style={stagger(1)}>
            <div className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center flex-shrink-0">
              <AlertCircle size={18} className="text-amber-400" />
            </div>
            <p className="text-xs text-amber-100/70 leading-relaxed font-medium">
              <strong className="text-amber-400">Important:</strong> Use your working email because the order details and delivery information will be sent to it.
            </p>
          </div>
        )}

        <div className="animate-fade-up stagger-i" style={stagger(2)}>
        <div className={`glass rounded-2xl p-6 sm:p-10 border border-white/5 ${shaking ? 'animate-shake' : ''}`} onAnimationEnd={e => { if (e.animationName === 'shake') setShaking(false); }}>
          {/* the two steps swap with a short fade-up; `key` restarts it each time */}
          <div key={step} className="animate-fade-up">
          {step === 'verify' ? (
            <form onSubmit={handleVerify} className="space-y-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-brand-gold/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner animate-pop"><ShieldCheck size={36} className="text-brand-gold" /></div>
                <p className="text-sm font-medium text-white/70 mb-2">Check your inbox</p>
                <p className="text-xs text-white/55">Enter the 6-digit verification code</p>
              </div>
              <div className="space-y-3">
                <label htmlFor="signup-code" className="block text-xs text-white/55 font-medium text-center">Security Code</label>
                <input id="signup-code" type="text" inputMode="numeric" autoComplete="one-time-code" value={code} onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" className="input-dark h-16 text-center text-3xl font-mono font-semibold bg-white/5 border-dashed border-2" maxLength={6} autoFocus />
              </div>
              <button type="submit" disabled={verifying || code.length !== 6} aria-busy={verifying} className="btn-gold w-full py-4 rounded-2xl font-semibold text-xs flex items-center justify-center gap-3 disabled:opacity-50 shadow-gold transition-all">
                {verifying ? <div className="w-5 h-5 border-2 border-brand-navy/30 border-t-brand-navy rounded-full animate-spin" /> : <><ShieldCheck size={18} /> Complete Setup</>}
              </button>
              <div className="text-center space-y-4">
                <button type="button" onClick={handleResend} disabled={loading} className="text-xs font-medium text-white/55 hover:text-brand-gold transition-colors disabled:opacity-50 py-2 px-3">
                  {loading ? 'Sending Code...' : "Didn't get code? Resend Now"}
                </button>
                <div className="h-px bg-white/5 w-12 mx-auto" />
                <button type="button" onClick={() => setStep('form')} className="text-xs font-medium text-white/55 hover:text-white transition-colors flex items-center justify-center gap-2 mx-auto italic py-2 px-3">← Wrong email? Update it</button>
              </div>
            </form>
          ) : (
            <>
              <button onClick={() => { setGoogleLoading(true); signIn('google', { callbackUrl: '/' }).catch(() => { toast.error('Google sign-in failed'); setGoogleLoading(false); }); }} disabled={googleLoading}
                className="w-full min-h-[52px] flex items-center justify-center gap-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl py-4 text-sm font-medium text-white transition-[background-color,border-color,transform] duration-150 active:scale-[0.98] mb-8 disabled:opacity-50 group">
                {googleLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (
                  <svg width="20" height="20" viewBox="0 0 24 24" className="transition-transform" aria-hidden>
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                Google Account
              </button>
              <div className="flex items-center gap-4 mb-8">
                <div className="flex-1 h-px bg-white/5" /><span className="text-xs text-white/55 font-medium">or use email</span><div className="flex-1 h-px bg-white/5" />
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="signup-name" className="block text-xs text-white/55 font-medium ml-1">Full Name</label>
                  <div className="relative">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/55" aria-hidden />
                    <input id="signup-name" name="name" type="text" value={form.name} onChange={handleChange} placeholder="John Doe" className="input-dark h-14 pl-12 pr-6 text-base font-medium" autoComplete="name" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="signup-email" className="block text-xs text-white/55 font-medium ml-1">Email Address</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/55" aria-hidden />
                    <input id="signup-email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="name@email.com" className="input-dark h-14 pl-12 pr-6 text-base font-medium" autoComplete="email" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="signup-password" className="block text-xs text-white/55 font-medium ml-1">Password</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/55" aria-hidden />
                    <input id="signup-password" name="password" type={showPass ? 'text' : 'password'} value={form.password} onChange={handleChange} placeholder="••••••••" className="input-dark h-14 pl-12 pr-14 text-base font-medium" autoComplete="new-password" required />
                    <button type="button" onClick={() => setShowPass(!showPass)} aria-label={showPass ? 'Hide password' : 'Show password'} aria-pressed={showPass}
                      className="absolute right-1 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center text-white/55 hover:text-white transition-colors">
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="signup-confirm" className="block text-xs text-white/55 font-medium ml-1">Confirm Password</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/55" aria-hidden />
                    <input id="signup-confirm" name="confirm" type={showPass ? 'text' : 'password'} value={form.confirm} onChange={handleChange} placeholder="••••••••" className="input-dark h-14 pl-12 pr-6 text-base font-medium" autoComplete="new-password" required />
                  </div>
                </div>
                <button type="submit" disabled={loading} aria-busy={loading} className="btn-gold w-full py-4 rounded-2xl font-semibold text-xs flex items-center justify-center gap-3 mt-4 disabled:opacity-50 shadow-gold transition-all">
                  {loading ? <div className="w-5 h-5 border-2 border-brand-navy/30 border-t-brand-navy rounded-full animate-spin" /> : <><UserPlus size={18} /> Register Now</>}
                </button>
              </form>
            </>
          )}
          </div>
        </div>
        </div>
        <p className="text-center text-sm font-medium text-white/55 mt-8 animate-fade-in" style={{ animationDelay: '350ms' }}>
          Member of the elite?{' '}
          <Link href="/auth/signin" className="text-brand-gold hover:text-white transition-colors underline underline-offset-4 decoration-brand-gold/30 py-2 inline-block">Sign in to your account</Link>
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

'use client';
import { useState, useEffect } from 'react';
import { X, Globe, Languages } from 'lucide-react';

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}

export default function LanguagePrompt() {
  const [show, setShow] = useState(false);
  const [translated, setTranslated] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    // Use sessionStorage so it resets every visit (new tab/session)
    // Each page load/visit will ask again
    const answered = sessionStorage.getItem('langPromptAnswered');
    if (!answered) {
      // Small delay so the page renders first
      const t = setTimeout(() => setShow(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  function handleYes() {
    // Inject Google Translate script and trigger Bangla translation
    injectGoogleTranslate(() => {
      triggerTranslation('bn');
      setTranslated(true);
    });
    sessionStorage.setItem('langPromptAnswered', 'yes');
    dismiss();
  }

  function handleNo() {
    sessionStorage.setItem('langPromptAnswered', 'no');
    dismiss();
  }

  function dismiss() {
    setClosing(true);
    setTimeout(() => setShow(false), 400);
  }

  function injectGoogleTranslate(callback: () => void) {
    if (document.getElementById('google-translate-script')) {
      callback();
      return;
    }

    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        { pageLanguage: 'en', includedLanguages: 'bn', autoDisplay: false },
        'google_translate_element'
      );
      setTimeout(callback, 600);
    };

    const script = document.createElement('script');
    script.id = 'google-translate-script';
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.head.appendChild(script);
  }

  function triggerTranslation(lang: string) {
    // Find and click the Google Translate combo
    const maxAttempts = 20;
    let attempts = 0;
    const interval = setInterval(() => {
      const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
      if (select) {
        select.value = lang;
        select.dispatchEvent(new Event('change'));
        clearInterval(interval);
      } else if (++attempts >= maxAttempts) {
        clearInterval(interval);
      }
    }, 300);
  }

  if (!show) return (
    <>
      {/* Hidden Google Translate element (needed for the widget) */}
      <div id="google_translate_element" className="hidden" />
      {/* Hide the ugly Google bar */}
      <style>{`
        .goog-te-banner-frame, .skiptranslate { display: none !important; }
        body { top: 0 !important; }
        .goog-te-gadget { display: none !important; }
      `}</style>
    </>
  );

  return (
    <>
      {/* Hidden Google Translate element */}
      <div id="google_translate_element" className="hidden" />
      {/* Hide the ugly Google bar */}
      <style>{`
        .goog-te-banner-frame, .skiptranslate { display: none !important; }
        body { top: 0 !important; }
        .goog-te-gadget { display: none !important; }
      `}</style>

      {/* Overlay backdrop */}
      <div
        className={`fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4 transition-all duration-400 ${closing ? 'opacity-0' : 'opacity-100'}`}
        style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
        onClick={handleNo}
      >
        {/* Modal Card */}
        <div
          className={`relative w-full max-w-sm glass rounded-3xl border border-white/10 p-7 shadow-2xl shadow-black/60 transition-all duration-400 ${
            closing ? 'translate-y-8 opacity-0 scale-95' : 'translate-y-0 opacity-100 scale-100'
          }`}
          onClick={e => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={handleNo}
            className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/30 hover:text-white transition-all"
          >
            <X size={14} />
          </button>

          {/* Icon */}
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/10 border border-green-500/20 flex items-center justify-center mb-5 shadow-lg shadow-green-500/10">
            <Languages size={26} className="text-green-400" />
          </div>

          {/* Title */}
          <h2 className="font-display font-black text-xl text-white mb-1">বাংলায় দেখুন?</h2>
          <p className="text-sm text-white/50 mb-1">Do you want to view this website in <span className="text-white/80 font-semibold">Bangla</span>?</p>
          <p className="text-xs text-white/30 mb-6">আপনি কি এই ওয়েবসাইটটি বাংলায় দেখতে চান?</p>

          {/* Buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleYes}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-green-500/20"
            >
              <Globe size={16} />
              হ্যাঁ, বাংলায় দেখুন — Yes, Translate
            </button>
            <button
              onClick={handleNo}
              className="w-full py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/60 hover:text-white font-semibold text-sm transition-all"
            >
              No, keep in English
            </button>
          </div>

          {/* Note */}
          <p className="text-[10px] text-white/20 text-center mt-4 uppercase tracking-widest">
            Powered by Google Translate
          </p>
        </div>
      </div>
    </>
  );
}

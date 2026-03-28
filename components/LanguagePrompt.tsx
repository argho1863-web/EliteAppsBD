'use client';
import { useState, useEffect } from 'react';
import { X, Languages } from 'lucide-react';

function getCookie(name: string) {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

function setTranslateCookies(langPair: string) {
  // Set on root domain and current path
  document.cookie = `googtrans=${langPair}; path=/`;
  document.cookie = `googtrans=${langPair}; path=/; domain=${window.location.hostname}`;
}

function clearTranslateCookies() {
  const past = 'Thu, 01 Jan 1970 00:00:01 GMT';
  document.cookie = `googtrans=; expires=${past}; path=/`;
  document.cookie = `googtrans=; expires=${past}; path=/; domain=${window.location.hostname}`;
}

export default function LanguagePrompt() {
  const [show, setShow] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    // Reset translation cookie on every visit (new page load)
    clearTranslateCookies();

    // Inject the hidden Google Translate element (needed to activate)
    injectGoogleTranslateScript();

    // Show prompt after 800ms delay
    const answered = sessionStorage.getItem('langPromptAnswered');
    if (!answered) {
      const t = setTimeout(() => setShow(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  function injectGoogleTranslateScript() {
    if (document.getElementById('google-translate-script')) return;

    (window as any).googleTranslateElementInit = () => {
      new (window as any).google.translate.TranslateElement(
        { pageLanguage: 'en', includedLanguages: 'bn', autoDisplay: false },
        'google_translate_element'
      );
    };

    const script = document.createElement('script');
    script.id = 'google-translate-script';
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.head.appendChild(script);
  }

  function handleYes() {
    // Set Google Translate cookie to Bengali then reload
    setTranslateCookies('/en/bn');
    sessionStorage.setItem('langPromptAnswered', 'yes');
    dismiss(() => window.location.reload());
  }

  function handleNo() {
    clearTranslateCookies();
    sessionStorage.setItem('langPromptAnswered', 'no');
    dismiss();
  }

  function dismiss(callback?: () => void) {
    setClosing(true);
    setTimeout(() => {
      setShow(false);
      callback?.();
    }, 350);
  }

  return (
    <>
      {/* Hidden Google Translate widget container */}
      <div id="google_translate_element" className="hidden" style={{ display: 'none' }} />

      {/* Hide the ugly Google Translate bar */}
      <style>{`
        .goog-te-banner-frame.skiptranslate,
        .goog-te-banner-frame,
        #goog-gt-tt,
        .goog-tooltip,
        .goog-tooltip:hover,
        .goog-text-highlight {
          display: none !important;
          visibility: hidden !important;
        }
        body {
          top: 0 !important;
          position: static !important;
        }
        .skiptranslate {
          display: none !important;
        }
      `}</style>

      {show && (
        <>
          {/* Backdrop */}
          <div
            className={`fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4 transition-all duration-350 ${
              closing ? 'opacity-0' : 'opacity-100'
            }`}
            style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
            onClick={handleNo}
          >
            {/* Modal */}
            <div
              className={`relative w-full max-w-sm rounded-3xl border border-white/10 p-7 shadow-2xl shadow-black/70 transition-all duration-350 ${
                closing ? 'translate-y-10 opacity-0 scale-95' : 'translate-y-0 opacity-100 scale-100'
              }`}
              style={{ background: 'linear-gradient(135deg, #0f172a 60%, #1e1b4b 100%)' }}
              onClick={e => e.stopPropagation()}
            >
              {/* Close */}
              <button
                onClick={handleNo}
                className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-white/30 hover:text-white transition-all"
              >
                <X size={13} />
              </button>

              {/* Icon */}
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 shadow-lg"
                style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(16,185,129,0.1))', border: '1px solid rgba(34,197,94,0.25)' }}>
                <Languages size={26} className="text-emerald-400" />
              </div>

              {/* Text */}
              <h2 className="font-display font-black text-xl text-white mb-1">বাংলায় দেখুন?</h2>
              <p className="text-sm text-white/50 mb-1">
                Do you want to view this website in{' '}
                <span className="text-white/80 font-semibold">Bangla</span>?
              </p>
              <p className="text-xs text-white/30 mb-6">
                আপনি কি এই ওয়েবসাইটটি বাংলায় দেখতে চান?
              </p>

              {/* Buttons */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleYes}
                  className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-500/20"
                  style={{ background: 'linear-gradient(135deg, #22c55e, #10b981)', color: 'white' }}
                >
                  <Languages size={16} />
                  হ্যাঁ — Yes, Translate to Bangla
                </button>
                <button
                  onClick={handleNo}
                  className="w-full py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/50 hover:text-white/80 font-semibold text-sm transition-all"
                >
                  No, keep in English
                </button>
              </div>

              <p className="text-[10px] text-white/15 text-center mt-4 uppercase tracking-widest">
                Powered by Google Translate
              </p>
            </div>
          </div>
        </>
      )}
    </>
  );
}

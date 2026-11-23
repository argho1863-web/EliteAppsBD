'use client';
import { useState, useEffect, useRef } from 'react';
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
  const yesRef = useRef<HTMLButtonElement>(null);

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

  // Focus moves into the dialog when it opens; Escape means "no thanks"
  useEffect(() => {
    if (!show) return;
    yesRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleNo(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

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
      setClosing(false);
      callback?.();
    }, 260);
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

      {/* Always mounted so it can fade out as well as in; the shared drawer classes handle the timing and reduced motion */}
      <div
        className="drawer-backdrop fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
        style={{ background: 'rgba(0,0,0,0.6)' }}
        data-open={show && !closing}
        onClick={handleNo}
      >
        <div
          role="dialog" aria-modal="true" aria-labelledby="lang-title" aria-hidden={!show || closing}
          className="drawer-panel relative w-full max-w-sm rounded-2xl border border-white/10 bg-brand-navy-3 p-7"
          style={{ boxShadow: 'var(--depth-2)' }}
          data-open={show && !closing}
          onClick={e => e.stopPropagation()}
        >
          <button onClick={handleNo} aria-label="Close and keep English"
            className="absolute top-2 right-2 w-11 h-11 rounded-full flex items-center justify-center text-white/55 hover:text-white hover:bg-white/10 active:scale-90 transition-[color,background-color,transform] duration-150">
            <X size={16} />
          </button>

          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 bg-brand-gold/10 border border-brand-gold/25">
            <Languages size={26} className="text-brand-gold" />
          </div>

          <h2 id="lang-title" className="font-display font-semibold text-xl text-white mb-1">বাংলায় দেখুন?</h2>
          <p className="text-sm text-white/70 mb-1">
            Do you want to view this website in <span className="text-white font-semibold">Bangla</span>?
          </p>
          <p className="text-xs text-white/55 mb-6">আপনি কি এই ওয়েবসাইটটি বাংলায় দেখতে চান?</p>

          <div className="flex flex-col gap-3">
            <button ref={yesRef} onClick={handleYes}
              className="btn-gold w-full min-h-[48px] py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2">
              <Languages size={16} />
              হ্যাঁ — Yes, translate to Bangla
            </button>
            <button onClick={handleNo}
              className="w-full min-h-[48px] py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 hover:text-white font-medium text-sm active:scale-[0.98] transition-[color,background-color,transform] duration-150">
              No, keep in English
            </button>
          </div>

          <p className="text-xs text-white/55 text-center mt-4">Translation by Google Translate</p>
        </div>
      </div>
    </>
  );
}

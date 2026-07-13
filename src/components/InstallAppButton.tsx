import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../context/LanguageContext';

declare global {
  interface Window {
    __deferredInstallPrompt?: any;
  }
}

function isIos() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window as any).MSStream;
}

function isInStandaloneMode() {
  return (
    ('standalone' in navigator && (navigator as any).standalone === true) ||
    window.matchMedia('(display-mode: standalone)').matches
  );
}

// ── Small centered popup (fixed, never overflows) ─────────────────────────────
const IosPopup = ({ onClose, t }: { onClose: () => void; t: (fr: string, en: string) => string }) => {
  // Close on scroll anywhere on the page
  useEffect(() => {
    const onScroll = () => onClose();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [onClose]);

  return (
    <>
      {/* Semi-transparent backdrop — click anywhere outside the card to close */}
      <div
        className="fixed inset-0 z-[9998] bg-black/20 backdrop-blur-[0.5px]"
        onClick={onClose}
      />

      {/* Popup card — centered horizontally, near bottom of screen where Safari controls are */}
      <div
        className="fixed bottom-[calc(80px+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-[9999] w-[min(290px,calc(100vw-32px))]
                   bg-[#2A2118] text-[#FAF7F4] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.35)] p-4"
        style={{ animation: 'iosPopupIn 0.22s cubic-bezier(0.22,1,0.36,1) forwards' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Small arrow pointing down toward the Safari Share button */}
        <div className="absolute -bottom-[6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-[#2A2118] rotate-45 rounded-sm" />

        {/* Title */}
        <p className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-[#FAF7F4]/40 mb-3 text-center">
          {t("Installer sur iPhone", "Install on iPhone")}
        </p>

        {/* Steps */}
        <ol className="space-y-2.5 mb-3.5">
          {[
            {
              step: '1',
              text: t("Appuie sur ↑ en bas de Safari", "Tap ↑ at the bottom of Safari"),
            },
            {
              step: '2',
              text: t("Choisis \"Sur l'écran d'accueil\"", "Choose \"Add to Home Screen\""),
            },
            {
              step: '3',
              text: t("Appuie sur \"Ajouter\"", "Tap \"Add\""),
            },
          ].map((item) => (
            <li key={item.step} className="flex items-start gap-2.5">
              <span className="flex-shrink-0 w-4 h-4 rounded-full bg-[#FAF7F4]/10 text-[#FAF7F4]/70 text-[9px] font-bold flex items-center justify-center mt-0.5">
                {item.step}
              </span>
              <span className="font-sans text-[12.5px] text-[#FAF7F4]/85 leading-snug">{item.text}</span>
            </li>
          ))}
        </ol>

        {/* Close link */}
        <button
          onClick={onClose}
          className="w-full text-center font-sans text-[10px] font-bold uppercase tracking-[0.18em] text-[#FAF7F4]/30 hover:text-[#FAF7F4]/60 transition-colors cursor-pointer pt-2 border-t border-[#FAF7F4]/10"
        >
          {t("Fermer", "Close")}
        </button>
      </div>

      <style>{`
        @keyframes iosPopupIn {
          from { opacity: 0; transform: translateX(-50%) translateY(12px) scale(0.97); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0)      scale(1);    }
        }
      `}</style>
    </>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
export const InstallAppButton = ({ variant = 'default' }: { variant?: 'default' | 'subtle' }) => {
  const { t } = useLanguage();
  const [canInstall, setCanInstall] = useState(false);
  const [isIosDevice, setIsIosDevice] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [installed, setInstalled] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isInStandaloneMode()) return;

    const ios = isIos();
    setIsIosDevice(ios);

    if (ios) {
      setCanInstall(true);
    } else {
      if (window.__deferredInstallPrompt) setCanInstall(true);
      const onReady = () => setCanInstall(true);
      const onInstalled = () => { setInstalled(true); setCanInstall(false); };
      window.addEventListener('pwainstallready', onReady);
      window.addEventListener('pwainstalled', onInstalled);
      return () => {
        window.removeEventListener('pwainstallready', onReady);
        window.removeEventListener('pwainstalled', onInstalled);
      };
    }
  }, []);

  const handleInstall = async () => {
    if (isIosDevice) {
      setShowPopup(v => !v);
      return;
    }
    const prompt = window.__deferredInstallPrompt;
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') {
      window.__deferredInstallPrompt = undefined;
      setInstalled(true);
      setCanInstall(false);
    }
  };

  if (!canInstall || installed) return null;

  return (
    <>
      <button
        ref={btnRef}
        id="pwa-install-btn"
        onClick={handleInstall}
        title={t("Ajouter à l'écran d'accueil", "Add to Home Screen")}
        aria-label={t("Installer l'application Yucca", "Install Yucca app")}
        className={`
          group inline-flex items-center gap-2 cursor-pointer select-none self-start
          transition-all duration-300
          ${variant === 'subtle'
            ? 'px-3.5 py-2 rounded-full border border-[#2e4b3d]/20 bg-[#FAF7F4]/80 hover:bg-[#2e4b3d] hover:border-[#2e4b3d] hover:text-[#FAF7F4] text-[#2e4b3d] text-[10px] font-sans font-bold uppercase tracking-[0.18em] shadow-sm hover:shadow-md'
            : 'px-4 py-2.5 rounded-full border border-[#2e4b3d]/20 bg-[#FAF7F4] hover:bg-[#2e4b3d] hover:border-[#2e4b3d] hover:text-[#FAF7F4] text-[#2e4b3d] text-[10px] font-sans font-bold uppercase tracking-[0.18em] shadow-[0_2px_10px_rgba(46,75,61,0.1)] hover:shadow-md'
          }
        `}
      >
        <svg className="w-3.5 h-3.5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
          <line x1="12" y1="18" x2="12.01" y2="18" />
        </svg>
        <span>{t("App mobile", "Mobile App")}</span>
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-60" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current" />
        </span>
      </button>

      {/* iOS guide popup — centered, auto-closes on scroll/outside click */}
      {showPopup && isIosDevice && createPortal(
        <IosPopup onClose={() => setShowPopup(false)} t={t} />,
        document.body
      )}
    </>
  );
};

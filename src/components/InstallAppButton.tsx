import { useState, useEffect } from 'react';
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

// ── iOS Bottom Sheet Guide ────────────────────────────────────────────────────
const IosBottomSheet = ({ onClose, t }: { onClose: () => void; t: (fr: string, en: string) => string }) => (
  <>
    {/* Backdrop */}
    <div
      className="fixed inset-0 z-[9998] bg-black/40 backdrop-blur-[2px]"
      style={{ animation: 'iosBackdropIn 0.25s ease-out forwards' }}
      onClick={onClose}
    />

    {/* Sheet */}
    <div
      className="fixed bottom-0 left-0 right-0 z-[9999] bg-[#FAF7F4] rounded-t-[28px] shadow-[0_-8px_40px_rgba(0,0,0,0.18)] px-6 pt-5 pb-[max(28px,env(safe-area-inset-bottom))]"
      style={{ animation: 'iosSheetUp 0.32s cubic-bezier(0.32, 0.94, 0.6, 1) forwards' }}
    >
      {/* Handle bar */}
      <div className="w-9 h-1 bg-[#2e4b3d]/20 rounded-full mx-auto mb-5" />

      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-[#2e4b3d] flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-[#FAF7F4]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
            <line x1="12" y1="18" x2="12.01" y2="18" />
          </svg>
        </div>
        <div>
          <p className="font-sans font-bold text-[15px] text-[#2A2118] leading-tight">
            {t("Installer l'app Yucca", "Install Yucca App")}
          </p>
          <p className="font-sans text-[12px] text-[#56423c]/60 leading-tight mt-0.5">
            {t("Accès rapide depuis l'écran d'accueil", "Quick access from your home screen")}
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-[#2e4b3d]/8 mb-5" />

      {/* Steps */}
      <ol className="space-y-4 mb-6">
        {[
          {
            num: '1',
            label: t("Ouvrir le menu Partager", "Open the Share menu"),
            detail: t("Appuie sur l'icône ↑ en bas de Safari", "Tap the ↑ icon at the bottom of Safari"),
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5 text-[#2e4b3d]">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            ),
          },
          {
            num: '2',
            label: t('"Sur l\'écran d\'accueil"', '"Add to Home Screen"'),
            detail: t("Fais défiler vers le bas et sélectionne l'option", "Scroll down and tap that option"),
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5 text-[#2e4b3d]">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18M3 6h18M3 18h18" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 9l3 3-3 3" />
              </svg>
            ),
          },
          {
            num: '3',
            label: t('Appuie sur "Ajouter"', 'Tap "Add"'),
            detail: t("L'icône Yucca apparaîtra sur ton écran", "The Yucca icon will appear on your screen"),
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5 text-[#2e4b3d]">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ),
          },
        ].map((step) => (
          <li key={step.num} className="flex items-start gap-3.5">
            <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-[#2e4b3d]/8 flex items-center justify-center mt-0.5">
              {step.icon}
            </div>
            <div className="flex-grow min-w-0">
              <p className="font-sans font-semibold text-[14px] text-[#2A2118] leading-snug">{step.label}</p>
              <p className="font-sans text-[12px] text-[#56423c]/60 leading-snug mt-0.5">{step.detail}</p>
            </div>
          </li>
        ))}
      </ol>

      {/* Close button */}
      <button
        onClick={onClose}
        className="w-full py-3.5 bg-[#2A2118] text-[#FAF7F4] rounded-xl font-sans text-[12px] font-bold uppercase tracking-[0.15em] active:scale-[0.98] transition-transform cursor-pointer"
      >
        {t("Compris !", "Got it!")}
      </button>
    </div>

    <style>{`
      @keyframes iosBackdropIn {
        from { opacity: 0; }
        to   { opacity: 1; }
      }
      @keyframes iosSheetUp {
        from { transform: translateY(100%); opacity: 0.6; }
        to   { transform: translateY(0);    opacity: 1; }
      }
    `}</style>
  </>
);

// ── Main Component ─────────────────────────────────────────────────────────────
export const InstallAppButton = ({ variant = 'default' }: { variant?: 'default' | 'subtle' }) => {
  const { t } = useLanguage();
  const [canInstall, setCanInstall] = useState(false);
  const [isIosDevice, setIsIosDevice] = useState(false);
  const [showIosSheet, setShowIosSheet] = useState(false);
  const [installed, setInstalled] = useState(false);

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
      setShowIosSheet(true);
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
        id="pwa-install-btn"
        onClick={handleInstall}
        title={t("Ajouter à l'écran d'accueil", "Add to Home Screen")}
        aria-label={t("Installer l'application Yucca", "Install Yucca app")}
        className={`
          group inline-flex items-center gap-2 cursor-pointer select-none
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

      {/* iOS guide — full-screen bottom sheet, never overflows */}
      {showIosSheet && isIosDevice && (
        <IosBottomSheet onClose={() => setShowIosSheet(false)} t={t} />
      )}
    </>
  );
};

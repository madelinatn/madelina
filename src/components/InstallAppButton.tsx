import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

// Extend Window type to include our deferred prompt property
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

export const InstallAppButton = ({ variant = 'default' }: { variant?: 'default' | 'subtle' }) => {
  const { t } = useLanguage();
  const [canInstall, setCanInstall] = useState(false);
  const [isIosDevice, setIsIosDevice] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Don't show if already installed as PWA
    if (isInStandaloneMode()) return;

    const ios = isIos();
    setIsIosDevice(ios);

    if (ios) {
      // iOS: show button to guide user through Safari share sheet
      setCanInstall(true);
    } else {
      // Android / Desktop: use the deferred prompt
      if (window.__deferredInstallPrompt) {
        setCanInstall(true);
      }
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
      setShowIosGuide(v => !v);
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

  const isSubtle = variant === 'subtle';

  return (
    <>
      <div className={`relative ${isSubtle ? 'inline-flex' : 'inline-flex'}`}>
        <button
          id="pwa-install-btn"
          onClick={handleInstall}
          title={t("Ajouter à l'écran d'accueil", "Add to Home Screen")}
          aria-label={t("Installer l'application Yucca", "Install Yucca app")}
          className={`
            group flex items-center gap-2 cursor-pointer select-none
            transition-all duration-300
            ${isSubtle
              ? 'px-3.5 py-2 rounded-full border border-[#2e4b3d]/20 bg-[#FAF7F4]/80 hover:bg-[#2e4b3d] hover:border-[#2e4b3d] hover:text-[#FAF7F4] text-[#2e4b3d] text-[10px] font-sans font-bold uppercase tracking-[0.18em] shadow-sm hover:shadow-md backdrop-blur-sm'
              : 'px-4 py-2.5 rounded-full border border-[#2e4b3d]/20 bg-[#FAF7F4] hover:bg-[#2e4b3d] hover:border-[#2e4b3d] hover:text-[#FAF7F4] text-[#2e4b3d] text-[10px] font-sans font-bold uppercase tracking-[0.18em] shadow-[0_2px_10px_rgba(46,75,61,0.1)] hover:shadow-md'
            }
          `}
        >
          {/* Phone icon */}
          <svg
            className="w-3.5 h-3.5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
            <line x1="12" y1="18" x2="12.01" y2="18" />
          </svg>
          <span>{t("App mobile", "Mobile App")}</span>
          {/* Pulse indicator */}
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-60" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current" />
          </span>
        </button>

        {/* iOS step-by-step guide tooltip */}
        {showIosGuide && isIosDevice && (
          <div
            className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 z-[9999] w-64 bg-[#2A2118] text-[#FAF7F4] rounded-2xl shadow-2xl p-4 text-left"
            style={{ animation: 'fadeInUp 0.22s cubic-bezier(0.22,1,0.36,1)' }}
          >
            {/* Arrow */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#2A2118] rotate-45 rounded-sm" />
            
            <p className="font-sans text-[11px] font-bold uppercase tracking-widest text-[#FAF7F4]/50 mb-3">
              {t("Installer sur iPhone", "Install on iPhone")}
            </p>

            <ol className="space-y-2.5">
              {[
                {
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4 flex-shrink-0 text-[#FAF7F4]/70">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  ),
                  text: t("Appuie sur l'icône Partager", "Tap the Share icon"),
                },
                {
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4 flex-shrink-0 text-[#FAF7F4]/70">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  ),
                  text: t("Choisis \"Sur l'écran d'accueil\"", "Choose \"Add to Home Screen\""),
                },
                {
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4 flex-shrink-0 text-[#FAF7F4]/70">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ),
                  text: t("Appuie sur \"Ajouter\"", "Tap \"Add\""),
                },
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#FAF7F4]/10 flex items-center justify-center mt-0.5">
                    {step.icon}
                  </div>
                  <span className="font-sans text-[12px] text-[#FAF7F4]/85 leading-snug">{step.text}</span>
                </li>
              ))}
            </ol>

            <button
              onClick={() => setShowIosGuide(false)}
              className="mt-3 w-full text-center font-sans text-[10px] font-bold uppercase tracking-widest text-[#FAF7F4]/40 hover:text-[#FAF7F4]/70 transition-colors cursor-pointer"
            >
              {t("Fermer", "Close")}
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateX(-50%) translateY(6px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </>
  );
};

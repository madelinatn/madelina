import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

// Inline PWA install button for admin — icon only, bottom sheet guide
const AdminInstallButton = () => {
  const [canInstall, setCanInstall] = useState(false);
  const [showSheet, setShowSheet] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    const standalone =
      ('standalone' in navigator && (navigator as any).standalone === true) ||
      window.matchMedia('(display-mode: standalone)').matches;
    if (standalone) return;

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIos(ios);

    if (ios) {
      setCanInstall(true);
    } else {
      const w = window as any;
      if (w.__deferredInstallPrompt) setCanInstall(true);
      const onReady = () => setCanInstall(true);
      const onInstalled = () => setCanInstall(false);
      window.addEventListener('pwainstallready', onReady);
      window.addEventListener('pwainstalled', onInstalled);
      return () => {
        window.removeEventListener('pwainstallready', onReady);
        window.removeEventListener('pwainstalled', onInstalled);
      };
    }
  }, []);

  const handleInstall = async () => {
    if (isIos) { setShowSheet(true); return; }
    const w = window as any;
    if (!w.__deferredInstallPrompt) return;
    w.__deferredInstallPrompt.prompt();
    const { outcome } = await w.__deferredInstallPrompt.userChoice;
    if (outcome === 'accepted') {
      w.__deferredInstallPrompt = null;
      setCanInstall(false);
    }
  };

  if (!canInstall) return null;

  return (
    <>
      {/* Icon-only button — no text to get cramped */}
      <button
        id="admin-pwa-install-btn"
        onClick={handleInstall}
        title="Installer l'app"
        aria-label="Installer l'application Yucca"
        className="relative flex items-center justify-center w-8 h-8 rounded-full border border-[#FAF7F4]/15 text-[#FAF7F4]/60 hover:text-[#FAF7F4] hover:border-[#FAF7F4]/30 transition-all duration-200 cursor-pointer flex-shrink-0"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
          <line x1="12" y1="18" x2="12.01" y2="18" />
        </svg>
        {/* Pulse dot */}
        <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FAF7F4] opacity-40" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FAF7F4]/70" />
        </span>
      </button>

      {/* iOS guide — fixed bottom sheet, covers full screen safely */}
      {showSheet && isIos && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[9998] bg-black/40 backdrop-blur-[2px]"
            onClick={() => setShowSheet(false)}
            style={{ animation: 'adminBackdropIn 0.25s ease-out forwards' }}
          />
          {/* Sheet */}
          <div
            className="fixed bottom-0 left-0 right-0 z-[9999] bg-[#FAF7F4] rounded-t-[28px] shadow-[0_-8px_40px_rgba(0,0,0,0.2)] px-6 pt-5 pb-[max(28px,env(safe-area-inset-bottom))]"
            style={{ animation: 'adminSheetUp 0.32s cubic-bezier(0.32,0.94,0.6,1) forwards' }}
          >
            {/* Handle */}
            <div className="w-9 h-1 bg-[#2A2118]/15 rounded-full mx-auto mb-5" />

            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[#2A2118] flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-[#FAF7F4]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                  <line x1="12" y1="18" x2="12.01" y2="18" />
                </svg>
              </div>
              <div>
                <p className="font-sans font-bold text-[15px] text-[#2A2118]">Installer l'app Admin</p>
                <p className="font-sans text-[12px] text-[#56423c]/60 mt-0.5">Accès rapide depuis l'écran d'accueil</p>
              </div>
            </div>

            <div className="h-px bg-[#2e4b3d]/8 mb-5" />

            {/* Steps */}
            <ol className="space-y-4 mb-6">
              {[
                {
                  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5 text-[#2A2118]"><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>,
                  label: "Appuie sur ↑ Partager",
                  detail: "Bouton en bas de Safari",
                },
                {
                  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5 text-[#2A2118]"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>,
                  label: '"Sur l\'écran d\'accueil"',
                  detail: "Fais défiler dans le menu Partager",
                },
                {
                  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5 text-[#2A2118]"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>,
                  label: "Appuie sur \"Ajouter\"",
                  detail: "L'icône apparaîtra sur ton écran",
                },
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3.5">
                  <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-[#2A2118]/8 flex items-center justify-center mt-0.5">
                    {step.icon}
                  </div>
                  <div>
                    <p className="font-sans font-semibold text-[14px] text-[#2A2118]">{step.label}</p>
                    <p className="font-sans text-[12px] text-[#56423c]/60 mt-0.5">{step.detail}</p>
                  </div>
                </li>
              ))}
            </ol>

            <button
              onClick={() => setShowSheet(false)}
              className="w-full py-3.5 bg-[#2A2118] text-[#FAF7F4] rounded-xl font-sans text-[12px] font-bold uppercase tracking-[0.15em] active:scale-[0.98] transition-transform cursor-pointer"
            >
              Compris !
            </button>
          </div>

          <style>{`
            @keyframes adminBackdropIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes adminSheetUp { from { transform: translateY(100%); opacity: 0.6; } to { transform: translateY(0); opacity: 1; } }
          `}</style>
        </>
      )}
    </>
  );
};

const AdminPortalPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Check auth status — redirect to login if not authenticated
  useEffect(() => {
    document.title = 'Portal Admin — Café Yucca';
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/admin/franchise');
        if (res.ok) {
          setIsLoggedIn(true);
        } else {
          navigate('/admin-login', { replace: true });
        }
      } catch {
        navigate('/admin-login', { replace: true });
      }
      setCheckingAuth(false);
    };
    checkAuth();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    navigate('/admin-login', { replace: true });
  };

  if (checkingAuth || !isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#FAF7F4] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#2e4b3d]/20 border-t-[#2e4b3d] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F4] flex flex-col">
      {/* Top Bar */}
      <header className="bg-[#2A2118] text-[#FAF7F4] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full overflow-hidden bg-[#FAF7F4] flex items-center justify-center flex-shrink-0">
              <img src="/logos/logo1.svg" alt="" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-sans text-sm font-bold tracking-widest uppercase text-[#FAF7F4]">YUCCA</span>
              <span className="font-sans text-[10px] font-medium tracking-wider text-[#FAF7F4]/55 uppercase">Dashboard Admin</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <a
              href="/"
              className="font-sans text-[10px] sm:text-xs text-[#FAF7F4]/60 hover:text-[#FAF7F4] transition-colors uppercase tracking-wider whitespace-nowrap"
            >
              {t("Voir le site", "View site")}
            </a>
            <AdminInstallButton />
            <button
              onClick={handleLogout}
              className="font-sans text-[10px] sm:text-xs text-[#FAF7F4]/60 hover:text-red-400 transition-colors uppercase tracking-wider cursor-pointer whitespace-nowrap"
            >
              {t("Déconnexion", "Logout")}
            </button>
          </div>
        </div>
      </header>

      {/* ── Tab Navigation ── */}
      <div className="hidden sm:block admin-tab-nav">
        <div className="admin-tab-nav-container">
          <button className="admin-tab-item active">
            <span className="material-symbols-outlined">apps</span>
            Portail
          </button>
          <a
            href="/admin-franchise"
            className="admin-tab-item"
          >
            <span className="material-symbols-outlined">assignment</span>
            Franchise
          </a>
          <a
            href="/admin-menu/#orders"
            className="admin-tab-item"
          >
            <span className="material-symbols-outlined">shopping_cart</span>
            Commandes
          </a>
          <a
            href="/admin-menu/"
            className="admin-tab-item"
          >
            <span className="material-symbols-outlined">restaurant_menu</span>
            Menu
          </a>
          <a
            href="/admin-menu/#menu-pdf"
            className="admin-tab-item"
          >
            <span className="material-symbols-outlined">picture_as_pdf</span>
            Menu PDF
          </a>
        </div>
      </div>

      {/* Main Grid */}
      <main className="flex-grow flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="font-sans text-3xl md:text-4xl text-[#2A2118] font-light tracking-tight mb-3">
              Que souhaitez-vous gérer ?
            </h2>
            <p className="font-sans text-sm text-[#56423c]">
              Sélectionnez un module d'administration ci-dessous.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Menu Admin Card */}
            <a
              href="/admin-menu/"
              className="bg-white border border-[#bdc3b9]/30 p-8 md:p-10 shadow-sm hover:shadow-xl hover:border-[#7c441f]/30 hover:-translate-y-1.5 hover:scale-[1.01] transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="w-14 h-14 bg-[#7c441f]/10 text-[#7c441f] rounded-full flex items-center justify-center mb-8 group-hover:bg-[#7c441f] group-hover:text-white transition-colors duration-300">
                  <span className="material-symbols-outlined text-3xl">restaurant_menu</span>
                </div>
                <h3 className="font-sans text-2xl font-light text-[#2A2118] tracking-tight mb-4">
                  Gestion du Menu
                </h3>
                <p className="font-sans text-sm text-[#56423c] leading-relaxed opacity-80">
                  Ajouter, modifier ou masquer des plats. Gérer les catégories, les prix, les descriptions et les images des plats.
                </p>
              </div>
              <div className="mt-8 flex items-center gap-2 font-sans text-xs font-bold uppercase tracking-wider text-[#7c441f]">
                Accéder au Menu
                <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </div>
            </a>

            {/* Orders Admin Card */}
            <a
              href="/admin-menu/#orders"
              className="bg-white border border-[#bdc3b9]/30 p-8 md:p-10 shadow-sm hover:shadow-xl hover:border-[#966b4d]/30 hover:-translate-y-1.5 hover:scale-[1.01] transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="w-14 h-14 bg-[#966b4d]/10 text-[#966b4d] rounded-full flex items-center justify-center mb-8 group-hover:bg-[#966b4d] group-hover:text-white transition-colors duration-300">
                  <span className="material-symbols-outlined text-3xl">shopping_cart</span>
                </div>
                <h3 className="font-sans text-2xl font-light text-[#2A2118] tracking-tight mb-4">
                  Commandes Clients
                </h3>
                <p className="font-sans text-sm text-[#56423c] leading-relaxed opacity-80">
                  Suivre et préparer les commandes des clients en temps réel. Mettre à jour les statuts de préparation et de service.
                </p>
              </div>
              <div className="mt-8 flex items-center gap-2 font-sans text-xs font-bold uppercase tracking-wider text-[#966b4d]">
                Voir les Commandes
                <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </div>
            </a>

            {/* Franchise Admin Card */}
            <a
              href="/admin-franchise/"
              className="bg-white border border-[#bdc3b9]/30 p-8 md:p-10 shadow-sm hover:shadow-xl hover:border-[#2e4b3d]/30 hover:-translate-y-1.5 hover:scale-[1.01] transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="w-14 h-14 bg-[#2e4b3d]/10 text-[#2e4b3d] rounded-full flex items-center justify-center mb-8 group-hover:bg-[#2e4b3d] group-hover:text-white transition-colors duration-300">
                  <span className="material-symbols-outlined text-3xl">assignment</span>
                </div>
                <h3 className="font-sans text-2xl font-light text-[#2A2118] tracking-tight mb-4">
                  Demandes de Franchise
                </h3>
                <p className="font-sans text-sm text-[#56423c] leading-relaxed opacity-80">
                  Consulter et traiter les candidatures de franchise. Mettre à jour les statuts de suivi (Nouveau, Contacté, Approuvé, Refusé) et gérer les fiches.
                </p>
              </div>
              <div className="mt-8 flex items-center gap-2 font-sans text-xs font-bold uppercase tracking-wider text-[#2e4b3d]">
                Accéder aux Franchises
                <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </div>
            </a>

            {/* Menu PDF Card */}
            <a
              href="/admin-menu/#menu-pdf"
              className="bg-white border border-[#bdc3b9]/30 p-8 shadow-sm hover:shadow-xl hover:border-[#7c441f]/30 hover:-translate-y-1.5 hover:scale-[1.01] transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="w-14 h-14 bg-[#7c441f]/10 text-[#7c441f] rounded-full flex items-center justify-center mb-8 group-hover:bg-[#7c441f] group-hover:text-white transition-colors duration-300">
                  <span className="material-symbols-outlined text-3xl">picture_as_pdf</span>
                </div>
                <h3 className="font-sans text-2xl font-light text-[#2A2118] tracking-tight mb-4">
                  Menu PDF
                </h3>
                <p className="font-sans text-sm text-[#56423c] leading-relaxed opacity-80">
                  Générer et imprimer la carte du restaurant au format PDF avec le logo et les couleurs du site.
                </p>
              </div>
              <div className="mt-8 flex items-center gap-2 font-sans text-xs font-bold uppercase tracking-wider text-[#7c441f]">
                Générer le PDF
                <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </div>
            </a>
          </div>
        </div>
      </main>

      <footer className="py-6 border-t border-[#bdc3b9]/20 bg-white">
        <p className="text-center font-sans text-xs text-[#56423c]/50">
          &copy; {new Date().getFullYear()} Café Yucca. Tous droits réservés.
        </p>
      </footer>
    </div>
  );
};

export default AdminPortalPage;

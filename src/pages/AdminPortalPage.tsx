import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

// Small iOS popup for admin (auto-closes on scroll / outside click)
const AdminIosPopup = ({ onClose }: { onClose: () => void }) => {
  useEffect(() => {
    const onScroll = () => onClose();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [onClose]);

  return (
    <>
      {/* Invisible backdrop */}
      <div className="fixed inset-0 z-[9998]" onClick={onClose} />

      {/* Small centered popup */}
      <div
        className="fixed top-[72px] left-1/2 -translate-x-1/2 z-[9999] w-[min(290px,calc(100vw-32px))]
                   bg-[#FAF7F4] text-[#2A2118] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.18)] p-4
                   border border-[#2e4b3d]/8"
        style={{ animation: 'adminPopupIn 0.22s cubic-bezier(0.22,1,0.36,1) forwards' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Arrow up */}
        <div className="absolute -top-[7px] left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-[#FAF7F4] rotate-45 rounded-sm border-l border-t border-[#2e4b3d]/8" />

        <p className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-[#56423c]/40 mb-3 text-center">
          Installer sur iPhone
        </p>

        <ol className="space-y-2.5 mb-3.5">
          {[
            "Appuie sur ↑ en bas de Safari",
            "Choisis \"Sur l'écran d'accueil\"",
            "Appuie sur \"Ajouter\"",
          ].map((text, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span className="flex-shrink-0 w-4 h-4 rounded-full bg-[#2A2118]/8 text-[#2A2118]/60 text-[9px] font-bold flex items-center justify-center mt-0.5">
                {i + 1}
              </span>
              <span className="font-sans text-[12.5px] text-[#2A2118]/80 leading-snug">{text}</span>
            </li>
          ))}
        </ol>

        <button
          onClick={onClose}
          className="w-full text-center font-sans text-[10px] font-bold uppercase tracking-[0.18em] text-[#56423c]/30 hover:text-[#56423c]/60 transition-colors cursor-pointer pt-2 border-t border-[#2e4b3d]/8"
        >
          Fermer
        </button>
      </div>

      <style>{`
        @keyframes adminPopupIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-6px) scale(0.97); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0)      scale(1);    }
        }
      `}</style>
    </>
  );
};

// Inline PWA install button for admin — icon only, small popup guide
const AdminInstallButton = () => {
  const [canInstall, setCanInstall] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
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
    if (isIos) { setShowPopup(v => !v); return; }
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
      {/* Icon-only button */}
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
        <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FAF7F4] opacity-40" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FAF7F4]/70" />
        </span>
      </button>

      {showPopup && isIos && (
        <AdminIosPopup onClose={() => setShowPopup(false)} />
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

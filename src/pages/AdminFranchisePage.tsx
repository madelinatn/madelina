import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

interface FranchiseApp {
  id: number;
  full_name: string;
  phone: string;
  email: string;
  zone: string;
  has_local: number;
  message: string | null;
  submitted_at: string;
  status: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  new:       { label: 'Nouveau',   color: 'text-blue-700',   bg: 'bg-blue-50 border-blue-200' },
  contacted: { label: 'Contacté',  color: 'text-amber-700',  bg: 'bg-amber-50 border-amber-200' },
  approved:  { label: 'Approuvé',  color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  rejected:  { label: 'Refusé',    color: 'text-red-700',    bg: 'bg-red-50 border-red-200' },
};

const AdminFranchisePage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [activeTab, setActiveTab] = useState<'franchise' | 'menu'>('franchise');
  const [applications, setApplications] = useState<FranchiseApp[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedApp, setSelectedApp] = useState<FranchiseApp | null>(null);

  // Check if already logged in — redirect to login if not authenticated
  useEffect(() => {
    document.title = 'Admin — Café Yucca';
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

  // Fetch franchise applications
  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/franchise');
      if (res.ok) {
        const data = await res.json() as { applications: FranchiseApp[] };
        setApplications(data.applications);
      }
    } catch (e) {
      console.error('Failed to fetch applications:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn && activeTab === 'franchise') {
      fetchApplications();
    }
  }, [isLoggedIn, activeTab, fetchApplications]);

  const updateStatus = async (id: number, status: string) => {
    try {
      const res = await fetch('/api/admin/franchise', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      if (res.ok) {
        setApplications(prev => prev.map(a => a.id === id ? { ...a, status } : a));
        if (selectedApp?.id === id) setSelectedApp(prev => prev ? { ...prev, status } : null);
      }
    } catch (e) {
      console.error('Failed to update status:', e);
    }
  };

  const deleteApplication = async (id: number) => {
    if (!confirm('Supprimer cette candidature ?')) return;
    try {
      const res = await fetch(`/api/admin/franchise?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setApplications(prev => prev.filter(a => a.id !== id));
        if (selectedApp?.id === id) setSelectedApp(null);
      }
    } catch (e) {
      console.error('Failed to delete application:', e);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr + 'Z');
      return d.toLocaleDateString('fr-TN', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  // ── Loading / redirecting ──
  if (checkingAuth || !isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#FAF7F4] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#2e4b3d]/20 border-t-[#2e4b3d] rounded-full animate-spin" />
      </div>
    );
  }

  // ── Admin Dashboard ──
  return (
    <div className="min-h-screen bg-[#FAF7F4]">
      {/* ── Top Bar ── */}
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
      <div className="admin-tab-nav">
        <div className="admin-tab-nav-container">
          <a
            href="/admin"
            className="admin-tab-item"
          >
            <span className="material-symbols-outlined">apps</span>
            Portail
          </a>
          <button
            className="admin-tab-item active"
          >
            <span className="material-symbols-outlined">assignment</span>
            Franchise
          </button>
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

      {/* ── Content ── */}
      <div className="max-w-7xl mx-auto px-6 py-8">

        {activeTab === 'franchise' && (
          <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="font-sans text-2xl text-[#2A2118] font-light tracking-tight">
                  Demandes de Franchise
                </h2>
                <p className="font-sans text-sm text-[#56423c] mt-1">
                  {applications.length} candidature{applications.length !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={fetchApplications}
                className="flex items-center gap-2 px-4 py-2.5 font-sans text-xs font-bold uppercase tracking-wider text-[#2e4b3d] border border-[#2e4b3d]/20 hover:bg-[#2e4b3d]/5 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">refresh</span>
                Actualiser
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-[#2e4b3d]/20 border-t-[#2e4b3d] rounded-full animate-spin" />
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-20 border border-[#bdc3b9]/30 bg-white">
                <span className="material-symbols-outlined text-5xl text-[#bdc3b9] mb-4 block">inbox</span>
                <p className="font-sans text-[#56423c] text-sm">Aucune candidature pour le moment.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {applications.map(app => {
                  const statusConf = STATUS_CONFIG[app.status] || STATUS_CONFIG.new;
                  return (
                    <div
                      key={app.id}
                      className="bg-white border border-[#bdc3b9]/25 p-5 hover:shadow-md transition-all duration-300 cursor-pointer group animate-fadeIn"
                      onClick={() => setSelectedApp(app)}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1.5">
                            <h3 className="font-sans font-semibold text-[#2A2118] text-[15px] truncate">
                              {app.full_name}
                            </h3>
                            <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${statusConf.bg} ${statusConf.color}`}>
                              {statusConf.label}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 font-sans text-xs text-[#56423c]">
                            <span className="flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-sm text-[#7c441f]">location_on</span>
                              {app.zone}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-sm text-[#7c441f]">phone</span>
                              {app.phone}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-sm text-[#7c441f]">mail</span>
                              {app.email}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className="font-sans text-[11px] text-[#56423c]/60">
                            {formatDate(app.submitted_at)}
                          </span>
                          <span className="material-symbols-outlined text-[#56423c]/30 group-hover:text-[#7c441f] transition-colors">chevron_right</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Detail Modal ── */}
      {selectedApp && (
        <div
          className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4 modal-backdrop-animate"
          onClick={() => setSelectedApp(null)}
        >
          <div
            className="bg-[#FAF7F4] w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[85vh] sm:max-h-[90vh] modal-content-animate"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-[#2A2118] text-[#FAF7F4] px-6 py-5 flex items-center justify-between">
              <div>
                <h3 className="font-sans font-semibold text-lg">{selectedApp.full_name}</h3>
                <span className="text-[10px] text-[#FAF7F4]/60 uppercase tracking-widest block mt-0.5">
                  Reçue le {formatDate(selectedApp.submitted_at)}
                </span>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-[#FAF7F4]/60 hover:text-white transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 text-left">
              {/* Contact Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white border border-[#bdc3b9]/20 rounded">
                  <span className="block text-[10px] font-sans font-semibold uppercase tracking-wider text-[#56423c]/60 mb-1">Téléphone</span>
                  <a href={`tel:${selectedApp.phone}`} className="font-sans text-[#2A2118] hover:text-[#7c441f] font-semibold transition-colors block break-all">
                    {selectedApp.phone}
                  </a>
                </div>
                <div className="p-4 bg-white border border-[#bdc3b9]/20 rounded">
                  <span className="block text-[10px] font-sans font-semibold uppercase tracking-wider text-[#56423c]/60 mb-1">E-mail</span>
                  <a href={`mailto:${selectedApp.email}`} className="font-sans text-[#2A2118] hover:text-[#7c441f] font-semibold transition-colors block break-all">
                    {selectedApp.email}
                  </a>
                </div>
              </div>

              {/* Zone */}
              <div className="p-4 bg-white border border-[#bdc3b9]/20 rounded">
                <span className="block text-[10px] font-sans font-semibold uppercase tracking-wider text-[#56423c]/60 mb-1">Zone souhaitée</span>
                <span className="font-sans text-[#2A2118] font-semibold block">{selectedApp.zone}</span>
              </div>

              {/* Has Local */}
              <div className="p-4 bg-white border border-[#bdc3b9]/20 rounded flex items-center justify-between">
                <div>
                  <span className="block text-[10px] font-sans font-semibold uppercase tracking-wider text-[#56423c]/60 mb-0.5">Emplacement/Local disponible</span>
                  <span className="font-sans text-sm text-[#2A2118]">Le candidat dispose d'un local commercial</span>
                </div>
                <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                  selectedApp.has_local === 1
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {selectedApp.has_local === 1 ? 'Oui' : 'Non'}
                </span>
              </div>

              {/* Message */}
              <div className="p-4 bg-white border border-[#bdc3b9]/20 rounded">
                <span className="block text-[10px] font-sans font-semibold uppercase tracking-wider text-[#56423c]/60 mb-1.5">Message / Motivations</span>
                <p className="font-sans text-sm text-[#56423c] leading-relaxed whitespace-pre-wrap">
                  {selectedApp.message || <span className="italic text-gray-400">Aucun message fourni.</span>}
                </p>
              </div>

              {/* Follow-up Status */}
              <div className="pt-4 border-t border-[#bdc3b9]/20">
                <span className="block text-[10px] font-sans font-semibold uppercase tracking-wider text-[#56423c]/60 mb-3">
                  Suivi de candidature
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Object.entries(STATUS_CONFIG).map(([statusKey, conf]) => (
                    <button
                      key={statusKey}
                      onClick={() => updateStatus(selectedApp.id, statusKey)}
                      className={`px-3 py-2.5 text-xs font-bold uppercase tracking-wider border text-center transition-all duration-300 cursor-pointer ${
                        selectedApp.status === statusKey
                          ? `${conf.bg} ${conf.color} shadow-sm border-current`
                          : 'border-[#bdc3b9]/30 text-[#56423c]/50 hover:border-[#56423c]/30'
                      }`}
                    >
                      {conf.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 pb-6 flex justify-between items-center border-t border-[#bdc3b9]/25 pt-4">
              <button
                onClick={() => deleteApplication(selectedApp.id)}
                className="flex items-center gap-1.5 px-4 py-2.5 font-sans text-xs font-bold uppercase tracking-wider text-red-600 border border-red-600/30 hover:bg-red-50 hover:border-red-600/60 transition-all duration-300 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">delete</span>
                Supprimer
              </button>
              <button
                onClick={() => setSelectedApp(null)}
                className="px-6 py-2.5 bg-[#2A2118] text-[#FAF7F4] border border-[#2A2118] font-sans text-xs font-bold uppercase tracking-wider hover:bg-[#44372c] hover:border-[#44372c] transition-all duration-300 cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFranchisePage;

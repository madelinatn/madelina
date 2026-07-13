import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface AdminLoginPageProps {
  redirectTo?: string;
}

const AdminLoginPage = ({ redirectTo = '/admin' }: AdminLoginPageProps) => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // If already logged in, redirect straight to admin
  useEffect(() => {
    document.title = 'Connexion Admin — Café Yucca';
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/admin/franchise');
        if (res.ok) {
          navigate(redirectTo, { replace: true });
          return;
        }
      } catch {}
      setCheckingAuth(false);
    };
    checkAuth();
  }, [navigate, redirectTo]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      if (res.ok) {
        navigate(redirectTo, { replace: true });
      } else {
        setLoginError('Mot de passe incorrect.');
      }
    } catch {
      setLoginError('Erreur de connexion.');
    } finally {
      setLoginLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#FAF7F4] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#2e4b3d]/20 border-t-[#2e4b3d] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F4] flex items-center justify-center px-5">
      <div className="w-full max-w-sm animate-fadeIn">
        {/* Logo + branding */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 mx-auto mb-5 rounded-full overflow-hidden bg-[#FAF7F4] shadow-md border border-[#2e4b3d]/15 flex items-center justify-center">
            <img src="/logos/logo1.svg" alt="Café Yucca" className="w-full h-full object-cover" />
          </div>
          <h1 className="font-sans text-3xl font-bold tracking-widest text-[#7c441f] uppercase mb-1">
            YUCCA
          </h1>
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.22em] text-[#56423c]/70">Dashboard Admin</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="admin-password" className="block font-sans text-xs font-semibold uppercase tracking-wider text-[#56423c] mb-2">
              Mot de passe
            </label>
            {/* font-size 16px prevents iOS from zooming on input focus */}
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              autoFocus
              className="w-full px-4 py-4 bg-white border border-[#bdc3b9]/40 font-sans text-[#2A2118] placeholder:text-[#56423c]/40 focus:outline-none focus:border-[#2e4b3d]/60 focus:ring-2 focus:ring-[#2e4b3d]/20 transition-all duration-300 rounded-sm"
              style={{ fontSize: '16px' }}
            />
          </div>

          {loginError && (
            <p className="font-sans text-sm text-red-600 flex items-center gap-2 animate-fadeIn">
              <span className="material-symbols-outlined text-base">error</span>
              {loginError}
            </p>
          )}

          <button
            type="submit"
            disabled={loginLoading || !password}
            className="w-full py-4 bg-[#2A2118] text-[#FAF7F4] border border-[#2A2118] font-sans text-xs font-bold uppercase tracking-[0.18em] hover:bg-[#44372c] hover:border-[#44372c] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer rounded-sm mt-2"
          >
            {loginLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Connexion...
              </span>
            ) : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;

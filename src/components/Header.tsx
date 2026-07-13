import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { InstallAppButton } from './InstallAppButton';

export const Header = ({
  cartCount,
  cartTotal,
  onCartClick
}: {
  cartCount?: number;
  cartTotal?: number;
  onCartClick?: () => void;
}) => {
  const [isScrolled, setIsScrolled]       = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const headerRef = useRef<HTMLElement>(null);
  const location = useLocation();

  useEffect(() => {
    const handleScrollEvent = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScrollEvent, { passive: true });
    return () => window.removeEventListener('scroll', handleScrollEvent);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobileMenuOpen && headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    const handleScroll = () => {
      if (isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isMobileMenuOpen]);

  const navItems = [
    { label: t('Le Menu', 'Our Menu'), href: '/menu' },
    { label: t("Le Concept", 'Our Concept'), href: '/#our-story' },
    { label: 'Contact', href: '/#contact' },
    { label: 'Franchise', href: '/#franchise-section' },
  ];

  const isHomePage = location.pathname === '/';
  const showSolidBg = isScrolled || !isHomePage || isMobileMenuOpen;

  return (
    <header
      ref={headerRef}
      id="site-header"
      className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 ${
        showSolidBg
          ? `bg-[#FAF7F4]/96 backdrop-blur-md h-[72px] md:h-20 ${
              isMobileMenuOpen 
                ? 'border-b-0 shadow-none' 
                : 'border-b border-[#2e4b3d]/10 shadow-[0_2px_20px_rgba(46,75,61,0.04)]'
            }`
          : 'bg-transparent border-b border-transparent h-20 md:h-24'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">

        {/* ── Logo ── */}
        <Link
          to="/"
          id="nav-logo"
          className="flex items-center gap-3 md:gap-3.5 group"
          aria-label="Café Yucca — Accueil"
          onClick={(e) => {
            if (window.location.pathname === '/') {
              if (window.location.hash) {
                // Allow React Router to transition to '/' and clear the hash
              } else {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }
          }}
        >
          <div className="relative transition-all duration-500 group-hover:scale-105 h-12 w-12 sm:h-14 sm:w-14 rounded-full overflow-hidden bg-[#FAF7F4] shadow-sm border border-[#2e4b3d]/15 flex items-center justify-center">
            <img
              src="/logos/logo1.svg"
              alt="Café Yucca"
              className="w-full h-full object-cover scale-100"
              width="112"
              height="112"
              loading="eager"
              fetchPriority="high"
              decoding="sync"
            />
          </div>
          <span
            className={`font-sans font-semibold text-xs sm:text-[13px] md:text-[14px] uppercase tracking-[0.18em] text-[#2e4b3d] select-none transition-all duration-300 ${
              showSolidBg ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 pointer-events-none'
            }`}
          >
            Yucca Café
          </span>
        </Link>

        {/* ── Desktop Nav ── */}
        <nav className="hidden md:flex items-center gap-10" aria-label="Navigation principale">
          {navItems.map((item, i) => (
            <div key={item.href}>
              <Link
                to={item.href}
                className={`relative font-sans text-[11.5px] uppercase tracking-[0.18em] font-medium transition-colors duration-300 group ${
                  showSolidBg 
                    ? 'text-[#2e4b3d] hover:text-[#7A6A5A]' 
                    : 'text-off-white hover:text-white/80'
                }`}
              >
                {item.label}
                <span className={`absolute -bottom-0.5 left-0 h-[1.5px] w-0 transition-all duration-500 group-hover:w-full ${
                  showSolidBg ? 'bg-[#2e4b3d]' : 'bg-off-white'
                }`} />
              </Link>
            </div>
          ))}
        </nav>

        {/* ── CTA & Lang ── */}
        <div className="hidden md:flex items-center gap-4">
          {cartCount !== undefined && (
            <button
              onClick={onCartClick}
              className="flex items-center justify-center w-9 h-9 border rounded-full transition-all shadow-sm border-[#2e4b3d]/15 hover:border-[#2e4b3d]/30 text-[#2e4b3d] bg-[#FAF7F4] active:scale-95 cursor-pointer mr-1.5 relative"
              title={t('Mon panier', 'My cart')}
            >
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-terracotta text-white rounded-full w-[16px] h-[16px] text-[8.5px] font-extrabold flex items-center justify-center leading-none shadow-[0_2px_4px_rgba(0,0,0,0.15)]">
                  {cartCount}
                </span>
              )}
            </button>
          )}
          <div className="flex items-center gap-2 mr-2 text-[11px] font-medium uppercase tracking-wider">
            <button
              onClick={() => setLanguage('fr')}
              className={`transition-colors cursor-pointer ${
                showSolidBg
                  ? language === 'fr' ? 'text-[#2e4b3d] font-bold' : 'text-[#2A2118]/60 hover:text-[#2e4b3d]'
                  : language === 'fr' ? 'text-white font-bold' : 'text-off-white/60 hover:text-white'
              }`}
            >
              FR
            </button>
            <span className={showSolidBg ? 'text-[#2A2118]/20' : 'text-white/20'}>|</span>
            <button
              onClick={() => setLanguage('en')}
              className={`transition-colors cursor-pointer ${
                showSolidBg
                  ? language === 'en' ? 'text-[#2e4b3d] font-bold' : 'text-[#2A2118]/60 hover:text-[#2e4b3d]'
                  : language === 'en' ? 'text-white font-bold' : 'text-off-white/60 hover:text-white'
              }`}
            >
              EN
            </button>
          </div>

          {/* Install App Button — appears only when PWA install is available */}
          <InstallAppButton variant="subtle" />

          <a
            href="https://www.instagram.com/cafe_yucca_1/"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-center w-9 h-9 border transition-all shadow-sm ${
              showSolidBg
                ? 'border-[#2e4b3d]/15 text-[#2e4b3d] hover:bg-[#2e4b3d] hover:text-white'
                : 'border-white/20 text-off-white hover:bg-off-white hover:text-charcoal-text'
            }`}
            aria-label="Instagram"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
          </a>
          <a
            href="tel:28299999"
            className={`flex items-center gap-2 text-[12px] px-5 py-2.5 font-bold tracking-widest transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-97 ${
              showSolidBg
                ? 'btn-primary'
                : 'border border-off-white text-off-white hover:bg-off-white hover:text-charcoal-text'
            }`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.77 19.79 19.79 0 01.01 5.19 2 2 0 012 3h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 10.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 18z"/></svg>
            28 299 999
          </a>
        </div>

        {/* ── Mobile Cart & Toggle Wrapper ── */}
        <div className="md:hidden flex items-center gap-3">
          {cartCount !== undefined && (
            <button
              onClick={onCartClick}
              className="flex items-center justify-center w-9 h-9 border rounded-full transition-all shadow-sm border-[#2e4b3d]/15 hover:border-[#2e4b3d]/30 text-[#2e4b3d] bg-[#FAF7F4] active:scale-95 cursor-pointer relative"
              aria-label="Ouvrir le panier"
            >
              <svg className="w-[16px] h-[16px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-terracotta text-white rounded-full w-[15px] h-[15px] text-[8px] font-extrabold flex items-center justify-center leading-none shadow-[0_2px_4px_rgba(0,0,0,0.15)]">
                  {cartCount}
                </span>
              )}
            </button>
          )}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`p-2 transition-colors cursor-pointer focus:outline-none ${
              showSolidBg ? 'text-[#2A2118] hover:text-[#2e4b3d]' : 'text-off-white hover:text-white'
            }`}
            aria-label="Ouvrir le menu"
          >
            {isMobileMenuOpen
              ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12"/></svg>
              : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
            }
          </button>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      <div
        className={`md:hidden bg-[#FAF7F4]/96 backdrop-blur-md border-[#2e4b3d]/10 shadow-[0_10px_20px_rgba(46,75,61,0.04)] overflow-hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? 'max-h-[500px] border-b opacity-100' : 'max-h-0 border-b-0 opacity-0 pointer-events-none'
        }`}
      >
        <div className="px-6 py-8 flex flex-col gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="font-sans text-[18px] uppercase tracking-[0.18em] text-[#2e4b3d] hover:text-[#7A6A5A] transition-colors font-medium"
            >
              {item.label}
            </Link>
          ))}
          <div className="h-px bg-[#2e4b3d]/10 my-1" />

          {/* Mobile install button */}
          <InstallAppButton variant="subtle" />

          <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider mb-1">
            <button
              onClick={() => { setLanguage('fr'); setIsMobileMenuOpen(false); }}
              className={language === 'fr' ? 'text-[#2e4b3d]' : 'text-[#2A2118]/60'}
            >
              Français
            </button>
            <span className="text-[#2A2118]/20">•</span>
            <button
              onClick={() => { setLanguage('en'); setIsMobileMenuOpen(false); }}
              className={language === 'en' ? 'text-[#2e4b3d]' : 'text-[#2A2118]/60'}
            >
              English
            </button>
          </div>

          <div className="flex items-center justify-between mt-1">
            <a href="tel:28299999" className="flex items-center gap-2 text-[#2e4b3d] font-bold text-sm tracking-wider">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.77 19.79 19.79 0 01.01 5.19 2 2 0 012 3h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 10.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 18z"/></svg>
              <span>28 299 999</span>
            </a>

            <a
              href="https://www.instagram.com/cafe_yucca_1/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center border border-[#2e4b3d]/15 text-[#2e4b3d] w-9 h-9 hover:bg-[#2e4b3d] hover:text-white transition-all shadow-sm"
              aria-label="Instagram"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

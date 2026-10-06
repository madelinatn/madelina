import { useState, useEffect, useRef } from 'react';
import { Menu as MenuIcon, X, Phone, Instagram } from 'lucide-react';
import { motion, AnimatePresence, useScroll } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';


export const Header = () => {
  const [isScrolled, setIsScrolled]       = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const { language, setLanguage, t } = useLanguage();
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    return scrollY.on('change', (v) => setIsScrolled(v > 0));
  }, [scrollY]);

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
    { label: t("L'Atelier", 'Our Story'), href: '/#our-story' },
    { label: 'Contact', href: '/#contact' },
  ];

  return (
    <header
      ref={headerRef}
      id="site-header"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b ${
        isScrolled || isMobileMenuOpen
          ? 'bg-[#FAF7F4]/96 border-[#A64B2A]/10 shadow-[0_2px_24px_rgba(166,75,42,0.06)]'
          : 'bg-[#FAF7F4]/0 border-transparent shadow-none'
      } ${isScrolled ? 'py-3' : 'py-6'}`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">

        {/* ── Logo ── */}
        <Link 
          to="/" 
          id="nav-logo" 
          className="flex items-center group" 
          aria-label="madélina — Accueil"
          onClick={(e) => {
            if (window.location.pathname === '/') {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
        >
          <div className="relative transition-transform duration-500 group-hover:scale-105 h-16 w-16 sm:h-20 sm:w-20 rounded-full overflow-hidden bg-white shadow-sm border border-[#A64B2A]/20 flex items-center justify-center">
            <img
              src="/logos/logo_madelina-4.webp"
              alt="madélina par Haifa Ben Salem"
              className="w-full h-full object-cover scale-[1.45]"
              width="160"
              height="160"
              loading="eager"
              fetchpriority="high"
              decoding="sync"
            />
          </div>
        </Link>

        {/* ── Desktop Nav ── */}
        <nav className="hidden md:flex items-center gap-10" aria-label="Navigation principale">
          {navItems.map((item, i) => (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i, duration: 0.5 }}
            >
              <Link
                to={item.href}
                className="relative text-[11px] uppercase tracking-[0.2em] font-medium text-[#2A2118] hover:text-[#A64B2A] transition-colors duration-300 group"
              >
                {item.label}
                <span className="absolute -bottom-0.5 left-0 h-[1.5px] w-0 bg-[#A64B2A] transition-all duration-500 group-hover:w-full" />
              </Link>
            </motion.div>
          ))}
        </nav>

        {/* ── CTA & Lang ── */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2 mr-2 text-[11px] font-medium uppercase tracking-wider">
            <button 
              onClick={() => setLanguage('fr')} 
              className={`transition-colors ${language === 'fr' ? 'text-[#A64B2A] font-bold' : 'text-[#2A2118]/60 hover:text-[#A64B2A]'}`}
            >
              FR
            </button>
            <span className="text-[#2A2118]/20">|</span>
            <button 
              onClick={() => setLanguage('en')} 
              className={`transition-colors ${language === 'en' ? 'text-[#A64B2A] font-bold' : 'text-[#2A2118]/60 hover:text-[#A64B2A]'}`}
            >
              EN
            </button>
          </div>

          <a
            href="https://www.instagram.com/madelina_bizerte/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center bg-[#A64B2A]/10 text-[#A64B2A] rounded-full w-9 h-9 hover:bg-[#A64B2A] hover:text-white transition-all shadow-sm"
            aria-label="Instagram"
          >
            <Instagram size={16} strokeWidth={1.5} />
          </a>
          <motion.a
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            href="tel:72413676"
            className="btn-primary flex items-center gap-2 text-[12px] px-5 py-2.5"
          >
            <Phone size={14} strokeWidth={1.5} />
            72 413 676
          </motion.a>
        </div>

        {/* ── Mobile Toggle ── */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 text-[#2A2118] hover:text-[#A64B2A] transition-colors"
          aria-label="Ouvrir le menu"
        >
          {isMobileMenuOpen ? <X size={22} strokeWidth={1.5} /> : <MenuIcon size={22} strokeWidth={1.5} />}
        </button>
      </div>

      {/* ── Mobile Menu ── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#FAF7F4] border-b border-[#A64B2A]/10 overflow-hidden"
          >
            <div className="px-6 py-10 flex flex-col gap-7">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-2xl font-serif text-[#2A2118] hover:text-[#A64B2A] transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              <div className="h-px bg-[#A64B2A]/10 my-2" />
              
              <div className="flex items-center gap-4 text-sm font-medium uppercase tracking-wider mb-2">
                <button 
                  onClick={() => { setLanguage('fr'); setIsMobileMenuOpen(false); }} 
                  className={language === 'fr' ? 'text-[#A64B2A]' : 'text-[#2A2118]/60'}
                >
                  Français
                </button>
                <span className="text-[#2A2118]/20">•</span>
                <button 
                  onClick={() => { setLanguage('en'); setIsMobileMenuOpen(false); }} 
                  className={language === 'en' ? 'text-[#A64B2A]' : 'text-[#2A2118]/60'}
                >
                  English
                </button>
              </div>

              <div className="flex items-center justify-between mt-2">
                <a href="tel:72413676" className="flex items-center gap-2.5 text-[#A64B2A] font-medium text-base">
                  <Phone size={18} strokeWidth={1.5} />
                  <span>72 413 676</span>
                </a>

                <a
                  href="https://www.instagram.com/madelina_bizerte/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center bg-[#A64B2A]/10 text-[#A64B2A] rounded-full w-10 h-10 hover:bg-[#A64B2A] hover:text-white transition-all shadow-sm"
                  aria-label="Instagram"
                >
                  <Instagram size={18} strokeWidth={1.5} />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

import { useState, useEffect, useCallback, memo, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useLanguage } from '../context/LanguageContext';

interface MenuItem {
  id: string;
  category: string;
  category_en?: string;
  category_is_list?: boolean;
  title: string;
  title_en?: string;
  price: number;
  image?: string;
  description?: string;
  description_en?: string;
}


const cleanDesc = (text: string | undefined) => {
  if (!text) return '';
  return text.replace(/\\n/g, ' ').replace(/\n+/g, ' ').trim();
};

const renderFormattedModalDesc = (text: string | undefined) => {
  if (!text) return null;
  const raw = text.replace(/\\n/g, '\n');
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length > 1) {
    return (
      <div className="space-y-1 text-madelina-navy/75 leading-snug mb-3 text-xs sm:text-sm">
        {lines.map((line, idx) => {
          const isBullet = line.startsWith('-');
          const cleanLine = isBullet ? line.replace(/^-\s*/, '') : line;
          return (
            <p key={idx} className={isBullet ? "pl-1.5 flex items-start gap-2" : "font-semibold text-madelina-navy mb-1"}>
              {isBullet ? <span className="text-madelina-terracotta font-bold text-[10px] mt-1">●</span> : null}
              <span>{cleanLine}</span>
            </p>
          );
        })}
      </div>
    );
  }
  return <p className="text-madelina-navy/70 leading-snug mb-3 text-xs sm:text-sm line-clamp-4">{text}</p>;
};

// Memoized card components — avoid re-renders when category changes
const DrinkCard = memo(({ item, title, description, t_details, onClick }: { item: MenuItem; title: string; description: string; t_details: string; onClick: () => void }) => (
  <div
    className="group flex items-center bg-white border border-madelina-terracotta/10 rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer hover:border-madelina-terracotta/25 hover:-translate-y-0.5"
    onClick={onClick}
  >
    <div className="relative flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-madelina-cream/30 shadow-sm mr-4 sm:mr-5">
      {item.image ? (
        <img
          src={item.image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="eager"
          fetchPriority="high"
          decoding="async"
          onLoad={e => (e.currentTarget.style.opacity = '1')}
          style={{ opacity: 0, transition: 'opacity 0.3s ease' }}
        />
      ) : (
        <div className="w-full h-full bg-madelina-navy/5 flex items-center justify-center">
          <span className="text-2xl">🍹</span>
        </div>
      )}
    </div>
    <div className="flex-grow min-w-0 pr-2">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-1 gap-1">
        <h3 className="text-base sm:text-lg font-display text-madelina-navy group-hover:text-madelina-terracotta transition-colors break-words [overflow-wrap:anywhere] pr-2">{title}</h3>
        <span className="font-bold text-sm sm:text-base text-madelina-terracotta whitespace-nowrap">
          {typeof item.price === 'number' ? item.price.toFixed(1) : item.price} DT
        </span>
      </div>
      {description && (
        <p className="text-madelina-navy/65 text-xs sm:text-sm line-clamp-2 leading-relaxed break-words [overflow-wrap:anywhere] overflow-hidden">{cleanDesc(description)}</p>
      )}
    </div>
    <div className="flex-shrink-0 text-madelina-terracotta/40 group-hover:text-madelina-terracotta transition-colors ml-auto mr-1 sm:mr-2">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
    </div>
  </div>
));

const FoodCard = memo(({ item, title, description, t_details, onClick }: { item: MenuItem; title: string; description: string; t_details: string; onClick: () => void }) => (
  <div 
    onClick={onClick}
    className="group glass-card rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden bg-white border border-madelina-terracotta/10 shadow-sm hover:shadow-2xl transition-all duration-700 ease-out cursor-pointer hover:scale-[1.015] hover:-translate-y-1 flex flex-col"
  >
    <div className="relative aspect-square w-full overflow-hidden bg-madelina-cream/20">
      {item.image && (
        <img
          src={item.image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          loading="eager"
          fetchPriority="high"
          decoding="async"
          onLoad={e => (e.currentTarget.style.opacity = '1')}
          style={{ opacity: 0, transition: 'opacity 0.3s ease' }}
        />
      )}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/95 backdrop-blur-md px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-full shadow-md z-10 border border-madelina-terracotta/10">
        <span className="font-bold text-[13px] sm:text-base text-madelina-terracotta tracking-tight whitespace-nowrap">
          {typeof item.price === 'number' ? item.price.toFixed(1) : item.price} DT
        </span>
      </div>
    </div>
    <div className="p-5 sm:p-7 flex flex-col flex-grow">
      <h3 className="text-[17px] sm:text-2xl mb-1.5 sm:mb-2.5 font-display text-madelina-navy group-hover:text-madelina-terracotta transition-colors break-words [overflow-wrap:anywhere]">{title}</h3>
      <p className="text-madelina-navy/65 text-[13px] sm:text-sm mb-4 sm:mb-5 line-clamp-2 sm:line-clamp-3 leading-relaxed break-words [overflow-wrap:anywhere] overflow-hidden">{cleanDesc(description)}</p>
      <button
        className="text-[10px] font-bold uppercase tracking-[0.2em] text-madelina-terracotta flex items-center gap-2 hover:gap-4 transition-all cursor-pointer pointer-events-none mt-auto"
      >
        {t_details} <span>→</span>
      </button>
    </div>
  </div>
));


const MenuPage = () => {
  const [plats, setPlats] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("");
  const [activeTab, setActiveTab] = useState("");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [, startTransition] = useTransition();
  const { language, t } = useLanguage();

  const getTranslatedText = useCallback((fr: string | undefined, en: string | undefined) => {
    return language === 'en' && en ? en : (fr || '');
  }, [language]);

  useEffect(() => {
    // ── Title ──
    document.title = "menu - madelina";

    // ── Canonical ──
    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = 'https://madelina.tn/menu';

    // ── BreadcrumbList JSON-LD ──
    const breadcrumbId = 'ld-breadcrumb-menu';
    if (!document.getElementById(breadcrumbId)) {
      const script = document.createElement('script');
      script.id = breadcrumbId;
      script.type = 'application/ld+json';
      script.text = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://madelina.tn/" },
          { "@type": "ListItem", "position": 2, "name": "Menu",    "item": "https://madelina.tn/menu" }
        ]
      });
      document.head.appendChild(script);
    }

    // Cleanup on unmount — restore home-page canonical
    return () => {
      const canon = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      if (canon) canon.href = 'https://madelina.tn/';
      document.getElementById(breadcrumbId)?.remove();
    };
  }, []);

  // Fetch from Cloudflare API
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await fetch(`/api/menu`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const items = await res.json() as MenuItem[];
        setPlats(items);

        // Set initial category (the backend returns them in order)
        const cats = Array.from(new Set(items.map((i: MenuItem) => i.category))) as string[];
        if (cats.length > 0) {
          setActiveCategory(cats[0]);
          setActiveTab(cats[0]);
        }
      } catch (e) {
        console.error('Failed to load menu:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  // Compute categories from loaded items (maintaining order from DB)
  const categories = Array.from(new Set(plats.map(item => item.category))) as string[];

  // Prefetch first category eagerly, rest lazily during idle time
  useEffect(() => {
    if (!plats || plats.length === 0) return;
    // Prefetch ALL images in background (no blocking) so subsequent visits are instant
    const prefetch = () => {
      plats.forEach(item => {
        if (item.image) {
          const img = new Image();
          img.src = item.image;
        }
      });
    };
    
    let idleCallbackId: number;
    let timeoutId: ReturnType<typeof setTimeout>;

    if ('requestIdleCallback' in window) {
      idleCallbackId = (window as any).requestIdleCallback(prefetch);
    } else {
      timeoutId = setTimeout(prefetch, 1500);
    }

    return () => {
      if (idleCallbackId && 'cancelIdleCallback' in window) {
        (window as any).cancelIdleCallback(idleCallbackId);
      }
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [plats]);

  // We compute whether a category is drink-like to apply the correct grid structure per category.
  const isCategoryDrinkLike = (cat: string) => {
    const firstItem = plats.find(p => p.category === cat);
    return firstItem ? firstItem.category_is_list : false;
  };

  // Instant switch — no blocking, images appear as they load
  const handleCategoryChange = useCallback((cat: string) => {
    if (activeTab === cat) return;
    startTransition(() => {
      setActiveTab(cat);
      setActiveCategory(cat);
    });
  }, [activeTab]);

  const openModal = useCallback((item: MenuItem) => setSelectedItem(item), []);
  const closeModal = useCallback(() => setSelectedItem(null), []);

  // Prevent background scrolling when detail modal popup is open
  useEffect(() => {
    if (selectedItem) {
      const originalBodyOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      if (scrollBarWidth > 0) {
        document.body.style.paddingRight = `${scrollBarWidth}px`;
      }

      return () => {
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
        document.body.style.paddingRight = '';
      };
    }
  }, [selectedItem]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-grow pt-28 pb-20 relative overflow-hidden">
          <div className="min-h-[50vh] flex items-center justify-center">
            <div className="flex flex-col items-center animate-fadeIn">
              <div className="w-8 h-8 border-4 border-madelina-terracotta/20 border-t-madelina-terracotta rounded-full animate-spin mb-4"></div>
              <div className="font-display text-madelina-navy/40">{t("Chargement...", "Loading...")}</div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-grow pt-28 pb-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10 px-6">
          {/* Heading */}
          <div className="text-center mb-6 sm:mb-10 md:mb-16">
            <h1 className="text-5xl md:text-7xl mb-6 font-allenoire text-madelina-navy">
              Menu
            </h1>
            <div className="h-1 w-24 bg-madelina-terracotta mx-auto" />
          </div>

          {/* Categories Tab */}
          {categories.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 md:gap-3 mb-8 sm:mb-12 md:mb-16">
              {categories.map((cat) => {
                const displayCat = getTranslatedText(cat, plats.find(p => p.category === cat)?.category_en);
                return (
                  <button
                    key={cat}
                    onClick={() => handleCategoryChange(cat)}
                    className={`relative px-4 py-2 sm:px-6 sm:py-2.5 md:px-8 md:py-3 rounded-full text-[10px] sm:text-[11px] md:text-[12px] font-bold uppercase tracking-widest transition-all duration-200 ${
                      activeTab === cat 
                        ? 'bg-madelina-navy text-white shadow-lg scale-105' 
                        : 'bg-transparent text-madelina-navy hover:text-madelina-terracotta hover:bg-madelina-navy/5'
                    }`}
                  >
                    {displayCat}
                  </button>
                );
              })}
            </div>
          )}

          {/* Items Grid/List — instant render, images appear as they load */}
          <div className="min-h-[50vh]">
            <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
              {categories.map((cat) => {
                if (activeCategory !== cat) return null;
                const drinkLike = isCategoryDrinkLike(cat);
                const itemsInCat = plats.filter(item => item.category === cat);
                return (
                  <div
                    key={cat}
                    style={{ animation: 'fadeIn 0.2s ease-out' }}
                    className={drinkLike ? "flex flex-col gap-4 max-w-3xl mx-auto" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10"}
                  >
                    {itemsInCat.map((item) =>
                      drinkLike ? (
                        <DrinkCard 
                          key={item.id} 
                          item={item} 
                          title={getTranslatedText(item.title, item.title_en)}
                          description={getTranslatedText(item.description, item.description_en)}
                          t_details={t("Détails", "Details")}
                          onClick={() => openModal(item)} 
                        />
                      ) : (
                        <FoodCard 
                          key={item.id} 
                          item={item} 
                          title={getTranslatedText(item.title, item.title_en)}
                          description={getTranslatedText(item.description, item.description_en)}
                          t_details={t("Détails", "Details")}
                          onClick={() => openModal(item)} 
                        />
                      )
                    )}
                  </div>
                );
              })}
            </div>

            {/* ── End of selection divider ── */}
            <div className="flex items-center justify-center gap-4 my-12">
              <div className="h-[1px] w-12 bg-madelina-terracotta/20" />
              <span className="text-[10px] font-sans uppercase tracking-[0.25em] text-madelina-navy/40 font-semibold">
                {t("Fin de la carte", "End of menu")}
              </span>
              <div className="h-[1px] w-12 bg-madelina-terracotta/20" />
            </div>

            {/* ── Google Reviews CTA (Compact & Premium, Yucca-inspired in Madelina style) ── */}
            <div className="mt-6 mb-10 max-w-md mx-auto text-center px-6 py-9 bg-[#FAF7F4] border border-madelina-terracotta/15 rounded-3xl shadow-[0_4px_24px_rgba(166,75,42,0.04)]">
              <div className="flex justify-center gap-1 text-madelina-terracotta mb-3">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-lg">★</span>
                ))}
              </div>
              <h3 className="font-display text-xl text-madelina-navy mb-2">
                {t("Vous avez aimé l'expérience madélina ?", "Did you enjoy the madélina experience?")}
              </h3>
              <p className="font-sans text-xs sm:text-sm text-madelina-navy/70 max-w-[300px] mx-auto mb-6 leading-relaxed">
                {t(
                  "Partagez votre avis sur Google. Vos retours nous aident à perfectionner chaque détail de nos créations.",
                  "Share your review on Google. Your feedback helps us perfect every detail of our creations."
                )}
              </p>
              <a
                href="https://search.google.com/local/writereview?placeid=ChIJu9ZHTgAf4xIRKQqG2XtpBMI"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 bg-madelina-navy hover:bg-madelina-terracotta text-white text-xs font-bold uppercase tracking-[0.15em] px-7 py-3.5 rounded-full transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer"
              >
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.2 8.9 5 12 5z"/>
                  <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"/>
                  <path fill="#FBBC05" d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.7s.1-2 .4-2.7L1.6 6.4C.6 8.3 0 10.6 0 12s.6 3.7 1.6 5.6l3.7-2.9z"/>
                  <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.1-6.7-5L1.6 16.2C3.5 20.4 7.4 23 12 23z"/>
                </svg>
                <span>{t("Donner mon avis", "Write a Review")}</span>
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            key="modal-backdrop-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center sm:p-4 cursor-pointer"
            onClick={closeModal}
            onPointerDown={closeModal}
            onTouchMove={(e) => {
              if (e.target === e.currentTarget) {
                e.preventDefault();
              }
            }}
          >
            <motion.div
              key="modal-content-page"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="relative bg-white w-full sm:max-w-sm md:max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl cursor-default border border-white/10 flex flex-col max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto overscroll-contain"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              {/* ── Full image hero ── */}
              <div className="relative w-full aspect-square flex-shrink-0 overflow-hidden bg-madelina-navy/10">
                {selectedItem.image ? (
                  <img
                    src={selectedItem.image}
                    alt={getTranslatedText(selectedItem.title, selectedItem.title_en)}
                    className="w-full h-full object-cover"
                    loading="eager"
                    decoding="async"
                    onLoad={e => (e.currentTarget.style.opacity = '1')}
                    style={{ opacity: 0, transition: 'opacity 0.3s ease' }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-6xl">🍽️</span>
                  </div>
                )}

                {/* Subtle gradient just for depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />

                {/* Close button */}
                <button
                  onClick={closeModal}
                  className="absolute top-4 right-4 z-30 w-9 h-9 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer border border-white/20"
                  aria-label="Close"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* ── Content below image ── */}
              <div className="px-5 pt-4 pb-5 flex flex-col gap-2">
                {/* Name + price row */}
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-madelina-navy font-display text-xl sm:text-2xl leading-tight break-words [overflow-wrap:anywhere] flex-1">
                    {getTranslatedText(selectedItem.title, selectedItem.title_en)}
                  </h3>
                  <span className="bg-madelina-terracotta/10 text-madelina-terracotta font-bold text-sm px-3.5 py-1 rounded-full tracking-tight whitespace-nowrap flex-shrink-0 mt-0.5">
                    {typeof selectedItem.price === 'number' ? selectedItem.price.toFixed(1) : selectedItem.price} DT
                  </span>
                </div>
                {/* Category badge */}
                <span className="text-[10px] text-madelina-navy/40 uppercase tracking-widest font-bold">
                  {getTranslatedText(selectedItem.category, selectedItem.category_en)}
                </span>
                {/* Description */}
                {renderFormattedModalDesc(getTranslatedText(selectedItem.description, selectedItem.description_en))}
                <button
                  onClick={closeModal}
                  className="w-full py-3 bg-madelina-navy text-white rounded-2xl text-xs font-bold uppercase tracking-[0.15em] hover:bg-madelina-terracotta transition-all duration-200 shadow-sm cursor-pointer mt-1"
                >
                  {t("Fermer", "Close")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default MenuPage;
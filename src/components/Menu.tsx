import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

export const Menu = ({ isPreview = false }: { isPreview?: boolean }) => {
  const [plats, setPlats] = useState<MenuItem[]>([]);
  const [previewItems, setPreviewItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const { language, t } = useLanguage();

  // Instant category switch — no blocking at all
  const handleCategoryChange = (cat: string) => {
    if (activeCategory === cat) return;
    setActiveCategory(cat);
  };

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

  // Fetch menu-data.html from GitHub Raw API on mount
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await fetch(`/api/menu`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const items = await res.json() as MenuItem[];
        setPlats(items);
      } catch (e) {
        console.error('Failed to load menu:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  const categories = Array.from(new Set(plats.map(item => item.category))) as string[];

  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0]);
    }
  }, [categories, activeCategory]);

  useEffect(() => {
    if (isPreview && plats.length > 0 && previewItems.length === 0) {
      const todayDate = new Date().toDateString();
      const storedData = localStorage.getItem('madelina_preview_items');
      let savedItems: MenuItem[] = [];
      let savedDate = '';

      try {
        if (storedData) {
          const parsed = JSON.parse(storedData);
          savedItems = parsed.items || [];
          savedDate = parsed.date || '';
        }
      } catch (e) {
        console.error("Failed to parse stored preview items", e);
      }

      // Helper to pick random item from remaining, ensuring it has an image
      const pickRandom = (excludeIds: string[]) => {
        const available = plats.filter(p => !excludeIds.includes(p.id) && p.image);
        if (available.length === 0) return null;
        return available[Math.floor(Math.random() * available.length)];
      };

      let finalItems: MenuItem[] = [];

      if (savedDate === todayDate && savedItems.length === 3) {
        // Validate that all 3 saved items still exist in current menu (plats) AND have an image
        finalItems = savedItems.map(saved => {
          const stillExists = plats.find(p => p.id === saved.id && p.image);
          return stillExists || null;
        }).filter(Boolean) as MenuItem[];
        
        // Fill missing spots if any item was deleted or hidden
        while (finalItems.length < 3 && finalItems.length < plats.filter(p => p.image).length) {
          const newItem = pickRandom(finalItems.map(i => i.id));
          if (newItem) finalItems.push(newItem);
        }
      } else {
        // New day or no saved data, pick 3 completely new random items
        while (finalItems.length < 3 && finalItems.length < plats.filter(p => p.image).length) {
          const newItem = pickRandom(finalItems.map(i => i.id));
          if (newItem) finalItems.push(newItem);
        }
      }

      setPreviewItems(finalItems);
      localStorage.setItem('madelina_preview_items', JSON.stringify({
        date: todayDate,
        items: finalItems
      }));
    }
  }, [plats, isPreview, previewItems.length]);

  // Prefetch only preview images on homepage (not all 35+ menu images)
  useEffect(() => {
    if (!isPreview || previewItems.length === 0) return;
    previewItems.forEach((item) => {
      if (item.image) {
        const img = new Image();
        img.src = item.image;
      }
    });
  }, [isPreview, previewItems]);

  const getTranslatedText = (fr: string | undefined, en: string | undefined) => {
    return language === 'en' && en ? en : fr;
  };

  if (loading) {
    return (
      <section id="menu" className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="min-h-[50vh] flex items-center justify-center">
            <div className="flex flex-col items-center animate-fadeIn">
              <div className="w-8 h-8 border-4 border-madelina-terracotta/20 border-t-madelina-terracotta rounded-full animate-spin mb-4"></div>
              <div className="font-display text-madelina-navy/40">{t("Chargement...", "Loading...")}</div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="menu" className={`section-padding bg-white relative overflow-hidden ${isPreview ? 'pt-0 pb-10' : ''}`}>
      {!isPreview && (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-[0.02] flex items-center justify-center">
          <span className="text-[30vw] font-display whitespace-nowrap select-none">MADELINA</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto relative z-10">
        {!isPreview && (
          <div className="text-center mb-20 px-6">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-5xl md:text-7xl mb-6 font-allenoire text-madelina-navy"
            >
              Menu <span className="text-madelina-terracotta font-allenoire">madélina</span>
            </motion.h2>
            <motion.div 
              initial={{ width: 0 }}
              whileInView={{ width: 100 }}
              viewport={{ once: true }}
              className="h-1 bg-madelina-terracotta mx-auto mb-10"
            ></motion.div>
          </div>
        )}

        {!isPreview && categories.length > 0 && (
          <div className="flex flex-wrap justify-center gap-3 mb-16 px-6">
            {categories.map((cat) => {
              const displayCat = getTranslatedText(cat, plats.find(p => p.category === cat)?.category_en);
              return (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`relative px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-200 ${
                    activeCategory === cat 
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

          <div className="px-6">
            <div className="min-h-[50vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {isPreview ? (
                  <div className="contents" style={{ animation: 'fadeIn 0.2s ease-out' }}>
                    {previewItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setSelectedItem(item)}
                        className="group glass-card rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden hover:shadow-2xl transition-all duration-700 ease-out bg-white border border-madelina-terracotta/10 cursor-pointer hover:scale-[1.015] hover:-translate-y-1 flex flex-col"
                      >
                        <div className="relative aspect-square w-full overflow-hidden bg-madelina-cream/20">
                          <img
                            src={item.image}
                            alt={getTranslatedText(item.title, item.title_en)}
                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                            width="800"
                            height="600"
                            loading="lazy"
                            fetchPriority="auto"
                            decoding="async"
                            onLoad={e => (e.currentTarget.style.opacity = '1')}
                            style={{ opacity: 0, transition: 'opacity 0.3s ease' }}
                          />
                          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/95 backdrop-blur-md px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-full shadow-md z-10 border border-madelina-terracotta/10">
                            <span className="font-bold text-[13px] sm:text-base text-madelina-terracotta tracking-tight whitespace-nowrap">
                              {typeof item.price === 'number' ? item.price.toFixed(1) : item.price} DT
                            </span>
                          </div>
                        </div>
                        <div className="p-5 sm:p-7 flex flex-col flex-grow">
                          <h3 className="text-[17px] sm:text-2xl mb-1.5 sm:mb-2.5 font-display text-madelina-navy group-hover:text-madelina-terracotta transition-colors break-words [overflow-wrap:anywhere]">
                            {getTranslatedText(item.title, item.title_en)}
                          </h3>
                          <p className="text-madelina-navy/65 leading-relaxed text-xs sm:text-sm mb-4 line-clamp-3 break-words [overflow-wrap:anywhere] overflow-hidden">
                            {getTranslatedText(item.description, item.description_en)?.replace(/\\n/g, ' ').replace(/\n+/g, ' ').trim()}
                          </p>
                          <button 
                            className="text-[10px] font-bold uppercase tracking-[0.2em] text-madelina-terracotta flex items-center gap-2 group-hover:gap-3 transition-all cursor-pointer pointer-events-none mt-auto"
                          >
                            {t("Détails", "Details")} <span className="text-lg">→</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  categories.map(cat => {
                    const catItems = plats.filter(item => item.category === cat);
                    return (
                      <div key={cat} className={activeCategory === cat ? "contents" : "hidden"} style={activeCategory === cat ? { animation: 'fadeIn 0.2s ease-out' } : undefined}>
                        {catItems.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => setSelectedItem(item)}
                            className="group glass-card rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden hover:shadow-2xl transition-all duration-700 ease-out bg-white border border-madelina-terracotta/10 cursor-pointer hover:scale-[1.015] hover:-translate-y-1 flex flex-col"
                          >
                            <div className="relative aspect-square w-full overflow-hidden bg-madelina-cream/20">
                              <img
                                src={item.image}
                                alt={getTranslatedText(item.title, item.title_en)}
                                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                width="800"
                                height="600"
                                loading="lazy"
                                fetchPriority="auto"
                                decoding="async"
                                onLoad={e => (e.currentTarget.style.opacity = '1')}
                                style={{ opacity: 0, transition: 'opacity 0.3s ease' }}
                              />
                              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/95 backdrop-blur-md px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-full shadow-md z-10 border border-madelina-terracotta/10">
                                <span className="font-bold text-[13px] sm:text-base text-madelina-terracotta tracking-tight whitespace-nowrap">
                                  {typeof item.price === 'number' ? item.price.toFixed(1) : item.price} DT
                                </span>
                              </div>
                            </div>
                            <div className="p-5 sm:p-7 flex flex-col flex-grow">
                              <h3 className="text-[17px] sm:text-2xl mb-1.5 sm:mb-2.5 font-display text-madelina-navy group-hover:text-madelina-terracotta transition-colors break-words [overflow-wrap:anywhere]">
                                {getTranslatedText(item.title, item.title_en)}
                              </h3>
                              <p className="text-madelina-navy/65 leading-relaxed text-xs sm:text-sm mb-4 line-clamp-3 break-words [overflow-wrap:anywhere] overflow-hidden">
                                {getTranslatedText(item.description, item.description_en)?.replace(/\\n/g, ' ').replace(/\n+/g, ' ').trim()}
                              </p>
                              <button 
                                className="text-[10px] font-bold uppercase tracking-[0.2em] text-madelina-terracotta flex items-center gap-2 group-hover:gap-3 transition-all cursor-pointer pointer-events-none mt-auto"
                              >
                                {t("Détails", "Details")} <span className="text-lg">→</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            key="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center sm:p-4 cursor-pointer"
            onClick={() => setSelectedItem(null)}
            onPointerDown={() => setSelectedItem(null)}
            onTouchMove={(e) => {
              if (e.target === e.currentTarget) {
                e.preventDefault();
              }
            }}
          >
            <motion.div
              key="modal-content"
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
                  onClick={() => setSelectedItem(null)}
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
                  onClick={() => setSelectedItem(null)}
                  className="w-full py-3 bg-madelina-navy text-white rounded-2xl text-xs font-bold uppercase tracking-[0.15em] hover:bg-madelina-terracotta transition-all duration-200 shadow-sm cursor-pointer mt-1"
                >
                  {t("Fermer", "Close")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
import { useState, useEffect } from 'react';
import { Reveal } from './Reveal';
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

export const Menu = ({ isPreview = false }: { isPreview?: boolean }) => {
  const [plats, setPlats] = useState<MenuItem[]>([]);
  const [previewItems, setPreviewItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [modalImgSrc, setModalImgSrc] = useState<string>('');
  const [activePreviewIndex, setActivePreviewIndex] = useState<number | null>(null);
  const [mobileShowImage, setMobileShowImage] = useState<Record<number, boolean>>({});
  const { language, t } = useLanguage();

  useEffect(() => {
    if (selectedItem?.image) {
      setModalImgSrc(selectedItem.image);
      if (selectedItem.image.startsWith('/api/images/menu/')) {
        const originalUrl = selectedItem.image.replace(/(-\d+)?\.webp$/, (m, ts) => `${ts || ''}-original.webp`);
        const img = new Image();
        img.src = originalUrl;
        img.onload = () => {
          setModalImgSrc(originalUrl);
        };
      }
    } else {
      setModalImgSrc('');
    }
  }, [selectedItem]);

  useEffect(() => {
    if (!isPreview || previewItems.length === 0) return;
    if (window.innerWidth >= 768) return;

    const handleScroll = () => {
      const cards = document.querySelectorAll('.preview-card');
      const viewportCenter = window.innerHeight / 2;
      let closestIndex: number | null = null;
      let minDistance = Infinity;
      let anyCardInMiddle = false;

      cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const cardCenter = rect.top + rect.height / 2;
        const distance = Math.abs(cardCenter - viewportCenter);

        // Consider the card "in the middle zone" if its center is within 35% of the viewport height from the center
        if (distance < window.innerHeight * 0.35) {
          anyCardInMiddle = true;
        }

        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = parseInt((card as HTMLElement).dataset.previewIndex || '-1', 10);
        }
      });

      if (anyCardInMiddle && closestIndex !== null && closestIndex >= 0) {
        setActivePreviewIndex(closestIndex);
      } else {
        setActivePreviewIndex(null);
      }
    };

    // Small delay so DOM is ready and client rects are accurate
    const tid = setTimeout(() => {
      handleScroll();
    }, 150);

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      clearTimeout(tid);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [isPreview, previewItems]);

  useEffect(() => {
    setMobileShowImage({});
  }, [activePreviewIndex]);

  const handleCardClick = (index: number) => {
    if (window.innerWidth < 768) {
      if (activePreviewIndex === index) {
        setMobileShowImage(prev => ({ ...prev, [index]: !prev[index] }));
      } else {
        setActivePreviewIndex(index);
        setMobileShowImage(prev => ({ ...prev, [index]: false }));
      }
    }
  };

  // Instant category switch — no blocking at all
  const handleCategoryChange = (cat: string) => {
    if (activeCategory === cat) return;
    setActiveCategory(cat);
  };

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
      const storedData = localStorage.getItem('yucca_preview_items');
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

      const pickRandom = (excludeIds: string[]) => {
        const available = plats.filter(p => !excludeIds.includes(p.id) && p.image);
        if (available.length === 0) return null;
        return available[Math.floor(Math.random() * available.length)];
      };

      let finalItems: MenuItem[] = [];

      if (savedDate === todayDate && savedItems.length === 3) {
        finalItems = savedItems.map(saved => {
          const stillExists = plats.find(p => p.id === saved.id && p.image);
          return stillExists || null;
        }).filter(Boolean) as MenuItem[];
        
        while (finalItems.length < 3 && finalItems.length < plats.filter(p => p.image).length) {
          const newItem = pickRandom(finalItems.map(i => i.id));
          if (newItem) finalItems.push(newItem);
        }
      } else {
        while (finalItems.length < 3 && finalItems.length < plats.filter(p => p.image).length) {
          const newItem = pickRandom(finalItems.map(i => i.id));
          if (newItem) finalItems.push(newItem);
        }
      }

      setPreviewItems(finalItems);
      localStorage.setItem('yucca_preview_items', JSON.stringify({
        date: todayDate,
        items: finalItems
      }));
    }
  }, [plats, isPreview, previewItems.length]);

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
      <section id="menu" className="py-20 bg-[#FAF7F4]">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="min-h-[50vh] flex items-center justify-center">
            <div className="flex flex-col items-center animate-fadeIn">
              <div className="w-8 h-8 border-4 border-[#2e4b3d]/20 border-t-[#2e4b3d] rounded-full animate-spin mb-4"></div>
              <div className="font-sans text-charcoal-text/40">{t("Chargement...", "Loading...")}</div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="menu" className={`section-padding ${isPreview ? 'bg-transparent pt-0 pb-10' : 'bg-[#FAF7F4]'} relative overflow-hidden`}>
      {!isPreview && (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-[0.02] flex items-center justify-center">
          <span className="text-[30vw] font-sans whitespace-nowrap select-none tracking-tighter">YUCCA</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto relative z-10">
        {!isPreview && (
          <div className="text-center mb-20 px-6">
            <Reveal 
              y={20}
              className="text-5xl md:text-7xl mb-6 font-sans font-light tracking-tighter text-charcoal-text"
            >
              Menu <span className="text-terracotta">Yucca</span>
            </Reveal>
            <div className="h-1 bg-terracotta mx-auto mb-10 w-24"></div>
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
                  className={`relative px-8 py-3 text-[10px] font-bold uppercase tracking-widest transition-all duration-200 ${
                    activeCategory === cat 
                      ? 'bg-charcoal-text text-white scale-105' 
                      : 'bg-transparent text-charcoal-text hover:text-terracotta hover:bg-charcoal-text/5'
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
            <div className={`grid grid-cols-1 ${isPreview ? 'md:grid-cols-3 gap-12 items-start' : 'md:grid-cols-2 lg:grid-cols-3 gap-10'}`}>
              {isPreview ? (
                <div className="contents" style={{ animation: 'fadeIn 0.2s ease-out' }}>
                  {previewItems.map((item, index) => (
                    <Reveal
                      key={item.id}
                      delay={index * 0.1}
                      y={40}
                      data-preview-index={index}
                      onClick={() => handleCardClick(index)}
                      className={`reveal-on-hover preview-card relative aspect-[3/4] overflow-hidden luxury-border p-3 bg-[#FAF7F4] shadow-sm group cursor-pointer ${index === 1 ? 'md:translate-y-16' : ''} ${activePreviewIndex === index && !mobileShowImage[index] ? 'mobile-active' : ''}`}
                    >
                      <img
                        src={item.image}
                        alt={getTranslatedText(item.title, item.title_en)}
                        className="w-full h-full object-cover group-hover:scale-110"
                        width="600"
                        height="800"
                        loading="lazy"
                        decoding="async"
                        onLoad={e => (e.currentTarget.style.opacity = '1')}
                        ref={el => { if (el && el.complete) el.style.opacity = '1'; }}
                        style={{ opacity: 0, transition: 'opacity 0.8s cubic-bezier(0.25, 1, 0.5, 1), transform 1.2s cubic-bezier(0.25, 1, 0.5, 1)' }}
                      />
                      <div className={`overlay absolute inset-0 ${index === 1 ? 'bg-terracotta/90' : 'bg-charcoal-text/80'} flex flex-col justify-center items-center text-off-white p-5 sm:p-8 md:p-10 lg:p-12 text-center backdrop-blur-sm`}>
                        <span className="font-sans font-semibold text-[10px] sm:text-[12px] uppercase tracking-[0.1em] mb-1.5 sm:mb-2">
                          {getTranslatedText(item.category, item.category_en)}
                        </span>
                        <h3 className="font-sans text-[20px] sm:text-[24px] font-medium mb-2 sm:mb-3 break-words w-full">
                          {getTranslatedText(item.title, item.title_en)}
                        </h3>
                        <p className="text-xs sm:text-sm opacity-80 italic leading-relaxed mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-3 lg:line-clamp-4 break-words w-full">
                          {getTranslatedText(item.description, item.description_en)}
                        </p>
                        <span className="font-bold text-base sm:text-lg tracking-tight border-t border-white/20 pt-2 sm:pt-3">
                          {typeof item.price === 'number' ? item.price.toFixed(1) : item.price} DT
                        </span>
                      </div>
                    </Reveal>
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
                          className="group glass-card rounded-[2.5rem] overflow-hidden hover:shadow-2xl transition-all duration-700 ease-out bg-[#FAF7F4] border border-terracotta/5 cursor-pointer hover:scale-[1.02] hover:-translate-y-1"
                        >
                          <div className="relative h-72 overflow-hidden bg-surface-container">
                            <img
                              src={item.image}
                              alt={getTranslatedText(item.title, item.title_en)}
                              className="w-full h-full object-cover group-hover:scale-110"
                              width="800"
                              height="600"
                              loading="lazy"
                              fetchPriority="auto"
                              decoding="async"
                              onLoad={e => (e.currentTarget.style.opacity = '1')}
                              ref={el => { if (el && el.complete) el.style.opacity = '1'; }}
                              style={{ opacity: 0, transition: 'opacity 0.8s cubic-bezier(0.25, 1, 0.5, 1), transform 1.2s cubic-bezier(0.25, 1, 0.5, 1)' }}
                            />
                            <div className="absolute top-6 right-6 bg-[#FAF7F4]/95 px-4 py-1.5 rounded-full shadow-lg">
                              <span className="font-bold text-terracotta tracking-tight">
                                {typeof item.price === 'number' ? item.price.toFixed(1) : item.price} DT
                              </span>
                            </div>
                          </div>
                          <div className="p-8 text-left">
                            <h3 className="text-2xl mb-3 font-sans text-charcoal-text group-hover:text-terracotta transition-colors duration-300 font-medium break-words">
                              {getTranslatedText(item.title, item.title_en)}
                            </h3>
                            <p className="text-on-surface-variant leading-relaxed text-sm mb-6 line-clamp-1 break-words">
                              {getTranslatedText(item.description, item.description_en)}
                            </p>
                            <button 
                              className="text-[10px] font-bold uppercase tracking-[0.2em] text-terracotta flex items-center gap-2 group-hover:gap-3 transition-all cursor-pointer pointer-events-none"
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

      {selectedItem && (
        <div
          className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4 touch-none modal-backdrop-animate"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="bg-[#FAF7F4] rounded-[2rem] overflow-hidden max-w-[440px] w-full flex flex-col shadow-2xl touch-auto overflow-x-hidden modal-content-animate"
            style={{ maxHeight: 'min(85dvh, 85vh)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {selectedItem.image && (
              <div className={`w-full flex-shrink-0 overflow-hidden bg-[#FAF7F4] flex items-center justify-center relative border-b border-charcoal-text/5 ${
                selectedItem.category_is_list 
                  ? 'aspect-square max-h-[380px]' 
                  : 'aspect-[4/3] max-h-[330px]'
              }`}>
                {/* Blurry background for ambient effect */}
                <div 
                  className="absolute inset-0 bg-cover bg-center blur-lg opacity-25 scale-110 pointer-events-none"
                  style={{ backgroundImage: `url(${selectedItem.image})` }}
                />
                {/* Sharp foreground image */}
                <img
                  src={modalImgSrc || selectedItem.image}
                  alt={getTranslatedText(selectedItem.title, selectedItem.title_en)}
                  className="w-full h-full object-cover relative z-10"
                  loading="lazy"
                  decoding="async"
                  onLoad={e => (e.currentTarget.style.opacity = '1')}
                  ref={el => { if (el && el.complete) el.style.opacity = '1'; }}
                  style={{ opacity: 0, transition: 'opacity 0.5s cubic-bezier(0.25, 1, 0.5, 1)' }}
                />
              </div>
            )}
            <div className="p-6 sm:p-8 overflow-y-auto overflow-x-hidden scrollbar-none flex-grow" style={{ WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}>
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-2xl sm:text-3xl font-sans font-semibold text-charcoal-text leading-tight break-words">
                  {getTranslatedText(selectedItem.title, selectedItem.title_en)}
                </h3>
                <span className="bg-terracotta/10 text-terracotta font-bold px-4 py-2 rounded-full text-sm whitespace-nowrap ml-4">
                  {typeof selectedItem.price === 'number' ? selectedItem.price.toFixed(1) : selectedItem.price} DT
                </span>
              </div>
              <p className="text-xs sm:text-sm text-charcoal-text/40 uppercase tracking-widest font-bold mb-4">
                {getTranslatedText(selectedItem.category, selectedItem.category_en)}
              </p>
              {(getTranslatedText(selectedItem.description, selectedItem.description_en)) && (
                <p className="text-sm sm:text-base text-charcoal-text/70 leading-relaxed break-words whitespace-pre-line">
                  {getTranslatedText(selectedItem.description, selectedItem.description_en)}
                </p>
              )}
            </div>
            {/* Close button — always visible outside scroll area */}
            <div className="flex-shrink-0 px-6 sm:px-8 pb-6 sm:pb-8 pt-4 border-t border-charcoal-text/8">
              <button
                onClick={() => setSelectedItem(null)}
                className="w-full py-3.5 bg-charcoal-text text-white text-xs font-bold uppercase tracking-widest hover:bg-terracotta transition-colors duration-300 rounded-xl cursor-pointer"
              >
                {t("Fermer", "Close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
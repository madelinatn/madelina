import { useState, useEffect, useCallback, useMemo, memo, useTransition } from 'react';
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

// Memoized card components — avoid re-renders when category changes
const DrinkCard = memo(({ item, title, description, t_details, t_ajouter, qty, onClick, onAdd, onRemove }: {
  item: MenuItem; title: string; description: string; t_details: string; t_ajouter: string;
  qty: number; onClick: () => void; onAdd: () => void; onRemove: () => void;
}) => (
  <div
    className="group flex items-start gap-4 bg-[#FAF7F4] border border-[#2e4b3d]/10 rounded-2xl p-4 sm:p-5 transition-all duration-300 hover:border-terracotta/30 hover:shadow-[0_4px_20px_rgba(124,68,31,0.07)] hover:-translate-y-0.5"
  >
    {/* Thumbnail */}
    <div className="flex-shrink-0 w-[72px] h-[72px] sm:w-[84px] sm:h-[84px] rounded-xl overflow-hidden bg-surface-container">
      {item.image ? (
        <img
          src={item.image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          decoding="async"
          onLoad={e => (e.currentTarget.style.opacity = '1')}
          ref={el => { if (el && el.complete) el.style.opacity = '1'; }}
          style={{ opacity: 0, transition: 'opacity 0.5s ease' }}
        />
      ) : (
        <div className="w-full h-full bg-terracotta/8 flex items-center justify-center">
          <span className="text-2xl">🍹</span>
        </div>
      )}
    </div>

    {/* Info */}
    <div className="flex-grow min-w-0 overflow-hidden">
      <h3 className="font-sans font-semibold text-[16px] sm:text-[18px] text-charcoal-text leading-snug truncate">
        {title}
      </h3>
      <span className="font-bold text-[13px] sm:text-[14px] text-terracotta block mt-0.5 mb-1">
        {typeof item.price === 'number' ? item.price.toFixed(1) : item.price} DT
      </span>
      {description && (
        <p className="text-charcoal-text/50 text-[12px] sm:text-[13px] leading-relaxed font-sans break-words truncate">
          {description}
        </p>
      )}
      <button
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        className="text-[10px] font-sans font-semibold uppercase tracking-[0.2em] text-terracotta/75 hover:text-terracotta flex items-center gap-1.5 transition-all duration-300 cursor-pointer mt-1.5"
      >
        {t_details} <span className="text-base">→</span>
      </button>
    </div>

    {/* Add button or quantity selector */}
    {qty > 0 ? (
      <div className="flex-shrink-0 flex items-center gap-2 bg-[#2e4b3d] text-[#FAF7F4] rounded-full p-1 shadow-sm self-center z-10">
        <button
          onClick={e => { e.stopPropagation(); onRemove(); }}
          className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-[14px] hover:bg-[#1f3329] active:scale-90 transition-all cursor-pointer select-none"
        >
          −
        </button>
        <span className="font-bold text-[12px] font-sans w-4 text-center">{qty}</span>
        <button
          onClick={e => { e.stopPropagation(); onAdd(); }}
          className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-[14px] hover:bg-[#1f3329] active:scale-90 transition-all cursor-pointer select-none"
        >
          +
        </button>
      </div>
    ) : (
      <button
        className="flex-shrink-0 px-3 py-1.5 rounded-full bg-[#2e4b3d] text-[#FAF7F4] font-sans text-[10px] font-bold uppercase tracking-wider hover:bg-[#1f3329] active:scale-95 transition-all self-center z-10 shadow-sm cursor-pointer whitespace-nowrap"
        onClick={e => { e.stopPropagation(); onAdd(); }}
      >
        {t_ajouter}
      </button>
    )}
  </div>
));


const FoodCard = memo(({ item, title, description, t_details, t_ajouter, qty, onClick, onAdd, onRemove }: {
  item: MenuItem; title: string; description: string; t_details: string; t_ajouter: string;
  qty: number; onClick: () => void; onAdd: () => void; onRemove: () => void;
}) => (
  <div
    className="group overflow-hidden bg-[#FAF7F4] border border-[#2e4b3d]/10 transition-all duration-400 ease-out hover:shadow-[0_12px_40px_rgba(124,68,31,0.09)] hover:-translate-y-1"
  >
    {/* Image */}
    <div className="relative aspect-[4/3] overflow-hidden bg-surface-container">
      {item.image ? (
        <img
          src={item.image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-600 ease-out group-hover:scale-103"
          loading="lazy"
          decoding="async"
          onLoad={e => (e.currentTarget.style.opacity = '1')}
          ref={el => { if (el && el.complete) el.style.opacity = '1'; }}
          style={{ opacity: 0, transition: 'opacity 0.7s ease' }}
        />
      ) : (
        <div className="w-full h-full bg-terracotta/5 flex items-center justify-center">
          <span className="text-5xl opacity-20">☕</span>
        </div>
      )}
      <div className="absolute top-3 right-3 bg-[#FAF7F4]/95 px-3 py-1 border border-terracotta/15">
        <span className="font-sans font-semibold text-[13px] text-terracotta">
          {typeof item.price === 'number' ? item.price.toFixed(1) : item.price} DT
        </span>
      </div>
    </div>

    {/* Content */}
    <div className="p-5 sm:p-6">
      <h3 className="font-sans font-semibold text-[18px] sm:text-[20px] text-charcoal-text leading-snug mb-3">
        {title}
      </h3>
      <div className="h-px w-8 bg-terracotta/40 mb-3" />
      {description && (
        <p className="text-charcoal-text/50 text-[13px] sm:text-[14px] font-sans leading-relaxed mb-4 break-words">
          {description}
        </p>
      )}
      <div className="flex items-center justify-between mt-1">
        <button
          onClick={(e) => { e.stopPropagation(); onClick(); }}
          className="text-[10px] font-sans font-semibold uppercase tracking-[0.2em] text-terracotta/75 hover:text-terracotta flex items-center gap-1.5 transition-all duration-300 cursor-pointer"
        >
          {t_details} <span className="text-base">→</span>
        </button>
        {qty > 0 ? (
          <div className="flex items-center gap-2 bg-[#2e4b3d] text-[#FAF7F4] rounded-full p-1 shadow-sm z-10">
            <button
              onClick={e => { e.stopPropagation(); onRemove(); }}
              className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-[14px] hover:bg-[#1f3329] active:scale-90 transition-all cursor-pointer select-none"
            >
              −
            </button>
            <span className="font-bold text-[12px] font-sans w-4 text-center">{qty}</span>
            <button
              onClick={e => { e.stopPropagation(); onAdd(); }}
              className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-[14px] hover:bg-[#1f3329] active:scale-90 transition-all cursor-pointer select-none"
            >
              +
            </button>
          </div>
        ) : (
          <button
            className="px-3 py-1.5 rounded-full bg-[#2e4b3d] text-[#FAF7F4] font-sans text-[10px] font-bold uppercase tracking-wider hover:bg-[#1f3329] active:scale-95 transition-all shadow-sm cursor-pointer whitespace-nowrap"
            onClick={e => { e.stopPropagation(); onAdd(); }}
          >
            {t_ajouter}
          </button>
        )}
      </div>
    </div>
  </div>
));



type CartEntry = { item: MenuItem; qty: number };

const MenuPage = () => {
  const [plats, setPlats] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("");
  const [activeTab, setActiveTab] = useState("");

  // ── Cart state ──
  const [cart, setCart] = useState<Record<string, CartEntry>>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [tableNum, setTableNum] = useState("");
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const cartItems = useMemo(() => Object.values(cart), [cart]);
  const cartCount = useMemo(() => cartItems.reduce((s, e) => s + e.qty, 0), [cartItems]);
  const cartTotal = useMemo(() => cartItems.reduce((s, e) => s + e.qty * e.item.price, 0), [cartItems]);

  const addToCart = useCallback((item: MenuItem) => {
    setCart(prev => ({
      ...prev,
      [item.id]: { item, qty: (prev[item.id]?.qty ?? 0) + 1 }
    }));
  }, []);

  const changeQty = useCallback((id: string, delta: number) => {
    setCart(prev => {
      const cur = prev[id];
      if (!cur) return prev;
      const next = cur.qty + delta;
      if (next <= 0) { const r = { ...prev }; delete r[id]; return r; }
      return { ...prev, [id]: { ...cur, qty: next } };
    });
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setCart(prev => { const r = { ...prev }; delete r[id]; return r; });
  }, []);

  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [modalImgSrc, setModalImgSrc] = useState<string>('');
  const [, startTransition] = useTransition();
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

  const getTranslatedText = useCallback((fr: string | undefined, en: string | undefined) => {
    return language === 'en' && en ? en : (fr || '');
  }, [language]);

  const submitOrder = useCallback(async () => {
    if (!tableNum) return;
    if (cartItems.length === 0) return;
    setIsSending(true);
    const finalCustomerName = customerName.trim() || `${t('Table', 'Table')} ${tableNum}`;
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: finalCustomerName,
          table_num: parseInt(tableNum),
          items: cartItems.map(({ item, qty }) => ({
            id: item.id,
            title: getTranslatedText(item.title, item.title_en),
            qty,
            price: item.price
          }))
        })
      });
      if (!res.ok) throw new Error();
      setOrderSuccess(true);
      setCart({});
      setIsCartOpen(false);
    } catch {
      alert(t('Erreur lors de l\'envoi. Réessayez.', 'Error sending order. Please retry.'));
    } finally {
      setIsSending(false);
    }
  }, [customerName, tableNum, cartItems, getTranslatedText, t]);


  useEffect(() => {
    // ── Title ──
    document.title = t("Menu - Café Yucca", "Menu - Café Yucca");

    // ── Canonical ──
    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = 'https://yucca-cafe.tn/menu';

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
          { "@type": "ListItem", "position": 1, "name": t("Accueil", "Home"), "item": "https://yucca-cafe.tn/" },
          { "@type": "ListItem", "position": 2, "name": "Menu",    "item": "https://yucca-cafe.tn/menu" }
        ]
      });
      document.head.appendChild(script);
    }

    // Cleanup on unmount — restore home-page canonical
    return () => {
      const canon = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      if (canon) canon.href = 'https://yucca-cafe.tn/';
      document.getElementById(breadcrumbId)?.remove();
    };
  }, [t]);

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

  // Memoized categories list — recomputed only when plats changes
  const categories = useMemo(
    () => Array.from(new Set(plats.map(item => item.category))) as string[],
    [plats]
  );

  // Memoized O(1) lookup map: category → is_list boolean
  const categoryIsListMap = useMemo(() => {
    const map = new Map<string, boolean>();
    for (const item of plats) {
      if (!map.has(item.category)) {
        map.set(item.category, !!item.category_is_list);
      }
    }
    return map;
  }, [plats]);

  // Prefetch only images of the active category (not all 37+ at once)
  useEffect(() => {
    if (!plats || plats.length === 0 || !activeCategory) return;
    const categoryItems = plats.filter(i => i.category === activeCategory);
    const prefetch = () => {
      categoryItems.forEach(item => {
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
  }, [plats, activeCategory]);

  // O(1) lookup using memoized map
  const isCategoryDrinkLike = useCallback(
    (cat: string) => categoryIsListMap.get(cat) ?? false,
    [categoryIsListMap]
  );

  // Instant switch — no blocking, images appear as they load
  const handleCategoryChange = useCallback((cat: string) => {
    if (activeTab === cat) return;
    startTransition(() => {
      setActiveTab(cat);
      setActiveCategory(cat);
    });
  }, [activeTab]);

  const openModal = useCallback((item: MenuItem) => {
    setSelectedItem(item);
  }, []);
  const closeModal = useCallback(() => {
    setSelectedItem(null);
  }, []);

  useEffect(() => {
    const shouldLock = !!selectedItem || isCartOpen || orderSuccess;
    if (shouldLock) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [selectedItem, isCartOpen, orderSuccess]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-surface-container-low">
        <Header />
        <main className="flex-grow pt-28 pb-20 relative overflow-hidden">
          <div className="min-h-[50vh] flex items-center justify-center">
            <div className="flex flex-col items-center animate-fadeIn">
              <div className="w-8 h-8 border-4 border-[#2e4b3d]/20 border-t-[#2e4b3d] rounded-full animate-spin mb-4"></div>
              <div className="font-sans text-charcoal-text/40">{t("Chargement...", "Loading...")}</div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface-container-low">
      <Header cartCount={cartCount} cartTotal={cartTotal} onCartClick={() => setIsCartOpen(true)} />

      <main className="flex-grow pt-28 pb-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10 px-6">

          {/* ── Page Heading ── */}
          <div className="text-center mb-8 md:mb-12">
            <span className="font-sans text-[11px] tracking-[0.3em] uppercase text-terracotta font-semibold block mb-4">
              Café Yucca
            </span>
            <h1 className="text-5xl md:text-7xl mb-6 font-sans font-light tracking-tighter text-charcoal-text">
              {t("Le Menu", "The Menu")}
            </h1>
            <div className="h-px w-20 bg-terracotta mx-auto opacity-60" />
          </div>

          {/* ── Category Pills Layout — beautifully wrapping, fully visible ── */}
          {categories.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2.5 mb-12 md:mb-16 max-w-4xl mx-auto px-4">
              {categories.map((cat) => {
                const displayCat = getTranslatedText(cat, plats.find(p => p.category === cat)?.category_en);
                const isActive = activeTab === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => handleCategoryChange(cat)}
                    className={`px-4.5 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-[colors,box-shadow,transform] duration-300 ease-out border cursor-pointer ${
                      isActive
                        ? 'bg-primary border-primary text-white shadow-md shadow-primary/20 scale-[1.03]'
                        : 'bg-primary/5 border-primary/20 text-primary/80 hover:bg-primary/10 hover:text-primary hover:border-primary/40 hover:shadow-sm'
                    }`}
                  >
                    {displayCat}
                  </button>
                );
              })}
            </div>
          )}

          {/* ── Items Grid/List ── */}
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
                          t_ajouter={t("+ Ajouter", "+ Add")}
                          qty={cart[item.id]?.qty || 0}
                          onClick={() => openModal(item)}
                          onAdd={() => addToCart(item)}
                          onRemove={() => changeQty(item.id, -1)}
                        />
                      ) : (
                        <FoodCard
                          key={item.id}
                          item={item}
                          title={getTranslatedText(item.title, item.title_en)}
                          description={getTranslatedText(item.description, item.description_en)}
                          t_details={t("Détails", "Details")}
                          t_ajouter={t("+ Ajouter", "+ Add")}
                          qty={cart[item.id]?.qty || 0}
                          onClick={() => openModal(item)}
                          onAdd={() => addToCart(item)}
                          onRemove={() => changeQty(item.id, -1)}
                        />
                      )
                    )}
                  </div>
                );
              })}
            </div>
          </div>
            {/* End of list decorator */}
            <div className="flex items-center justify-center gap-4 my-16 opacity-30 select-none">
              <div className="h-[1px] w-12 bg-charcoal-text" />
              <span className="text-[10px] font-sans uppercase tracking-[0.25em] text-charcoal-text">
                {t("Fin de la sélection", "End of selection")}
              </span>
              <div className="h-[1px] w-12 bg-charcoal-text" />
            </div>

          {/* ── Google Reviews CTA (Compact & Premium) ── */}
          <div className="mt-8 max-w-md mx-auto text-center px-6 py-9 bg-[#FAF7F4] border border-[#2e4b3d]/10 rounded-3xl shadow-[0_2px_12px_rgba(46,75,61,0.03)]">
            <div className="flex justify-center gap-0.5 text-terracotta mb-3">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              ))}
            </div>
            <h3 className="font-sans text-[17px] font-medium text-charcoal-text mb-2">
              {t("Vous avez aimé l'expérience Yucca ?", "Did you enjoy the Yucca experience?")}
            </h3>
            <p className="font-sans text-[13px] text-on-surface-variant/80 max-w-[280px] mx-auto mb-5 leading-relaxed">
              {t(
                "Partagez votre avis sur Google. Vos retours nous aident à perfectionner chaque detail de notre service.",
                "Share your review on Google. Your feedback helps us perfect every detail of our service."
              )}
            </p>
            <a
              href="https://search.google.com/local/writereview?placeid=ChIJjwOPdQAz_RIRBpQdYZ38S_0"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-flex items-center gap-2 cursor-pointer text-[11px] px-6 py-3"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.478 0-6.3-2.823-6.3-6.3 0-3.478 2.822-6.3 6.3-6.3 1.63 0 3.11.618 4.24 1.636l3.056-3.056C19.16 2.502 15.9 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 11.24-4.54 11.24-11.24 0-.76-.078-1.5-.22-2.195H12.24z"/>
              </svg>
              {t("Donner mon avis", "Write a Review")}
            </a>
          </div>

        </div>
      </main>

      {/* Detail Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4 touch-none modal-backdrop-animate"
          onClick={closeModal}
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
                onClick={closeModal}
                className="w-full py-3.5 bg-charcoal-text text-white border border-charcoal-text text-xs font-bold uppercase tracking-widest hover:bg-terracotta hover:border-terracotta transition-colors duration-300 rounded-xl cursor-pointer"
              >
                {t("Fermer", "Close")}
              </button>
            </div>
          </div>
        </div>
      )}



      {/* ── Cart slide-up panel ── */}
      {isCartOpen && (
        <>
          <div
            className="fixed inset-0 z-[300] bg-black/50"
            onClick={() => setIsCartOpen(false)}
            style={{ animation: 'fadeIn 0.2s ease-out' }}
          />
          <div
            className="fixed bottom-0 left-0 right-0 bg-[#FAF7F4] rounded-t-[2rem] z-[400] max-h-[92dvh] overflow-y-auto shadow-2xl pb-[env(safe-area-inset-bottom,20px)]"
            style={{ animation: 'slideUp 0.32s cubic-bezier(0.32,0.94,0.6,1) forwards' }}
          >
            {/* Handle */}
            <div className="w-10 h-1 bg-[#bdc3b9] rounded-full mx-auto mt-3 mb-1" />

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#2e4b3d]/8">
              <h2 className="font-sans font-bold text-[18px] text-charcoal-text flex items-center gap-2">
                <svg className="w-5 h-5 text-[#2e4b3d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {t('Mon panier', 'My cart')}
              </h2>
              <button
                className="w-8 h-8 rounded-full bg-[#2e4b3d]/8 flex items-center justify-center text-charcoal-text/60 hover:bg-[#2e4b3d]/15 transition-colors cursor-pointer"
                onClick={() => setIsCartOpen(false)}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Items */}
            <div className="px-6 pt-4 space-y-3">
              {cartItems.map(({ item, qty }) => (
                <div key={item.id} className="flex items-center gap-3 py-3 border-b border-[#2e4b3d]/6">
                  {/* Qty controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => changeQty(item.id, -1)}
                      className="w-7 h-7 rounded-full border border-[#2e4b3d]/30 text-[#2e4b3d] flex items-center justify-center font-bold text-[15px] hover:bg-[#2e4b3d]/8 transition-colors cursor-pointer"
                    >−</button>
                    <span className="font-bold text-[15px] text-charcoal-text w-5 text-center">{qty}</span>
                    <button
                      onClick={() => changeQty(item.id, 1)}
                      className="w-7 h-7 rounded-full bg-[#2e4b3d] text-[#FAF7F4] flex items-center justify-center font-bold text-[15px] hover:bg-[#1f3329] transition-colors cursor-pointer"
                    >+</button>
                  </div>
                  {/* Title */}
                  <span className="flex-grow font-sans text-[14px] text-charcoal-text leading-snug">
                    {getTranslatedText(item.title, item.title_en)}
                  </span>
                  {/* Price */}
                  <span className="font-bold text-[14px] text-terracotta whitespace-nowrap">
                    {(qty * item.price).toFixed(1)} DT
                  </span>
                  {/* Remove */}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    title="Supprimer"
                    className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-terracotta/8 hover:bg-terracotta hover:text-white text-terracotta transition-all cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="mx-6 mt-4 flex justify-between items-center bg-[#2e4b3d]/5 rounded-2xl px-5 py-3.5">
              <span className="font-sans font-semibold text-[14px] text-charcoal-text/70">{t('Total', 'Total')}</span>
              <strong className="font-sans font-bold text-[20px] text-charcoal-text">{cartTotal.toFixed(1)} DT</strong>
            </div>

            {/* Order form */}
            <div className="px-6 pt-5 pb-6 space-y-4">
              <div>
                <label className="block font-sans text-[11px] font-bold uppercase tracking-[0.15em] text-charcoal-text/50 mb-2">
                  {t('Votre prénom (optionnel)', 'Your first name (optional)')}
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder={t('Ex : Amine', 'e.g. Amine')}
                  className="w-full px-4 py-3 bg-white border border-[#2e4b3d]/15 rounded-xl font-sans text-[15px] text-charcoal-text placeholder:text-charcoal-text/30 focus:outline-none focus:border-[#2e4b3d]/40"
                />
              </div>
              <div>
                <label className="block font-sans text-[11px] font-bold uppercase tracking-[0.15em] text-charcoal-text/50 mb-2">
                  {t('Numéro de table', 'Table number')}
                </label>
                <select
                  value={tableNum}
                  onChange={e => setTableNum(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-[#2e4b3d]/15 rounded-xl font-sans text-[15px] text-charcoal-text focus:outline-none focus:border-[#2e4b3d]/40"
                >
                  <option value="">{t('Choisir une table...', 'Choose a table...')}</option>
                  {Array.from({ length: 20 }, (_, i) => i + 1).map(n => (
                    <option key={n} value={n}>{t('Table', 'Table')} {n}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={submitOrder}
                disabled={isSending || !tableNum}
                className="w-full py-4 bg-terracotta text-white rounded-xl font-sans text-[13px] font-bold uppercase tracking-wider hover:bg-[#6a3818] disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98] cursor-pointer"
              >
                {isSending ? t('Envoi…', 'Sending…') : t('Passer la commande →', 'Place order →')}
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Order success screen ── */}
      {orderSuccess && (
        <div
          className="fixed inset-0 z-[500] bg-[#FAF7F4] flex flex-col items-center justify-center text-center px-8"
          style={{ animation: 'fadeIn 0.3s ease-out' }}
        >
          <div className="w-20 h-20 rounded-full bg-[#2e4b3d]/10 flex items-center justify-center mb-6" style={{ animation: 'popIn 0.4s cubic-bezier(0.34,1.56,0.64,1) 0.1s both' }}>
            <svg className="w-10 h-10 text-[#2e4b3d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="font-sans font-bold text-[26px] text-charcoal-text mb-3">
            {t('Commande envoyée !', 'Order sent!')}
          </h2>
          <p className="font-sans text-[15px] text-charcoal-text/60 max-w-xs leading-relaxed mb-8">
            {t('Notre équipe prépare votre commande. Merci !', 'Our team is preparing your order. Thank you!')}
          </p>
          <button
            onClick={() => { setOrderSuccess(false); setCustomerName(''); setTableNum(''); }}
            className="px-8 py-3.5 bg-[#2e4b3d] text-white rounded-xl font-sans text-[13px] font-bold uppercase tracking-wider hover:bg-[#1f3329] transition-colors cursor-pointer"
          >
            {t('Nouvelle commande', 'New order')}
          </button>
        </div>
      )}

      {/* Keyframe animations */}
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes cartAppear {
          from { opacity: 0; transform: translate(-50%, 20px) scale(0.9); }
          to { opacity: 1; transform: translate(-50%, 0) scale(1); }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.5); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <Footer />

    </div>
  );
};

export default MenuPage;
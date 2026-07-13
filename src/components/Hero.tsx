import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export const Hero = () => {
  const { t } = useLanguage();

  return (
    <section
      id="hero"
      className="relative h-[90vh] flex items-center justify-center md:justify-start overflow-hidden px-6 md:px-[80px] pt-16 md:pt-20 bg-[#2e4b3d]"
      aria-label={t("Café Yucca — Café de Spécialité et Espace Hybride", "Café Yucca — Specialty Coffee and Hybrid Space")}
    >
      {/* Background image & overlay */}
      <div className="absolute inset-0 z-0">
        {/* Image wrapper: covers full screen on mobile, right-aligned on desktop */}
        <div className="absolute inset-0 md:left-auto md:w-[58vw] h-full overflow-hidden">
          <img
            src="/images/hero-bg.webp"
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover scale-105"
            style={{ objectPosition: 'center 45%' }}
            width="886"
            height="1600"
            fetchPriority="high"
            decoding="async"
          />
          {/* Mobile dark overlay */}
          <div className="absolute inset-0 bg-black/40 md:hidden animate-fadeIn" />
        </div>
        
        {/* Desktop: deep gradient from solid green into the image — no harsh edge */}
        <div className="hidden md:block absolute inset-y-0 left-0 right-0 bg-gradient-to-r from-[#2e4b3d] via-[#2e4b3d]/95 via-35% to-transparent to-85% pointer-events-none" />
        {/* Extra subtle vignette on the far right so image doesn't end abruptly */}
        <div className="hidden md:block absolute inset-y-0 right-0 w-[12vw] bg-gradient-to-l from-[#2e4b3d]/30 to-transparent pointer-events-none" />
      </div>

      {/* Content area: Centered on mobile, left-aligned on desktop */}
      <div className="relative z-10 text-center md:text-left text-off-white max-w-3xl md:max-w-[48%] curtain-reveal">
        {/* Eyebrow */}
        <span className="block font-sans text-[11px] uppercase tracking-[0.35em] text-off-white/60 mb-4">
          {t("Tunis · Café de Spécialité", "Tunis · Specialty Coffee")}
        </span>

        {/* Brand name as hero statement */}
        <h1 className="font-sans font-semibold text-[44px] xs:text-[52px] sm:text-[72px] md:text-[88px] lg:text-[104px] leading-tight tracking-[0.06em] mb-5 uppercase text-off-white">
          YUCCA CAFÉ
        </h1>

        {/* Thin divider */}
        <div className="w-12 h-[1px] bg-off-white/40 mb-6 mx-auto md:mx-0" />

        <p className="font-sans text-[15px] md:text-[16px] max-w-sm opacity-75 mb-8 leading-[1.7]">
          {t(
            "L'équilibre parfait entre café de spécialité et espace de travail optimisé.",
            "The perfect balance between specialty coffee and an optimized work space."
          )}
        </p>
        <div className="flex justify-center md:justify-start gap-6">
          <Link 
            to="/menu" 
            id="hero-discover-btn"
            className="border border-off-white/70 px-10 py-4 font-sans font-semibold text-[11px] uppercase tracking-[0.18em] hover:bg-off-white hover:text-[#2e4b3d] transition-all duration-400"
          >
            {t("Découvrir la Carte", "Discover the Menu")}
          </Link>
        </div>
      </div>
    </section>
  );
};


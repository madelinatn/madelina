import { Reveal } from './Reveal';
import { useLanguage } from '../context/LanguageContext';

export const OurStory = () => {
  const { t } = useLanguage();

  return (
    <section 
      id="esprit" 
      className="py-24 md:py-36 max-w-[1440px] mx-auto px-6 md:px-[80px]"
    >
      <div id="our-story" className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-[24px] items-center">
        
        {/* Left column: Philosophy */}
        <Reveal 
          y={30}
          duration={0.8}
          className="md:col-span-5 space-y-8"
        >
          <span className="text-terracotta font-sans text-[12px] font-semibold uppercase tracking-widest block">
            {t("Notre Concept", "Our Concept")}
          </span>
          <h2 className="font-sans text-[32px] md:text-[40px] leading-tight text-charcoal-text font-medium">
            {t("Café de spécialité & Productivité optimisée", "Specialty coffee & Optimized productivity")}
          </h2>
          <p className="font-sans text-base text-on-surface-variant leading-relaxed">
            {t(
              "Café Yucca est un espace hybride d'exception à Tunis, alliant café de spécialité et espace de travail optimisé dans un cadre moderne et végétalisé.",
              "Café Yucca is a premier hybrid space in Tunis, blending specialty coffee with an optimized work environment in a modern, biophilic setting."
            )}
          </p>
          <p className="font-sans text-base text-on-surface-variant leading-relaxed">
            {t(
              "Profitez d'un intérieur 100% non-fumeur avec assises ergonomiques et prises à chaque table, ou détendez-vous sur notre grande terrasse en bois naturel.",
              "Enjoy a 100% smoke-free interior with ergonomic seating and power outlets at every table, or unwind on our spacious wooden terrace."
            )}
          </p>
          
          <div className="pt-6 border-t border-outline-variant/30 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 text-oak-accent">
              <span className="material-symbols-outlined text-terracotta" style={{ fontVariationSettings: "'FILL' 1" }}>
                workspace_premium
              </span>
              <span className="font-sans text-[11px] font-semibold uppercase tracking-wider">
                {t("100% Non-Fumeur & Ergonomique", "100% Smoke-Free & Ergonomic")}
              </span>
            </div>
            <div className="flex items-center gap-3 text-oak-accent">
              <span className="material-symbols-outlined text-terracotta" style={{ fontVariationSettings: "'FILL' 1" }}>
                coffee_maker
              </span>
              <span className="font-sans text-[11px] font-semibold uppercase tracking-wider">
                {t("Machine La Spaziale & Latte Art", "La Spaziale & Latte Art")}
              </span>
            </div>
            <div className="flex items-center gap-3 text-oak-accent">
              <span className="material-symbols-outlined text-terracotta" style={{ fontVariationSettings: "'FILL' 1" }}>
                deck
              </span>
              <span className="font-sans text-[11px] font-semibold uppercase tracking-wider">
                {t("Terrasse en bois & Mur végétal", "Wooden Terrace & Green Wall")}
              </span>
            </div>
          </div>
        </Reveal>

        {/* Right column: Image */}
        <Reveal 
          scale={0.95}
          duration={0.8}
          className="md:col-start-7 md:col-span-6 relative group overflow-hidden luxury-border p-4 bg-[#FAF7F4]"
        >
          <img 
            alt={t("Café Yucca - Espace Hybride & Coworking", "Café Yucca - Hybrid Space & Coworking")} 
            className="w-full transition-all duration-700 ease-in-out scale-100 group-hover:scale-105 object-cover" 
            src="/images/our-concept.webp"
            width="894"
            height="1200"
            loading="lazy"
          />
        </Reveal>

      </div>
    </section>
  );
};


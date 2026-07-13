import { Reveal } from './Reveal';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export const FranchiseBanner = () => {
  const { t } = useLanguage();

  return (
    <section 
      id="franchise-section" 
      className="pb-24 md:pb-36 bg-surface-container-low"
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-[80px]">
        <Reveal
          y={30}
          duration={0.8}
          className="max-w-4xl mx-auto bg-surface-container-lowest p-8 md:p-12 luxury-border shadow-sm text-left"
        >
          {/* Header with Handshake Icon */}
          <div className="flex items-center gap-3.5 mb-6">
            <span 
              className="material-symbols-outlined text-terracotta text-[28px] md:text-[36px]" 
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24" }}
            >
              handshake
            </span>
            <h3 className="font-sans text-[22px] md:text-[26px] text-charcoal-text font-medium">
              {t("Franchise Yucca", "Yucca Franchise")}
            </h3>
          </div>
          
          {/* Description */}
          <p className="font-sans text-on-surface-variant text-sm md:text-base leading-[1.75] mb-8 font-light">
            {t(
              "Ouvrez votre propre Café Yucca. Un concept unique alliant café de spécialité et espace hybride optimisé.",
              "Open your own Café Yucca. A unique concept combining specialty coffee and an optimized hybrid space."
            )}
          </p>
          
          {/* CTA Link Button */}
          <div>
            <Link 
              to="/franchise" 
              id="home-franchise-cta-btn" 
              className="btn-green inline-flex uppercase tracking-[0.12em]"
            >
              {t("Devenir Franchisé", "Become a Franchisee")}
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
};



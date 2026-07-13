import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-surface-container-low border-t border-outline-variant py-24 text-left">
      <div className="max-w-[1440px] mx-auto px-6 md:px-[80px]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start mb-24">
          
          {/* Column 1: Brand */}
          <div className="space-y-6">
            <h3 className="font-sans text-[24px] md:text-[32px] text-charcoal-text font-light tracking-tighter">
              Café Yucca
            </h3>
            <p className="font-sans text-on-surface-variant text-sm leading-relaxed max-w-xs">
              {t(
                "Café Yucca est un espace hybride haut de gamme à Tunis, conçu pour offrir l’équilibre parfait entre la culture du café de spécialité et un environnement de travail optimisé.",
                "Café Yucca is a high-end hybrid space in Tunis, designed to offer the perfect balance between specialty coffee culture and an optimized working environment."
              )}
            </p>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="grid grid-cols-2 gap-12">
            <div className="flex flex-col gap-4 font-sans text-sm">
              <span className="text-[10px] text-terracotta font-semibold uppercase tracking-wider">
                Navigation
              </span>
              <Link className="text-on-surface-variant hover:text-terracotta transition-colors" to="/menu">
                {t("Le Menu", "Our Menu")}
              </Link>
              <a className="text-on-surface-variant hover:text-terracotta transition-colors" href="/#our-story">
                {t("Le Concept", "Our Concept")}
              </a>
              <a className="text-on-surface-variant hover:text-terracotta transition-colors" href="/#contact">
                Contact
              </a>
              <Link className="text-on-surface-variant hover:text-terracotta transition-colors" to="/franchise">
                Franchise
              </Link>
            </div>
            
            <div className="flex flex-col gap-4 font-sans text-sm">
              <span className="text-[10px] text-terracotta font-semibold uppercase tracking-wider">
                {t("Suivez-nous", "Follow Us")}
              </span>
              <a 
                className="text-on-surface-variant hover:text-terracotta transition-colors" 
                href="https://www.instagram.com/cafe_yucca_1/" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                Instagram
              </a>
            </div>
          </div>

          {/* Column 3: Hours */}
          <div className="flex flex-col gap-4 font-sans text-sm">
            <span className="text-[10px] text-terracotta font-semibold uppercase tracking-wider">
              {t("Horaires d'Ouverture", "Opening Hours")}
            </span>
            <p className="text-on-surface-variant">
              {t("Tous les jours : 06h00 – 00h00", "Every day: 06:00 AM – 00:00")}
            </p>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-outline-variant flex flex-col md:flex-row justify-between items-center gap-6 font-sans text-sm">
          <p className="text-on-surface-variant">
            © {new Date().getFullYear()} Café Yucca. {t("L'Art de Vivre.", "The Art of Living.")}
          </p>
          <div className="flex gap-8">
            <a className="text-xs uppercase tracking-wider text-on-surface-variant hover:text-terracotta" href="#">
              {t("Mentions Légales", "Legal Notice")}
            </a>
            <a className="text-xs uppercase tracking-wider text-on-surface-variant hover:text-terracotta" href="#">
              {t("Politique de Confidentialité", "Privacy Policy")}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};


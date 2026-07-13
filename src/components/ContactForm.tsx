import { Reveal } from './Reveal';
import { useLanguage } from '../context/LanguageContext';

export const ContactForm = () => {
  const { t } = useLanguage();

  return (
    <section id="contact" className="py-24 md:py-36 bg-surface-container-low">
      <div className="max-w-[1440px] mx-auto px-6 md:px-[80px]">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-[24px]">
          
          {/* Left column: Info & Contact Details */}
          <div className="md:col-span-5 space-y-10 text-left">
            <div>
              <span className="text-terracotta font-sans text-[12px] font-semibold uppercase tracking-widest block mb-6">
                {t("Nous Rejoindre", "Find Us")}
              </span>
              <h2 className="font-sans text-[32px] md:text-[40px] leading-tight text-charcoal-text font-medium mb-8">
                {t("Un cadre d'exception pour travailler & se détendre.", "An exceptional setting to work & relax.")}
              </h2>
            </div>

            {/* Contact Info Card */}
            <div className="bg-surface-container-lowest p-8 luxury-border shadow-sm space-y-6">
              <h3 className="font-sans text-[20px] md:text-[24px] text-charcoal-text font-medium mb-4">
                {t("Contact & Accès", "Contact & Access")}
              </h3>
              
              <div className="space-y-4 font-sans text-on-surface-variant text-sm">
                <div className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-terracotta mt-0.5">location_on</span>
                  <div>
                    <span className="font-bold block text-charcoal-text">{t("Adresse", "Address")}</span>
                    <span>
                       {t("Avenue Hédi Nouira, Ennasr 2, Ariana 2037, Tunisie", "Avenue Hédi Nouira, Ennasr 2, Ariana 2037, Tunisia")}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-terracotta mt-0.5">phone</span>
                  <div>
                    <span className="font-bold block text-charcoal-text">{t("Téléphone", "Phone")}</span>
                    <a href="tel:28299999" className="hover:text-terracotta transition-colors">28 299 999</a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-terracotta mt-0.5">mail</span>
                  <div>
                    <span className="font-bold block text-charcoal-text">{t("E-mail", "Email")}</span>
                    <a href="mailto:yucca.cafe.tn@gmail.com" className="hover:text-terracotta transition-colors">yucca.cafe.tn@gmail.com</a>
                  </div>
                </div>

                <div className="flex items-start gap-4 pt-4 border-t border-outline-variant/30">
                  <span className="material-symbols-outlined text-terracotta mt-0.5">schedule</span>
                  <div>
                    <span className="font-bold block text-charcoal-text">{t("Horaires", "Hours")}</span>
                    <p>{t("Tous les jours : 06h00 – 00h00", "Every day: 06:00 AM – 00:00")}</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right column: Interactive Map UI */}
          <Reveal
            scale={0.95}
            duration={0.8}
            className="md:col-start-7 md:col-span-6 h-[500px] md:h-[600px] luxury-border relative group overflow-hidden bg-surface-container-highest"
          >
            {/* Real Google Maps Iframe */}
            <iframe
              src="https://maps.google.com/maps?q=36.850937,10.157833&hl=fr&z=16&output=embed"
              className="w-full h-full border-0 absolute inset-0 z-0"
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Café Yucca Location Map"
            />

            {/* Overlaid UI */}
            <a 
              href="https://www.google.com/maps/place/Caf%C3%A9+Yucca/data=!4m2!3m1!1s0x0:0xfd4bfc9d611d9406?sa=X&ved=1t:2428&ictx=111"
              target="_blank"
              rel="noopener noreferrer"
              className="absolute top-8 left-8 bg-[#2e4b3d]/90 hover:bg-[#2e4b3d] backdrop-blur-sm p-4 shadow-lg luxury-border text-left block transition-colors z-10"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#f7f0de] flex items-center justify-center rounded-sm overflow-hidden">
                  <img src="/logos/logo1.svg" alt="Café Yucca" className="w-8 h-8 object-contain" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-off-white uppercase">Café Yucca</span>
                  <span className="block text-[10px] text-off-white/70">
                    {t("Ouvert jusqu'à 00:00", "Open until 00:00")}
                  </span>
                </div>
              </div>
            </a>
          </Reveal>

        </div>

      </div>
    </section>
  );
};


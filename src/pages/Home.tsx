import { Hero } from '../components/Hero';
import { OurStory } from '../components/OurStory';
import { Menu } from '../components/Menu';
import { Reviews } from '../components/Reviews';
import { ContactForm } from '../components/ContactForm';
import { FranchiseBanner } from '../components/FranchiseBanner';
import { Link } from 'react-router-dom';
import { Reveal } from '../components/Reveal';
import { useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

export const Home = () => {
  const { t } = useLanguage();
  useEffect(() => {
    document.title = "Café Yucca | Café de Spécialité & Espace Hybride";
  }, []);

  return (
    <main className="flex-grow">
      <Hero />

      {/* ── Our Story ── */}
      <OurStory />



      {/* ── Menu Preview ── */}
      <section
        id="carte"
        className="py-28 px-6 text-center bg-surface-container-low"
      >
        <div className="max-w-7xl mx-auto">
          <Reveal y={30} duration={0.6}>
            {/* label */}
            <span className="font-sans text-[11px] tracking-[0.3em] uppercase text-terracotta font-semibold">
              {t("Notre Menu", "Our Menu")}
            </span>

            {/* heading */}
            <h2 className="font-sans text-[clamp(2rem,4.5vw,3.2rem)] text-charcoal-text my-4 leading-[1.1] font-light tracking-tighter">
              {t("Découvrez notre Menu", "Discover our Menu")}
            </h2>

            {/* divider line */}
            <div className="flex items-center justify-center gap-5 mb-10">
              <span className="h-px w-24 bg-terracotta opacity-30" />
            </div>

            <p className="font-sans text-on-surface-variant max-w-[36rem] mx-auto mb-12 leading-[1.75] text-[1.0625rem]">
              {t(
                "Cafés de spécialité extraits à la perfection, douceurs artisanales et propositions salées préparées chaque jour.",
                "Specialty coffees perfectly extracted, artisanal sweets, and fresh savory options prepared daily."
              )}
            </p>
          </Reveal>

          <Menu isPreview={true} />

          <Reveal delay={0.1} duration={0.5} y={0} className="mt-14">
            <Link to="/menu" id="home-full-menu-btn" className="btn-green inline-flex">
              {t("Voir le Menu Complet", "View the Full Menu")}
            </Link>
          </Reveal>
        </div>
      </section>

      <Reviews />
      <ContactForm />
      <FranchiseBanner />
    </main>
  );
};



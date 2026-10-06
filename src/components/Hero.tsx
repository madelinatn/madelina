import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export const Hero = () => {
  const { scrollY } = useScroll();
  const bgY     = useTransform(scrollY, [0, 600], [0, 160]);
  const opacity = useTransform(scrollY, [0, 350], [1, 0]);
  const { t } = useLanguage();

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden bg-[#FAF7F4]"
      aria-label={t("Madelina — Pâtisserie Artisanale et Café à Bizerte", "Madelina — Artisanal Pastry and Coffee in Bizerte")}
    >
      {/* ── SEO h1 (visible to Google, visually styled as tagline) ── */}
      <h1 className="sr-only">
        {t(
          "Madelina — Pâtisserie Artisanale & Café à Bizerte, Tunisie | Fait maison par Haifa Ben Salem",
          "Madelina — Artisanal Pastry & Cafe in Bizerte, Tunisia | Homemade by Haifa Ben Salem"
        )}
      </h1>
      {/* ── Parallax hero image ── */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 z-0">
        <img
          src="/images/11.webp"
          sizes="100vw"
          alt={t("L'Atelier madélina — Pâtisserie artisanale", "Madelina Workshop — Artisanal Pastry")}
          className="w-full h-full object-cover scale-110"
          width="1920"
          height="1080"
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(105deg, rgba(250,247,244,0.97) 0%, rgba(250,247,244,0.82) 50%, rgba(250,247,244,0.10) 100%)',
          }}
        />
      </motion.div>

      {/* ── Content ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full pt-16 sm:pt-28 pb-20 flex items-center justify-between">

        {/* Left — text */}
        <div className="max-w-2xl">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="inline-flex items-center gap-2 mb-4 text-[10px] uppercase tracking-[0.3em] text-madelina-terracotta font-medium"
          >
            <span className="w-6 h-px bg-madelina-terracotta" />
            {t("L’Art de Vivre à Bizerte", "The Art of Living in Bizerte")}
            <span className="w-6 h-px bg-madelina-terracotta" />
          </motion.span>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="font-allenoire mb-8 leading-[0.92] whitespace-nowrap text-[clamp(2.2rem,5.5vw,5rem)] text-madelina-navy"
          >
            {t("Fait ", "Made ")}
            <span className="text-madelina-terracotta">
              {t("maison", "at home")}
            </span>
            <br />
            {t("Fait avec le ", "Made with ")}
            <span className="text-madelina-terracotta">
              {t("cœur", "heart")}
            </span>
            <br />
            {t("Fait pour ", "Made for ")}
            <span className="text-madelina-terracotta">
              {t("vous", "you")}
            </span>
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.65 }}
            className="text-lg leading-relaxed mb-12 text-balance text-[#7A6A5A] max-w-[36rem]"
          >
            {t(
              "Une pâtisserie artisanale, du café bien fait et des brunchs généreux, voilà l’esprit madélina.",
              "An artisanal pastry shop, well-crafted coffee, and generous brunches—this is the madélina spirit."
            )}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.85 }}
            className="flex flex-wrap gap-4"
          >
            <Link to="/menu" id="hero-menu-btn" className="btn-primary">
              {t("Découvrir le Menu", "Discover the Menu")}
            </Link>
            <Link to="/#contact" id="hero-reserve-btn" className="btn-outline">
              {t("Réserver vos gâteaux", "Book your cakes")}
            </Link>
          </motion.div>
        </div>

        {/* Right — real sticker badge PNG */}
        <div className="hidden lg:flex flex-col items-center gap-8 pr-8">
          {/* Floating sticker badge — real brand asset */}
          <motion.div
            className="select-none relative animate-float"
          >
            <div className="absolute inset-0 rounded-full border border-[#A64B2A]/20 scale-105" />
            <img
              src="/logos/logo_madelina-4.webp"
              alt={t("madélina — Fait maison. Fait avec le cœur.", "madelina — Homemade. Made with heart.")}
              className="w-56 h-56 object-cover rounded-full shadow-[0_16px_40px_rgba(166,75,42,0.25)] border-[6px] border-white/60 bg-white"
              width="224"
              height="224"
              loading="eager"
              fetchpriority="high"
              decoding="sync"
            />
          </motion.div>

          {/* Glass rating card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="glass-card rounded-2xl px-6 py-4 flex items-center gap-4"
          >
            <span className="font-display text-[2rem] text-madelina-terracotta leading-none">4.8</span>
            <div>
              <p className="font-sans text-[0.6rem] uppercase tracking-[0.2em] text-[#7A6A5A]">Google Rating</p>
              <p className="font-display text-sm text-madelina-navy">Excellent</p>
            </div>
          </motion.div>
        </div>
      </div>


    </section>
  );
};

import { MapPin, Clock, Phone, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

export const ContactForm = () => {
  const { t } = useLanguage();

  const infoItems = [
    {
      icon: <MapPin size={18} strokeWidth={1.5} />,
      label: t('Adresse', 'Address'),
      value: 'Sidi Salem, Bizerte, Tunisie',
      href: 'https://maps.google.com/?cid=13980415123916196393',
    },
    {
      icon: <Phone size={18} strokeWidth={1.5} />,
      label: t('Téléphone', 'Phone'),
      value: '72 413 676',
      href: 'tel:72413676',
    },
    {
      icon: <Mail size={18} strokeWidth={1.5} />,
      label: t('Email', 'Email'),
      value: 'contact@madelina.tn',
      href: 'mailto:contact@madelina.tn',
    },
    {
      icon: <Clock size={18} strokeWidth={1.5} />,
      label: t('Horaires', 'Hours'),
      value: t('07:00 — 23:00 · Mar—Dim', '07:00 — 23:00 · Tue—Sun'),
    },
  ];

  return (
  <section
    id="contact"
    className="bg-[#F2E9E1] pt-16 pb-28 px-6 relative overflow-hidden"
  >
    {/* background circle accent */}
    <div
      style={{
        background: 'radial-gradient(circle, rgba(166,75,42,0.05) 0%, rgba(166,75,42,0) 70%)'
      }}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 will-change-transform w-[56rem] h-[56rem] rounded-full pointer-events-none"
    />

    <div className="max-w-7xl mx-auto relative z-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

        {/* ── Left: info ── */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="font-sans text-[0.65rem] tracking-[0.3em] uppercase text-madelina-terracotta font-medium">
            {t("Nous Trouver", "Find Us")}
          </span>

          <h2 className="font-allenoire text-[clamp(2rem,5vw,3.5rem)] text-madelina-navy mt-3.5 mb-5 leading-[1.1]">
            {t("Venez nous", "Come and")}
            <br />
            <span className="text-madelina-terracotta">{t("Rendre Visite", "Visit Us")}</span>
          </h2>

          {/* divider */}
          <div className="flex items-center gap-4 mb-8">
            <span className="h-px w-12 bg-madelina-terracotta opacity-25" />
            <svg width="16" height="21" viewBox="0 0 100 130" fill="none" aria-hidden="true">
              <path d="M10 130 V52 Q10 10 50 10 Q90 10 90 52 V130 Z" stroke="#A64B2A" strokeWidth="7" fill="none" opacity="0.4"/>
            </svg>
            <span className="h-px flex-1 bg-madelina-terracotta opacity-25" />
          </div>

          <p className="font-sans text-[#7A6A5A] text-[1.0625rem] leading-[1.8] max-w-[30rem] mb-10">
            {t(
              "Une commande spéciale, une réservation ou simplement l’envie de partager un moment gourmand ? Passez nous voir ou appelez-nous.",
              "A special order, a reservation, or simply the desire to share a gourmet moment? Come see us or call us."
            )}
          </p>

          {/* Info cards */}
          <div className="space-y-4">
            {infoItems.map((item) => (
              <div
                key={item.label}
                id={`contact-${item.label.toLowerCase()}`}
                className="flex items-center gap-5 py-5 px-6 bg-[#FAF7F4] rounded-2xl border border-madelina-terracotta/10 hover:border-madelina-terracotta/30 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <div className="w-10 h-10 rounded-xl bg-madelina-terracotta/10 flex items-center justify-center text-madelina-terracotta shrink-0">
                  {item.icon}
                </div>
                <div>
                  <p className="font-sans text-[0.6rem] tracking-[0.2em] uppercase text-madelina-navy/40 mb-1">{item.label}</p>
                  {item.href
                    ? <a href={item.href} {...(item.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className="font-sans text-[0.9375rem] text-madelina-navy font-medium hover:text-madelina-terracotta transition-colors">{item.value}</a>
                    : <p className="font-sans text-[0.9375rem] text-madelina-navy font-medium">{item.value}</p>
                  }
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-10">
            <a
              href="tel:72413676"
              id="contact-call-btn"
              className="btn-primary inline-flex"
            >
              <Phone size={16} strokeWidth={1.5} />
              {t("Appeler Maintenant", "Call Now")}
            </a>
          </div>
        </motion.div>

        {/* ── Right: Google Map ── */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ delay: 0.1, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="group relative rounded-[2rem] overflow-hidden h-[520px] shadow-[0_24px_80px_rgba(42,33,24,0.12)] border-[6px] border-[#FAF7F4] transform-gpu will-change-transform"
        >
          <div className="absolute inset-0 bg-[#2A2118]/5 group-hover:bg-transparent transition-colors duration-700 pointer-events-none z-10" />
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3184.862413481232!2d9.87020031530733!3d37.28678007985145!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12e31f004e47d6bb%3A0xc204697bd9860a29!2smadelina%20%F0%9F%A7%A1!5e0!3m2!1sen!2stn!4v1711910452000!5m2!1sen!2stn"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Localisation madélina — Sidi Salem, Bizerte"
            className="transition-transform duration-700"
          />
        </motion.div>

      </div>
    </div>
  </section>
  );
};

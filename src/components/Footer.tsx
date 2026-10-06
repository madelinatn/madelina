import { Instagram, MapPin, Phone, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer
      id="footer"
      style={{ background: '#2A2118', color: '#F2E9E1', paddingTop: '5rem', paddingBottom: '2.5rem' }}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">

        {/* ── Top: emblem centred ── */}
        <div className="flex flex-col items-center mb-16">
          <div className="relative p-0.5 md:p-1 rounded-xl bg-[#FAF7F4] transition-transform duration-500 hover:scale-105 border border-[#A64B2A]/10 shadow-md">
            <img
              src="/logos/logo_madelina-1.webp"
              alt="madélina par Haifa Ben Salem"
              className="h-24 md:h-32 w-auto object-contain rounded-lg"
              width="256"
              height="256"
              loading="lazy"
              decoding="async"
              style={{ mixBlendMode: 'multiply' }}
            />
          </div>
          <p style={{ fontFamily: '"Playfair Display",serif', fontSize: '1.05rem', fontStyle: 'italic', color: 'rgba(242,233,225,0.7)', marginTop: '1.75rem', letterSpacing: '0.06em' }}>
            {t("Fait maison. Fait avec le cœur.", "Homemade. Made with heart.")}
          </p>
          {/* Elegant gold-ish line */}
          <div className="flex items-center gap-4 mt-8 w-full max-w-md">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[#A64B2A]/40 to-transparent" />
            <span style={{ color: '#A64B2A', fontSize: '0.65rem', opacity: 0.8 }}>✦</span>
            <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[#A64B2A]/40 to-transparent" />
          </div>
        </div>

        {/* ── 4-column grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">

          {/* Brand */}
          <div>
            <h4 style={{ fontFamily: '"Allenoire",serif', fontSize: '1.5rem', color: '#F2E9E1', marginBottom: '1rem', letterSpacing: '0.05em' }}>madélina</h4>
            <p style={{ fontFamily: '"Inter",sans-serif', fontSize: '0.875rem', color: 'rgba(242,233,225,0.55)', lineHeight: 1.75 }}>
              {t("Votre escale gourmande à Bizerte. Pâtisserie artisanale et café d'exception.", "Your gourmet stop in Bizerte. Artisanal pastry and exceptional coffee.")}
            </p>
              <a
                href="https://www.instagram.com/madelina_bizerte/"
                id="footer-instagram"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="inline-flex items-center gap-2 mt-2 px-5 py-2.5 rounded-full"
                style={{ border: '1px solid rgba(166,75,42,0.4)', color: '#F2E9E1', transition: 'all 0.3s', background: 'rgba(166,75,42,0.1)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#A64B2A'; (e.currentTarget as HTMLElement).style.borderColor = '#A64B2A'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(166,75,42,0.1)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(166,75,42,0.4)'; }}
              >
                <Instagram size={16} strokeWidth={1.5} />
                <span style={{ fontFamily: '"Inter",sans-serif', fontSize: '0.8rem', letterSpacing: '0.05em' }}>@madelina_bizerte</span>
              </a>
          </div>

          {/* Navigation */}
          <div>
            <h4 style={{ fontFamily: '"Inter",sans-serif', fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(242,233,225,0.4)', marginBottom: '1.25rem' }}>Navigation</h4>
            <ul className="space-y-3" style={{ fontFamily: '"Inter",sans-serif', fontSize: '0.875rem' }}>
              {[
                { label: t('Accueil', 'Home'),   href: '/'        },
                { label: t('Le Menu', 'Our Menu'),   href: '/menu'    },
                { label: t("L'Atelier", 'Our Story'), href: '/#our-story' },
                { label: 'Contact',   href: '/#contact' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    style={{ color: 'rgba(242,233,225,0.55)', transition: 'color 0.3s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#A64B2A')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(242,233,225,0.55)')}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ fontFamily: '"Inter",sans-serif', fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(242,233,225,0.4)', marginBottom: '1.25rem' }}>Contact</h4>
            <ul className="space-y-4" style={{ fontFamily: '"Inter",sans-serif', fontSize: '0.875rem', color: 'rgba(242,233,225,0.55)' }}>
              <li className="flex items-start gap-3">
                <MapPin size={14} strokeWidth={1.5} style={{ color: '#A64B2A', flexShrink: 0, marginTop: '0.2rem' }} />
                <span>Sidi Salem, Bizerte, Tunisie</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={14} strokeWidth={1.5} style={{ color: '#A64B2A', flexShrink: 0 }} />
                <a href="tel:72413676" id="footer-phone" style={{ transition: 'color 0.3s' }}
                   onMouseEnter={e => (e.currentTarget.style.color = '#A64B2A')}
                   onMouseLeave={e => (e.currentTarget.style.color = 'rgba(242,233,225,0.55)')}>
                  72 413 676
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={14} strokeWidth={1.5} style={{ color: '#A64B2A', flexShrink: 0 }} />
                <a href="mailto:contact@madelina.tn" id="footer-email" style={{ transition: 'color 0.3s' }}
                   onMouseEnter={e => (e.currentTarget.style.color = '#A64B2A')}
                   onMouseLeave={e => (e.currentTarget.style.color = 'rgba(242,233,225,0.55)')}>
                  contact@madelina.tn
                </a>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h4 style={{ fontFamily: '"Inter",sans-serif', fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(242,233,225,0.4)', marginBottom: '1.25rem' }}>{t("Horaires", "Hours")}</h4>
            <ul className="space-y-3" style={{ fontFamily: '"Inter",sans-serif', fontSize: '0.875rem', color: 'rgba(242,233,225,0.55)' }}>
              <li className="flex justify-between">
                <span>{t("Mar — Dim", "Tue — Sun")}</span>
                <span style={{ color: '#F2E9E1', fontWeight: 500 }}>07:00 — 23:00</span>
              </li>
              <li className="flex justify-between">
                <span>{t("Lundi", "Monday")}</span>
                <span style={{ color: '#A64B2A', fontWeight: 500 }}>{t("Fermé", "Closed")}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div style={{ borderTop: '1px solid rgba(166,75,42,0.15)', paddingTop: '1.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <p style={{ fontFamily: '"Inter",sans-serif', fontSize: '0.75rem', color: 'rgba(242,233,225,0.3)', textAlign: 'center' }}>
            © {new Date().getFullYear()} madélina par Haifa Ben Salem. {t("Tous droits réservés.", "All rights reserved.")}
          </p>
          <p style={{ fontFamily: '"Playfair Display",serif', fontSize: '0.7rem', color: 'rgba(166,75,42,0.5)', letterSpacing: '0.08em', textAlign: 'center' }}>
            {t("Fait maison. Fait avec le cœur. Fait pour vous.", "Homemade. Made with heart. Made for you.")}
          </p>
        </div>
      </div>
    </footer>
  );
};

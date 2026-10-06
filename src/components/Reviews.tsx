import { Star, Quote } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

export const Reviews = () => {
  const { t } = useLanguage();

  const reviews = [
    {
      name: 'Tia Maria',
      text: t('Un endroit magnifique, une décoration soignée et des pâtisseries dignes des plus grands salons parisiens. Le fraisier est à tomber !', 'A magnificent place, careful decoration, and pastries worthy of the greatest Parisian salons. The strawberry cake is to die for!'),
      rating: 5,
      date: t('Il y a 2 mois', '2 months ago'),
    },
    {
      name: 'Houyem',
      text: t("Le meilleur brunch de Bizerte. L'accueil est chaleureux et l'ambiance vintage avec les vinyles est juste parfaite.", "The best brunch in Bizerte. The welcome is warm and the vintage atmosphere with vinyls is just perfect."),
      rating: 5,
      date: t('Il y a 3 semaines', '3 weeks ago'),
    },
    {
      name: 'Ahmed B.',
      text: t('Une expérience authentique. On sent le goût du fait maison dans chaque bouchée. Je recommande vivement la tarte au citron.', 'An authentic experience. You can taste the homemade in every bite. I highly recommend the lemon tart.'),
      rating: 4,
      date: t('Il y a 1 mois', '1 month ago'),
    },
  ];

  return (
  <section
    id="reviews"
    style={{ background: '#2A2118', paddingTop: '7rem', paddingBottom: '2.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem', position: 'relative', overflow: 'hidden' }}
  >
    {/* Subtle ambient glow */}
    <div
      style={{
        position: 'absolute', top: '-12rem', left: '-12rem',
        width: '30rem', height: '30rem',
        background: 'radial-gradient(circle, rgba(166,75,42,0.08) 0%, rgba(166,75,42,0) 70%)',
        borderRadius: '9999px', pointerEvents: 'none',
      }}
    />
    <div
      style={{
        position: 'absolute', bottom: '-12rem', right: '-12rem',
        width: '30rem', height: '30rem',
        background: 'radial-gradient(circle, rgba(166,75,42,0.05) 0%, rgba(166,75,42,0) 70%)',
        borderRadius: '9999px', pointerEvents: 'none',
      }}
    />

    <div className="max-w-7xl mx-auto" style={{ position: 'relative', zIndex: 1 }}>

      {/* Header row */}
      <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-12 mb-20">

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "150px" }}
          transition={{ duration: 0.6 }}
        >
          <span style={{ fontFamily: '"Inter",sans-serif', fontSize: '0.65rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#A64B2A', fontWeight: 500 }}>
            {t("Témoignages", "Testimonials")}
          </span>
          <h2 style={{ fontFamily: '"Allenoire",serif', fontSize: 'clamp(2rem,5vw,3.5rem)', color: '#F2E9E1', marginTop: '0.75rem', lineHeight: 1.1 }}>
            {t("L’expérience ", "The ")}
            <span style={{ color: '#A64B2A' }}>madélina</span>
            <br />{t("vue par vous", "experience seen by you")}
          </h2>
        </motion.div>

        {/* Rating badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "150px" }}
          transition={{ delay: 0.1, duration: 0.6 }}
          style={{
            background: '#342B22',
            border: '1px solid rgba(166,75,42,0.25)',
            borderRadius: '1.5rem',
            padding: '1.5rem 2.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: '"Playfair Display",serif', fontSize: '3rem', color: '#A64B2A', lineHeight: 1 }}>4.8</div>
            <div style={{ fontFamily: '"Inter",sans-serif', fontSize: '0.6rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(242,233,225,0.35)', marginTop: '0.2rem' }}>{t("Sur 5", "Out of 5")}</div>
          </div>
          <div style={{ width: '1px', height: '3rem', background: 'rgba(166,75,42,0.2)' }} />
          <div>
            <div style={{ display: 'flex', gap: '0.2rem', marginBottom: '0.5rem' }}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill="#A64B2A" color="#A64B2A" />
              ))}
            </div>
            <div style={{ fontFamily: '"Inter",sans-serif', fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(242,233,225,0.4)' }}>Google Reviews</div>
          </div>
        </motion.div>
      </div>

      {/* Review cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reviews.map((review, i) => (
          <motion.article
            key={i}
            id={`review-card-${i + 1}`}
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "150px" }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(166,75,42,0.15)',
              borderRadius: '2rem',
              padding: '2.5rem',
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              transition: 'background 0.5s, border-color 0.5s',
              cursor: 'default',
            }}
            whileHover={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
          >
            {/* Quote icon + date */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem' }}>
              <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', background: 'rgba(166,75,42,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Quote size={16} color="#A64B2A" strokeWidth={1.5} />
              </div>
              <span style={{ fontFamily: '"Inter",sans-serif', fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(242,233,225,0.25)' }}>
                {review.date}
              </span>
            </div>

            {/* Text */}
            <p style={{ fontFamily: '"Lora","Playfair Display",serif', fontSize: '1rem', color: 'rgba(242,233,225,0.8)', lineHeight: 1.8, fontStyle: 'italic', flexGrow: 1, marginBottom: '2rem' }}>
              &ldquo;{review.text}&rdquo;
            </p>

            {/* Author + stars */}
            <div style={{ borderTop: '1px solid rgba(166,75,42,0.12)', paddingTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontFamily: '"Playfair Display",serif', fontSize: '0.975rem', color: '#F2E9E1' }}>{review.name}</p>
                <p style={{ fontFamily: '"Inter",sans-serif', fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(242,233,225,0.3)', marginTop: '0.15rem' }}>{t("Client vérifié", "Verified Customer")}</p>
              </div>
              <div style={{ display: 'flex', gap: '0.2rem' }}>
                {[...Array(5)].map((_, j) => (
                  <Star key={j} size={11} fill={j < review.rating ? '#A64B2A' : 'none'} color="#A64B2A" strokeWidth={1.5} />
                ))}
              </div>
            </div>
          </motion.article>
        ))}
      </div>

      {/* Leave a review button (Yucca-style Google Reviews button in Madelina design) */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.25, duration: 0.6 }}
        className="flex flex-col items-center justify-center mt-12 md:mt-16 text-center"
      >
        <a
          href="https://search.google.com/local/writereview?placeid=ChIJu9ZHTgAf4xIRKQqG2XtpBMI"
          target="_blank"
          rel="noopener noreferrer"
          id="google-review-btn"
          className="group inline-flex items-center gap-3.5 px-8 py-4 rounded-full transition-all duration-300 shadow-lg hover:shadow-2xl cursor-pointer"
          style={{
            background: 'rgba(166,75,42,0.12)',
            border: '1.5px solid rgba(166,75,42,0.4)',
            color: '#F2E9E1',
            fontFamily: '"Inter", sans-serif',
            fontSize: '0.875rem',
            fontWeight: 600,
            letterSpacing: '0.04em',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = '#A64B2A';
            (e.currentTarget as HTMLElement).style.borderColor = '#A64B2A';
            (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = 'rgba(166,75,42,0.12)';
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(166,75,42,0.4)';
            (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
          }}
        >
          <svg className="w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.2 8.9 5 12 5z"/>
            <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"/>
            <path fill="#FBBC05" d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.7s.1-2 .4-2.7L1.6 6.4C.6 8.3 0 10.6 0 12s.6 3.7 1.6 5.6l3.7-2.9z"/>
            <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.1-6.7-5L1.6 16.2C3.5 20.4 7.4 23 12 23z"/>
          </svg>
          <span>{t("Laisser un avis sur Google", "Leave a Google Review")}</span>
          <span className="text-[#A64B2A] group-hover:text-white transition-colors text-xs font-bold tracking-wider ml-1">★ 5.0</span>
        </a>
        <p className="font-sans text-[0.7rem] text-[#F2E9E1]/35 mt-3 tracking-wider uppercase">
          {t("Votre avis compte beaucoup pour nous", "Your feedback means the world to us")}
        </p>
      </motion.div>
    </div>
  </section>
  );
};

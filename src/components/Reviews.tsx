import { Reveal } from './Reveal';
import { useLanguage } from '../context/LanguageContext';

export const Reviews = () => {
  const { t } = useLanguage();

  const reviews = [
    {
      name: 'Mehdi Skikdi',
      initials: 'M.S',
      badge: t('Local Guide · 108 avis', 'Local Guide · 108 reviews'),
      time: t('Il y a 4 mois', '4 months ago'),
      text: t(
        "Super endroit, propre et bien organisé (avec le concept de self-service) mais surtout... politique non-fumeur stricte (assez rare dans la région)",
        "Great place, clean and well organised (with self service concept) but most importantly... strict non-smoking policy (quiet rare in the area)"
      ),
      rating: 5,
    },
    {
      name: 'Mohamed Slim KASSIS',
      initials: 'M.K',
      badge: t('Local Guide · 5 avis', 'Local Guide · 5 reviews'),
      time: '',
      text: t(
        "Le concept de self-service est vraiment excellent : c'est simple à utiliser, efficace et vous donne la liberté de choisir exactement ce dont vous avez besoin, à votre propre rythme.",
        "The self-service concept is truly excellent: it’s simple to use, efficient, and gives you the freedom to choose exactly what you need, at your own pace."
      ),
      rating: 5,
    },
    {
      name: 'Marwa Djebbi',
      initials: 'M.D',
      badge: t('Local Guide · 50 avis · 372 photos', 'Local Guide · 50 reviews · 372 photos'),
      time: t('Il y a 2 mois', '2 months ago'),
      text: t(
        "Mon endroit préféré pour travailler et étudier. Et le mieux, c'est que l'intérieur est une zone non-fumeur. Le personnel est incroyable et propose de nombreux choix de boissons et de nourriture.",
        "My fav place to work and study. And the best thing is the interior is a non smoking area. The staff are amazing and they do have multiple choices for drinks and food"
      ),
      rating: 5,
    },
  ];

  return (
    <section id="experiences" className="py-24 md:py-36 max-w-[1440px] mx-auto px-6 md:px-[80px]">
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
        <div className="max-w-2xl text-left">
          <span className="text-terracotta font-sans text-[12px] font-semibold uppercase tracking-widest block mb-4">
            {t("Expériences", "Experiences")}
          </span>
          <h2 className="font-sans text-[32px] md:text-[40px] leading-tight text-charcoal-text font-medium">
            {t("Ce que nos visiteurs racontent de leurs instants chez nous.", "What our visitors say about their moments with us.")}
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
        {reviews.map((review, i) => (
          <Reveal
            key={i}
            delay={i * 0.1}
            y={30}
            className="testimonial-card p-8 bg-surface-container-lowest"
          >
            {/* Stars */}
            <div className="flex gap-1 text-terracotta mb-6">
              {[...Array(review.rating)].map((_, starIdx) => (
                <span 
                  key={starIdx} 
                  className="material-symbols-outlined text-sm" 
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  star
                </span>
              ))}
            </div>

            {/* Text */}
            <p className="font-sans text-on-surface-variant italic mb-8 leading-relaxed">
              "{review.text}"
            </p>

            {/* Author */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-terracotta/12 flex items-center justify-center font-sans text-xs font-semibold text-terracotta">
                {review.initials}
              </div>
              <div>
                <span className="block font-sans text-[12px] font-semibold text-charcoal-text uppercase tracking-wide">
                  {review.name}
                </span>
                <span className="block text-[10px] text-on-surface-variant uppercase tracking-tighter">
                  {review.badge}{review.time ? ` • ${review.time}` : ''}
                </span>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Leave a review button */}
      <div className="flex flex-col items-center justify-center mt-12 md:mt-16 text-center">
        <a
          href="https://search.google.com/local/writereview?placeid=ChIJjwOPdQAz_RIRBpQdYZ38S_0"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-outline inline-flex items-center gap-3 border-[#2A2118] text-[#2A2118] hover:bg-[#2A2118] hover:text-[#FAF7F4] transition-all duration-300"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.478 0-6.3-2.823-6.3-6.3 0-3.478 2.822-6.3 6.3-6.3 1.63 0 3.11.618 4.24 1.636l3.056-3.056C19.16 2.502 15.9 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 11.24-4.54 11.24-11.24 0-.76-.078-1.5-.22-2.195H12.24z"/>
          </svg>
          {t("Laisser un avis Google", "Leave a Google Review")}
        </a>
      </div>
    </section>
  );
};

import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useLanguage } from '../context/LanguageContext';


const FranchisePage = () => {
  const { t } = useLanguage();

  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    zone: '',
    has_local: null as boolean | null,
    message: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = t("Franchise - Café Yucca", "Franchise - Café Yucca");
  }, [t]);

  const handleChange = (field: string, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (!form.full_name.trim() || !form.phone.trim() || !form.email.trim() || !form.zone) {
      setError(t('Veuillez remplir tous les champs obligatoires.', 'Please fill in all required fields.'));
      return;
    }
    if (form.has_local === null) {
      setError(t('Veuillez indiquer si vous disposez d\'un local.', 'Please indicate if you have a commercial space.'));
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/franchise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (res.ok) {
        setSubmitted(true);
        // Scroll back to top to see success state
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const data = await res.json() as { error?: string };
        setError(data.error || t('Une erreur est survenue lors de l\'envoi.', 'An error occurred during submission.'));
      }
    } catch {
      setError(t('Erreur de connexion. Veuillez réessayer.', 'Connection error. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface-container-low">
      <Header />

      <main className="flex-grow pt-28 pb-20 relative overflow-hidden">
        <div className="max-w-3xl mx-auto relative z-10 px-6">

          {/* ── Page Heading ── */}
          <div className="text-center mb-12 md:mb-16 animate-fadeIn">
            <span className="font-sans text-[11px] tracking-[0.3em] uppercase text-terracotta font-semibold block mb-4">
              Café Yucca
            </span>
            <h1 className="text-4xl md:text-6xl mb-5 font-sans font-light tracking-tighter text-charcoal-text">
              {t("Demande de Franchise", "Franchise Application")}
            </h1>
            <div className="h-px w-20 bg-terracotta mx-auto opacity-60 mb-6" />
            <p className="font-sans text-on-surface-variant text-[15px] md:text-[16px] leading-relaxed max-w-lg mx-auto">
              {t(
                "Rejoignez notre réseau et déployez notre concept chez vous.",
                "Join our network and bring our concept to your area."
              )}
            </p>
          </div>

          {/* ── Success State ── */}
          {submitted ? (
            <div className="text-center py-20 animate-fadeIn">
              <div className="w-20 h-20 mx-auto mb-8 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-4xl">check_circle</span>
              </div>
              <h2 className="font-sans text-2xl md:text-3xl text-charcoal-text font-light tracking-tight mb-4">
                {t("Candidature envoyée !", "Application submitted!")}
              </h2>
              <p className="font-sans text-on-surface-variant text-sm leading-relaxed max-w-md mx-auto mb-8">
                {t(
                  "Merci pour votre intérêt. Notre équipe examinera votre demande et vous contactera dans les plus brefs délais.",
                  "Thank you for your interest. Our team will review your application and contact you shortly."
                )}
              </p>
              <a href="/" className="btn-green inline-flex">
                {t("Retour à l'accueil", "Back to Home")}
              </a>
            </div>
          ) : (
            /* ── Form ── */
            <form
              onSubmit={handleSubmit}
              className="space-y-10 animate-fadeIn"
              style={{ animationDelay: '0.15s', animationFillMode: 'both' }}
            >
              {/* Part 1: Identité */}
              <div className="bg-[#FAF7F4] border border-outline-variant/30 p-8 shadow-sm space-y-6">
                <h2 className="font-sans font-semibold text-lg text-charcoal-text mb-4">
                  1. {t("Vos Coordonnées", "Contact Details")}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
                  <div>
                    <label htmlFor="franchise-name" className="block font-sans text-xs font-semibold uppercase tracking-wider text-charcoal-text mb-2">
                      {t("Nom Complet *", "Full Name *")}
                    </label>
                    <input
                      id="franchise-name"
                      type="text"
                      required
                      value={form.full_name}
                      onChange={e => handleChange('full_name', e.target.value)}
                      placeholder="Mehdi Ben Youssef"
                      className="w-full px-4 py-3.5 bg-surface-container-low border border-outline-variant/40 font-sans text-sm text-charcoal-text placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label htmlFor="franchise-phone" className="block font-sans text-xs font-semibold uppercase tracking-wider text-charcoal-text mb-2">
                      {t("Téléphone *", "Phone *")}
                    </label>
                    <input
                      id="franchise-phone"
                      type="tel"
                      required
                      value={form.phone}
                      onChange={e => handleChange('phone', e.target.value)}
                      placeholder="+216 28 299 999"
                      className="w-full px-4 py-3.5 bg-surface-container-low border border-outline-variant/40 font-sans text-sm text-charcoal-text placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="text-left">
                  <label htmlFor="franchise-email" className="block font-sans text-xs font-semibold uppercase tracking-wider text-charcoal-text mb-2">
                    {t("Adresse E-mail *", "Email Address *")}
                  </label>
                  <input
                    id="franchise-email"
                    type="email"
                    required
                    value={form.email}
                    onChange={e => handleChange('email', e.target.value)}
                    placeholder="mehdi@example.com"
                    className="w-full px-4 py-3.5 bg-surface-container-low border border-outline-variant/40 font-sans text-sm text-charcoal-text placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition-all duration-300"
                  />
                </div>
              </div>

              {/* Part 2: Le Projet */}
              <div className="bg-[#FAF7F4] border border-outline-variant/30 p-8 shadow-sm space-y-6">
                <h2 className="font-sans font-semibold text-lg text-charcoal-text mb-4">
                  2. {t("Le Projet", "The Project")}
                </h2>

                <div className="text-left">
                  <label htmlFor="franchise-zone" className="block font-sans text-xs font-semibold uppercase tracking-wider text-charcoal-text mb-2">
                    {t("Zone / Ville d'implantation souhaitée *", "Desired Location / City *")}
                  </label>
                  <input
                    id="franchise-zone"
                    type="text"
                    required
                    value={form.zone}
                    onChange={e => handleChange('zone', e.target.value)}
                    placeholder="La Marsa, Sousse, Lac 2..."
                    className="w-full px-4 py-3.5 bg-surface-container-low border border-outline-variant/40 font-sans text-sm text-charcoal-text placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition-all duration-300"
                  />
                </div>

                {/* Has Local selection (Radio group) */}
                <div className="text-left">
                  <label className="block font-sans text-xs font-semibold uppercase tracking-wider text-charcoal-text mb-4">
                    {t("Disposez-vous d'un local commercial ? *", "Do you have a commercial space? *")}
                  </label>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => handleChange('has_local', true)}
                      className={`px-5 py-4 border font-sans text-sm text-left transition-all duration-300 flex items-center justify-between cursor-pointer ${
                        form.has_local === true
                          ? 'border-primary bg-primary/5 text-primary font-semibold'
                          : 'border-outline-variant/40 text-on-surface-variant hover:border-primary/40'
                      }`}
                    >
                      {t("Oui, j'ai déjà un local", "Yes, I already have a local")}
                      {form.has_local === true && <span className="material-symbols-outlined text-primary text-lg">check_circle</span>}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleChange('has_local', false)}
                      className={`px-5 py-4 border font-sans text-sm text-left transition-all duration-300 flex items-center justify-between cursor-pointer ${
                        form.has_local === false
                          ? 'border-primary bg-primary/5 text-primary font-semibold'
                          : 'border-outline-variant/40 text-on-surface-variant hover:border-primary/40'
                      }`}
                    >
                      {t("Non, je suis en recherche", "No, I am searching")}
                      {form.has_local === false && <span className="material-symbols-outlined text-primary text-lg">check_circle</span>}
                    </button>
                  </div>
                </div>

                {/* Message */}
                <div className="text-left">
                  <label htmlFor="franchise-message" className="block font-sans text-xs font-semibold uppercase tracking-wider text-charcoal-text mb-2">
                    {t("Message / Motivations", "Message / Motivations")}
                  </label>
                  <textarea
                    id="franchise-message"
                    rows={4}
                    value={form.message}
                    onChange={e => handleChange('message', e.target.value)}
                    placeholder={t(
                      "Parlez-nous brièvement de votre projet...",
                      "Tell us briefly about your project..."
                    )}
                    className="w-full px-4 py-3.5 bg-surface-container-low border border-outline-variant/40 font-sans text-sm text-charcoal-text placeholder:text-on-surface-variant/40 resize-none focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition-all duration-300"
                  />
                </div>

                {/* ── Error ── */}
                {error && (
                  <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200/60 text-red-700 font-sans text-sm animate-fadeIn">
                    <span className="material-symbols-outlined text-lg">error</span>
                    {error}
                  </div>
                )}

                {/* ── CTA Button ── */}
                <div className="text-center pt-6">
                  <button
                    type="submit"
                    disabled={submitting}
                    id="franchise-submit-btn"
                    className="w-full sm:w-auto btn-green border border-[#2e4b3d] font-sans text-[12px] font-bold uppercase tracking-[0.18em] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center gap-3">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        {t("Envoi en cours...", "Submitting...")}
                      </span>
                    ) : (
                      t("Soumettre ma candidature", "Submit my application")
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FranchisePage;

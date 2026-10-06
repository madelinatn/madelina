import { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled down
  const toggleVisibility = () => {
    if (window.scrollY > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Scroll to top smoothly
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 p-4 rounded-full bg-white text-[#A64B2A] border border-[#A64B2A]/20 shadow-[0_4px_12px_rgba(166,75,42,0.15)] hover:bg-[#A64B2A] hover:text-white transition-all duration-300"
          aria-label="Scroll to top"
        >
          <ChevronUp size={28} strokeWidth={2} />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

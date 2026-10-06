// App.tsx
import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { ScrollToTopButton } from './components/ScrollToTopButton';

// Lazy load the MenuPage to split the bundle and speed up initial page load
const MenuPage = lazy(() => import('./pages/MenuPage'));

// Scroll to #hash after navigation
function ScrollToHash() {
  const { hash, pathname } = useLocation();
  useEffect(() => {
    if (hash) {
      // Small delay so the DOM renders first
      setTimeout(() => {
        const el = document.querySelector(hash);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [hash, pathname]);
  return null;
}

// Fallback component while MenuPage is loading
const PageLoader = () => (
  <div className="min-h-screen flex flex-col bg-white">
    <Header />
    <main className="flex-grow pt-28 pb-20 relative overflow-hidden flex items-center justify-center">
      <div className="flex flex-col items-center animate-fadeIn">
        <div className="w-8 h-8 border-4 border-madelina-terracotta/20 border-t-madelina-terracotta rounded-full animate-spin mb-4"></div>
        <div className="font-display text-madelina-navy/40">Chargement...</div>
      </div>
    </main>
    <Footer />
  </div>
);

export default function App() {
  return (
    <Router basename="/">
      <ScrollToHash />
      <div className="min-h-screen flex flex-col selection:bg-madelina-terracotta selection:text-white">
        <Routes>
          <Route path="/" element={<><Header /><Home /><Footer /></>} />
          <Route 
            path="/menu" 
            element={
              <Suspense fallback={<PageLoader />}>
                <MenuPage />
              </Suspense>
            } 
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <ScrollToTopButton />
      </div>
    </Router>
  );
}
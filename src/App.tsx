// App.tsx
import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { ScrollToTopButton } from './components/ScrollToTopButton';

// Lazy load pages to split the bundle and speed up initial page load
const MenuPage = lazy(() => import('./pages/MenuPage'));
const FranchisePage = lazy(() => import('./pages/FranchisePage'));
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage'));
const AdminPortalPage = lazy(() => import('./pages/AdminPortalPage'));
const AdminFranchisePage = lazy(() => import('./pages/AdminFranchisePage'));

// Scroll to #hash after navigation
function ScrollToHash() {
  const { hash, pathname } = useLocation();
  useEffect(() => {
    if (hash) {
      // Small delay so the DOM renders first
      setTimeout(() => {
        const el = document.querySelector(hash);
        if (el) {
          const elementPosition = el.getBoundingClientRect().top + window.scrollY;
          let offsetPosition = elementPosition - 100; // Default offset for fixed header
          
          if (hash === '#franchise-section') {
            // Center the card vertically in the screen
            const viewportHeight = window.innerHeight;
            const elementHeight = el.clientHeight;
            const targetOffset = elementPosition + elementHeight / 2 - viewportHeight / 2;
            const minOffset = elementPosition - 100; // Keep at least 100px top clearance
            offsetPosition = Math.min(targetOffset, minOffset);
          } else {
            // For #our-story or other anchors, align right below the header
            offsetPosition = elementPosition - 100;
          }
          
          window.scrollTo({
            top: Math.max(0, offsetPosition),
            behavior: 'smooth'
          });
        }
      }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [hash, pathname]);
  return null;
}

// Fallback component while pages are loading
const PageLoader = () => (
  <div className="min-h-screen flex flex-col bg-[#FAF7F4]">
    <Header />
    <main className="flex-grow pt-28 pb-20 relative overflow-hidden flex items-center justify-center">
      <div className="flex flex-col items-center animate-fadeIn">
        <div className="w-8 h-8 border-4 border-[#2e4b3d]/20 border-t-[#2e4b3d] rounded-full animate-spin mb-4"></div>
        <div className="font-sans text-charcoal-text/40">Chargement...</div>
      </div>
    </main>
    <Footer />
  </div>
);

// Minimal loader for admin (no Header/Footer)
const AdminLoader = () => (
  <div className="min-h-screen bg-[#FAF7F4] flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-[#2e4b3d]/20 border-t-[#2e4b3d] rounded-full animate-spin" />
  </div>
);

export default function App() {
  return (
    <Router basename="/">
      <ScrollToHash />
      <div className="min-h-screen flex flex-col selection:bg-terracotta selection:text-white">
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
          <Route 
            path="/franchise" 
            element={
              <Suspense fallback={<PageLoader />}>
                <FranchisePage />
              </Suspense>
            } 
          />
          <Route 
            path="/admin-login" 
            element={
              <Suspense fallback={<AdminLoader />}>
                <AdminLoginPage />
              </Suspense>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <Suspense fallback={<AdminLoader />}>
                <AdminPortalPage />
              </Suspense>
            } 
          />
          <Route 
            path="/admin-franchise" 
            element={
              <Suspense fallback={<AdminLoader />}>
                <AdminFranchisePage />
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
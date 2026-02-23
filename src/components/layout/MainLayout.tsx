import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MobileNav from '@/components/layout/MobileNav';
import CartDrawer from '@/components/cart/CartDrawer';
import ChatWidget from '@/components/chat/ChatWidget';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Header />
      <MobileNav />
      <CartDrawer />
      <ChatWidget />

      <main className="min-h-screen flex-1 bg-background">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

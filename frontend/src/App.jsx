import React, { useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { CustomerAuthProvider } from './context/CustomerAuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import BottomNav from './components/BottomNav';
import HomePage from './pages/Home';
import CollectionPage from './pages/Collection';
import ProductDetailPage from './pages/ProductDetail';
import CartPage from './pages/Cart';
import CheckoutPage from './pages/Checkout';
import WishlistPage from './pages/Wishlist';
import AccountPage from './pages/Account';
import SearchPage from './pages/Search';
import SignUpPage from './pages/SignUp';
import LoginPage from './pages/Login';
import ForgotPasswordPage from './pages/ForgotPassword';
import ResetPasswordPage from './pages/ResetPassword';
import VerifyEmailPage from './pages/VerifyEmail';
import OrderStatusPage from './pages/OrderStatus';
import TrackOrderPage from './pages/TrackOrder';
import AdminPage from './pages/Admin';
import SuperAdminPage from './pages/SuperAdmin';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  const location = useLocation();
  const adminPath = import.meta.env.VITE_ADMIN_PANEL_PATH || 'penguin-ctrl-x7k2';
  const superAdminPath = import.meta.env.VITE_SUPERADMIN_PATH || 'penguin-super-ctrl';
  const isCheckout = location.pathname === '/checkout';
  const isAdmin =
    location.pathname.startsWith(`/${adminPath}`) ||
    location.pathname.startsWith(`/${superAdminPath}`) ||
    location.pathname === '/admin' ||
    location.pathname === '/superadmin';

  return (
    <CustomerAuthProvider>
      <CartProvider>
        <ScrollToTop />
        <div className="app-shell" style={{
          minHeight: '100vh',
          backgroundColor: 'var(--surface)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          width: '100%',
          overflowX: 'hidden',
        }}>
          {/* Full responsive luxury container */}
          <div className="app-inner-shell" style={{
            width: '100%',
            minHeight: '100vh',
            backgroundColor: 'var(--surface)',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
          }}>
            {/* Global Header (hidden on admin portal and checkout) */}
            {!isCheckout && !isAdmin && <Header />}

            {/* Main Route Content */}
            <main className="main-content">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/winter-drop" element={<Navigate to="/collection" replace />} />
                <Route path="/collection" element={<CollectionPage />} />
                <Route path="/new-arrivals" element={<CollectionPage />} />
                <Route path="/collection/:category" element={<CollectionPage />} />
                <Route path="/product/:id" element={<ProductDetailPage />} />
                <Route path="/products/:id" element={<ProductDetailPage />} />
                <Route path="/product/:slug" element={<ProductDetailPage />} />
                <Route path="/products/:slug" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/account" element={<AccountPage />} />
                <Route path="/search" element={<SearchPage />} />

                {/* Customer Authentication & Recovery Routes */}
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
                <Route path="/verify-email/:token" element={<VerifyEmailPage />} />

                {/* Order Tracking Routes */}
                <Route path="/track" element={<TrackOrderPage />} />
                <Route path="/track/:orderNumber" element={<TrackOrderPage />} />
                <Route path="/tracking" element={<TrackOrderPage />} />
                <Route path="/order-tracking" element={<TrackOrderPage />} />

                {/* Order Status & Payment Confirmation */}
                <Route path="/order/status" element={<OrderStatusPage />} />

                {/* Layer 1: Dedicated Store Admin Route (Merchandising & Orders) */}
                <Route path={`/${adminPath}`} element={<AdminPage />} />
                <Route path={`/${adminPath}/*`} element={<AdminPage />} />
                <Route path="/admin" element={<Navigate to={`/${adminPath}`} replace />} />

                {/* Dedicated Superadmin Route (Admin Provisioning & Security Governance) */}
                <Route path={`/${superAdminPath}`} element={<SuperAdminPage />} />
                <Route path={`/${superAdminPath}/*`} element={<SuperAdminPage />} />
                <Route path="/superadmin" element={<Navigate to={`/${superAdminPath}`} replace />} />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            {/* Global Minimal Luxury Footer */}
            {!isCheckout && !isAdmin && <Footer />}

            {/* Bottom Navigation (automatically hidden on desktop via CSS) */}
            {!isCheckout && !isAdmin && <BottomNav />}
          </div>
        </div>
      </CartProvider>
    </CustomerAuthProvider>
  );
}

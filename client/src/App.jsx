import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/Auth';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Checkout from './pages/Checkout';
import ResultadoPago from './pages/ResultadoPago';

const Layout = ({ children }) => (
  <>
    <Navbar />
    <main>{children}</main>
    <Footer />
    <CartDrawer />
  </>
);

const App = () => {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/" element={<Layout><Home /></Layout>} />
            <Route path="/catalogo" element={<Layout><Catalog /></Layout>} />
            <Route path="/producto/:id" element={<Layout><ProductDetail /></Layout>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route
              path="/checkout"
              element={
                <PrivateRoute>
                  <Layout><Checkout /></Layout>
                </PrivateRoute>
              }
            />
            <Route path="/resultado-pago" element={<Layout><ResultadoPago /></Layout>} />
            <Route
              path="/perfil"
              element={
                <PrivateRoute>
                  <Layout>
                    <div className="p-8 text-center text-sm tracking-wider">
                      Perfil — próximamente (T-083)
                    </div>
                  </Layout>
                </PrivateRoute>
              }
            />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
    </GoogleOAuthProvider>
  );
};

export default App;

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './routes/ProtectedRoute';
import store from './store';

// Layouts
import MainLayout from './components/layout/MainLayout';
import ErrorBoundary from './components/common/ErrorBoundary'

// Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import SearchResultsPage from './pages/SearchResultsPage';
import Cart from './pages/Cart';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmation from './pages/OrderConfirmation';
import NotFound from './pages/NotFound';
import ProfilePage from './pages/ProfilePage';
import OrdersPage from './pages/OrdersPage';
import CategoriesPage from './pages/CategoriesPage';
import Contact from './pages/Contact'

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ResetPassword from './components/auth/ResetPassword';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminInventory from './pages/admin/AdminInventory';

function App() {
  return (
    <Provider store={store}>
      <ErrorBoundary>
        <Router>
          <Toaster 
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                theme: {
                  primary: '#4aed88',
                },
              },
            }}
          />
          <Routes>
            {/* Main Layout Routes */}
            <Route path="/" element={<MainLayout />}>
              {/* Public Routes */}
              <Route index element={<Home />} />
              <Route path="shop" element={<Shop />} />
              <Route path="product/:id" element={<ProductDetail />} />
              <Route path="search" element={<SearchResultsPage />} />
              <Route path="categories" element={<CategoriesPage />} />
              <Route path="contact" element={<Contact />} />
              
              {/* Protected User Routes */}
              <Route path="cart" element={
                <ProtectedRoute>
                  <Cart />
                </ProtectedRoute>
              } />
              <Route path="checkout" element={
                <ProtectedRoute>
                  <CheckoutPage />
                </ProtectedRoute>
              } />
              <Route path="order-confirmation" element={
                <ProtectedRoute>
                  <OrderConfirmation />
                </ProtectedRoute>
              } />
              <Route path="profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />
              <Route path="orders" element={
                <ProtectedRoute>
                  <OrdersPage />
                </ProtectedRoute>
              } />

              {/* Admin Routes */}
              <Route path="admin" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="admin/products" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminProducts />
                </ProtectedRoute>
              } />
              <Route path="admin/orders" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminOrders />
                </ProtectedRoute>
              } />
              <Route path="admin/inventory" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminInventory />
                </ProtectedRoute>
              } />
            </Route>
            
            {/* Auth Routes - Outside MainLayout */}
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="reset-password" element={<ResetPassword />} />
            
            {/* 404 Page - Catch all unmatched routes */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </ErrorBoundary>
    </Provider>
  );
}

export default App;
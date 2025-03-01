import { Route, Routes, Navigate } from 'react-router-dom';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminProducts from '../pages/admin/AdminProducts';
import AdminOrders from '../pages/admin/AdminOrders';
import AdminInventory from '../pages/admin/AdminInventory';
import ProtectedRoute from './ProtectedRoute';
import MainLayout from '../components/layout/MainLayout';

const AdminRoutes = () => {
  return (
    <Route
      path="/admin"
      element={
        <ProtectedRoute allowedRoles={['admin']}>
          <MainLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<AdminDashboard />} />
      <Route path="products" element={<AdminProducts />} />
      <Route path="orders" element={<AdminOrders />} />
      <Route path="inventory" element={<AdminInventory />} />
      {/* Catch all route for admin paths */}
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Route>
  );
};

export default AdminRoutes;
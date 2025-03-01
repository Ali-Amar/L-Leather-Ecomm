import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser } from '../features/auth/authSlice';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const user = useSelector(selectUser);
  const location = useLocation();

  // Check if user is authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If allowedRoles is empty, allow any authenticated user
  if (allowedRoles.length === 0) {
    return children;
  }

  // Check if user has required role
  if (!allowedRoles.includes(user.role)) {
    // Redirect to home page if user doesn't have required role
    return <Navigate to="/" replace />;
  }

  // If all checks pass, render the protected content
  return children;
};

export default ProtectedRoute;
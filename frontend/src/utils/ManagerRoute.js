import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ManagerRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Only admin and manager can access
  if (user?.role !== 'admin' && user?.role !== 'manager') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ManagerRoute;

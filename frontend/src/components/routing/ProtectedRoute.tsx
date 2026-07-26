import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute() {
  // Placeholder for real auth check logic
  const isAuthenticated = true; // e.g., !!localStorage.getItem('auth_token');

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

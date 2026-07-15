import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  allowedRoles: string[];
  children: ReactNode;
}

export default function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) {
    return <Navigate to="/" replace />;
  }
  if (!allowedRoles.includes(role || '')) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
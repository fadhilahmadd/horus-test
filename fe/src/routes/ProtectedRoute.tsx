import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { auth } = useAuth();
  return auth ? children : <Navigate to="/sign-in" />;
};
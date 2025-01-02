import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Yükleniyor...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Eğer allowedRoles boşsa veya kullanıcının rolü izin verilenler arasındaysa
  if (allowedRoles.length === 0 || allowedRoles.includes(user.role)) {
    return children;
  }

  // Kullanıcının rolüne göre yönlendirme
  switch (user.role) {
    case 'doctor':
      return <Navigate to="/panel/doctor" />;
    case 'admin':
      return <Navigate to="/panel/admin" />;
    default:
      return <Navigate to="/" />;
  }
};

export default PrivateRoute; 
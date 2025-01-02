import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import { toast } from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('userInfo');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const updateUser = (userData) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem('userInfo', JSON.stringify(userData));
    } else {
      localStorage.removeItem('userInfo');
    }
  };

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        updateUser(null);
        setLoading(false);
        return;
      }

      // Token'ı kontrol et
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem('token');
          updateUser(null);
          setLoading(false);
          return;
        }
      } catch (error) {
        localStorage.removeItem('token');
        updateUser(null);
        setLoading(false);
        return;
      }

      // Server'dan güncel bilgileri al
      const response = await fetch('http://localhost:5000/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        updateUser(userData);
      } else {
        localStorage.removeItem('token');
        updateUser(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      localStorage.removeItem('token');
      updateUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    setUser(null);
    toast.success('Çıkış yapıldı');
    navigate('/login');
  };

  const login = async (credentials) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Giriş başarısız');
      }

      const data = await response.json();
      
      // Token'ı ve kullanıcı bilgilerini localStorage'a kaydet
      localStorage.setItem('token', data.token);
      localStorage.setItem('userInfo', JSON.stringify(data.user));
      
      // User state'ini güncelle
      setUser(data.user);
      
      toast.success('Giriş başarılı!');

      // Role göre yönlendirme
      switch (data.user.role) {
        case 'admin':
          navigate('/panel/admin');
          break;
        case 'doctor':
          navigate('/panel/doctor');
          break;
        default:
          navigate('/');
      }
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Kayıt başarılı! Giriş yapabilirsiniz.');
        navigate('/login');
      } else {
        toast.error(data.message || 'Kayıt başarısız!');
      }
    } catch (error) {
      toast.error('Bir hata oluştu!');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white border-b shadow py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold text-gray-800">
          MediCare Plus
        </Link>

        {/* Menü */}
        <div className="flex items-center space-x-4">

          {user && (
            <>
              <Link 
                to="/profile"
                className="text-gray-600 hover:text-primary-600"
              >
                Profilim
              </Link>

              {user.role === 'user' && (
                <Link 
                  to="/my-appointments"
                  className="text-gray-600 hover:text-primary-600"
                >
                  Randevularım
                </Link>
              )}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={logout}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
              >
                Çıkış Yap
              </motion.button>
            </>
          )}

          {!user && (
            <>
              <Link
                to="/login"
                className="text-gray-600 hover:text-primary-600"
              >
                Giriş Yap
              </Link>
              <Link
                to="/register"
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
              >
                Kayıt Ol
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 
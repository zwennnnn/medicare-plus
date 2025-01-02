import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const DoctorSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const menuItems = [
    {
      path: '/panel/doctor',
      icon: '📊',
      text: 'Dashboard',
      description: 'Genel Bakış'
    },
    {
      path: '/panel/doctor/patients',
      icon: '👥',
      text: 'Hastalarım',
      description: 'Hasta Listesi'
    },
    {
      path: '/panel/doctor/profile',
      icon: '👤',
      text: 'Profil',
      description: 'Profil Ayarları'
    }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="bg-white h-full shadow-lg flex flex-col min-h-screen">
      {/* Profil Bölümü */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-primary-600 text-xl font-bold">
              {user?.name?.charAt(0)}
            </span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{user?.name}</h2>
            <p className="text-sm text-gray-500">Doktor</p>
          </div>
        </div>
      </div>

      {/* Menü */}
      <nav className="flex-grow p-4 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
          >
            <motion.div
              whileHover={{ x: 5 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center p-3 rounded-lg transition-colors ${
                location.pathname === item.path
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="text-2xl mr-3">{item.icon}</span>
              <div>
                <div className="font-medium">{item.text}</div>
                <div className="text-xs text-gray-500">{item.description}</div>
              </div>
            </motion.div>
          </Link>
        ))}
      </nav>

      {/* Çıkış Butonu */}
      <div className="p-4 border-t border-gray-200">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="w-full flex items-center justify-center px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <span className="text-xl mr-2">🚪</span>
          <span className="font-medium">Çıkış Yap</span>
        </motion.button>
      </div>
    </div>
  );
};

export default DoctorSidebar; 
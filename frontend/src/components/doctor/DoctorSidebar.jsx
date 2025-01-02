import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const DoctorSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    {
      path: '/panel/doctor',
      icon: '📊',
      title: 'Dashboard'
    },
    {
      path: '/panel/doctor/appointments',
      icon: '📅',
      title: 'Randevularım'
    },
    {
      path: '/panel/doctor/patients',
      icon: '👥',
      title: 'Hastalarım'
    },
    {
      path: '/panel/doctor/profile',
      icon: '👤',
      title: 'Profil'
    }
  ];

  return (
    <motion.div 
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-72 min-h-screen bg-white/10 backdrop-blur-xl border-r border-white/10 p-6 flex flex-col relative z-50"
    >
      {/* Logo */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
          MediCare Plus
        </h1>
        <p className="text-sm text-gray-400 mt-1">Doktor Paneli</p>
      </div>

      {/* Navigation */}
      <nav className="space-y-2 flex-1">
        {menuItems.map((item) => {
          const isActive = 
            item.path === '/panel/doctor' 
              ? location.pathname === '/panel/doctor'
              : location.pathname.startsWith(item.path);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative cursor-pointer
                ${isActive 
                  ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-white border border-white/20' 
                  : 'text-gray-400 hover:bg-white/10'}`}
            >
              <span className={`text-xl transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                {item.icon}
              </span>
              
              <span className="font-medium">
                {item.title}
              </span>

              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute left-0 w-1 h-8 bg-gradient-to-b from-blue-400 to-cyan-400 rounded-full"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="mt-auto pt-4">
        <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-white/10 mb-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full overflow-hidden">
              {user?.photo ? (
                <img 
                  src={user.photo}
                  alt="Profile" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null; // Sonsuz döngüyü önle
                    e.target.src = ''; // Hata durumunda varsayılan avatar göster
                    e.target.parentElement.innerHTML = '<span class="text-white text-lg">👨‍⚕️</span>';
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                  <span className="text-white text-lg">👨‍⚕️</span>
                </div>
              )}
            </div>
            <div>
              <p className="text-white font-medium">Dr. {user?.name}</p>
              <p className="text-sm text-gray-400">{user?.email}</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors duration-300 flex items-center gap-3"
        >
          <span>🚪</span>
          <span>Çıkış Yap</span>
        </button>
      </div>
    </motion.div>
  );
};

export default DoctorSidebar; 
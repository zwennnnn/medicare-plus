import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/axios';

const UserProfile = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          return toast.error('Yeni şifreler eşleşmiyor');
        }
        if (!formData.currentPassword) {
          return toast.error('Mevcut şifrenizi girmelisiniz');
        }
      }

      const response = await api.put('/user/profile', formData);
      updateUser(response.data);
      toast.success('Bilgileriniz güncellendi');
      
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Güncelleme başarısız');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">Profil Ayarları</h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          {/* Sadece profil bilgileri ve şifre değiştirme formu */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profil Bilgileri */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Profil Bilgileri</h2>
              
              <div>
                <label className="block text-gray-700 mb-2">İsim</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            {/* Şifre Değiştirme */}
            <div className="space-y-4 pt-6 border-t">
              <h2 className="text-xl font-semibold">Şifre Değiştir</h2>
              
              <div>
                <label className="block text-gray-700 mb-2">Mevcut Şifre</label>
                <input
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Yeni Şifre</label>
                <input
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Yeni Şifre Tekrar</label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-6">
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                Değişiklikleri Kaydet
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default UserProfile; 
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/axios';

const DoctorProfile = () => {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [previewImage, setPreviewImage] = useState(user?.photo || null);

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      return toast.error('Dosya boyutu 5MB\'dan küçük olmalıdır');
    }

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const response = await api.post('/doctor/profile/photo', {
            photo: reader.result
          });

          setPreviewImage(response.data.user.photo);
          updateUser(response.data.user);
          localStorage.setItem('userInfo', JSON.stringify(response.data.user));
          
          toast.success('Profil fotoğrafı güncellendi');
        } catch (error) {
          toast.error('Fotoğraf yüklenirken bir hata oluştu');
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error('Fotoğraf yüklenirken bir hata oluştu');
    }
  };

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

      const response = await api.put('/doctor/profile', formData);
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

  useEffect(() => {
    const savedUserInfo = localStorage.getItem('userInfo');
    if (savedUserInfo) {
      const parsedUser = JSON.parse(savedUserInfo);
      if (parsedUser.photo) {
        setPreviewImage(parsedUser.photo);
      }
    }
  }, []);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
        Profil
      </h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/10"
      >
        {/* Profil Fotoğrafı Bölümü */}
        <div className="flex justify-center mb-8">
          <div className="relative group">
            <div 
              onClick={handleImageClick} 
              className="w-32 h-32 rounded-full overflow-hidden cursor-pointer group-hover:opacity-75 transition-opacity"
            >
              {previewImage ? (
                <img 
                  src={previewImage} 
                  alt="Profil" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                  <span className="text-4xl">👨‍⚕️</span>
                </div>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profil Bilgileri */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Profil Bilgileri</h2>
            
            <div>
              <label className="block text-gray-400 mb-2">İsim</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                required
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                required
              />
            </div>

            {/* Hakkımda Bölümü */}
            <div>
              <label className="block text-gray-400 mb-2">Hakkımda</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white h-32 resize-none"
                placeholder="Kendinizi tanıtan kısa bir metin yazın..."
              />
            </div>
          </div>

          {/* Şifre Değiştirme */}
          <div className="space-y-4 pt-6 border-t border-white/10">
            <h2 className="text-xl font-semibold text-white">Şifre Değiştir</h2>
            
            <div>
              <label className="block text-gray-400 mb-2">Mevcut Şifre</label>
              <input
                type="password"
                value={formData.currentPassword}
                onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-2">Yeni Şifre</label>
              <input
                type="password"
                value={formData.newPassword}
                onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-2">Yeni Şifre Tekrar</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
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
  );
};

export default DoctorProfile; 
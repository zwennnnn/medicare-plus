import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import api from '../../utils/axios';
import { DEPARTMENTS } from '../../constants/departments';

const DoctorList = () => {
  const [doctors, setDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: ''
  });

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await api.get('/admin/doctors');
      setDoctors(response.data);
    } catch (error) {
      toast.error('Doktorlar yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedDoctor) {
        // Güncelleme işlemi
        await api.put(`/admin/doctors/${selectedDoctor._id}`, formData);
        toast.success('Doktor başarıyla güncellendi');
      } else {
        // Yeni doktor ekleme
        await api.post('/admin/doctors', formData);
        toast.success('Doktor başarıyla eklendi');
      }
      setIsModalOpen(false);
      setSelectedDoctor(null);
      setFormData({ name: '', email: '', password: '', department: '' });
      fetchDoctors();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Bir hata oluştu');
    }
  };

  const handleDeleteDoctor = async (id) => {
    if (window.confirm('Doktoru silmek istediğinize emin misiniz?')) {
      try {
        await api.delete(`/admin/doctors/${id}`);
        toast.success('Doktor başarıyla silindi');
        fetchDoctors();
      } catch (error) {
        toast.error('Doktor silinirken bir hata oluştu');
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          Doktor Yönetimi
        </h1>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setSelectedDoctor(null);
            setFormData({ name: '', email: '', password: '', department: '' });
            setIsModalOpen(true);
          }}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl text-white font-medium hover:opacity-90 transition-opacity"
        >
          + Yeni Doktor Ekle
        </motion.button>
      </div>

      {/* Doctor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {doctors.map((doctor) => (
          <motion.div
            key={doctor._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 hover:border-white/20 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-1">
                    {doctor.name}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {doctor.department}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedDoctor(doctor);
                      setFormData({
                        name: doctor.name,
                        email: doctor.email,
                        department: doctor.department,
                        password: ''
                      });
                      setIsModalOpen(true);
                    }}
                    className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDeleteDoctor(doctor._id)}
                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-400">
                  <span>📧</span>
                  <span>{doctor.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <span>🏥</span>
                  <span>{doctor.department}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 p-6 rounded-xl w-full max-w-md border border-white/10"
          >
            <h2 className="text-2xl font-bold text-white mb-4">
              {selectedDoctor ? 'Doktor Düzenle' : 'Yeni Doktor Ekle'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
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
              <div>
                <label className="block text-gray-400 mb-2">Şifre {selectedDoctor && '(Boş bırakılırsa değişmez)'}</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                  {...(!selectedDoctor && { required: true })}
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-2">Departman</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white appearance-none cursor-pointer"
                  required
                >
                  <option value="" className="bg-gray-800 text-white">Seçiniz</option>
                  {DEPARTMENTS.map(dept => (
                    <option 
                      key={dept.value} 
                      value={dept.value}
                      className="bg-gray-800 text-white"
                    >
                      {dept.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-4 justify-end mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-400 hover:bg-white/5 rounded-lg transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  {selectedDoctor ? 'Güncelle' : 'Ekle'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && doctors.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">
            Henüz hiç doktor eklenmemiş
          </p>
        </div>
      )}
    </div>
  );
};

export default DoctorList; 
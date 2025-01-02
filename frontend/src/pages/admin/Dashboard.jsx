import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalDoctors: 0,
    totalUsers: 0,
    totalAppointments: 0,
    recentAppointments: [],
    departmentStats: []
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        toast.error('İstatistikler yüklenemedi');
      }
    } catch (error) {
      console.error('Stats Error:', error);
      toast.error('İstatistikler yüklenemedi');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          Dashboard
        </h1>
      </div>
      
      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: "👨‍⚕️", title: "Toplam Doktor", value: stats.totalDoctors, color: "from-blue-500 to-cyan-400" },
          { icon: "👥", title: "Toplam Kullanıcı", value: stats.totalUsers, color: "from-purple-500 to-pink-400" },
          { icon: "📅", title: "Toplam Randevu", value: stats.totalAppointments, color: "from-orange-500 to-yellow-400" }
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl blur-xl"
                 style={{ backgroundImage: `linear-gradient(to right, ${stat.color})` }} />
            <div className="relative bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-4xl mb-2">{stat.icon}</div>
                  <div className="text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-gray-400">{stat.title}</div>
                </div>
                <div className="w-16 h-16 bg-gradient-to-r rounded-lg opacity-20"
                     style={{ backgroundImage: `linear-gradient(to right, ${stat.color})` }} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Departman İstatistikleri */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/10"
      >
        <h2 className="text-xl font-semibold text-white mb-6">Departman İstatistikleri</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.departmentStats?.map((dept, index) => (
            <motion.div
              key={dept._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all group"
            >
              <div className="text-2xl font-bold text-white group-hover:text-primary-400 transition-colors">
                {dept.count}
              </div>
              <div className="text-sm text-gray-400">{dept._id}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Son Randevular */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/10"
      >
        <h2 className="text-xl font-semibold text-white mb-6">Son Randevular</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-800">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Hasta
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Doktor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Tarih
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Durum
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {stats.recentAppointments?.map((appointment, index) => (
                <motion.tr
                  key={appointment._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="hover:bg-white/5 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                    {appointment.userId?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                    {appointment.doctorId?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                    {new Date(appointment.date).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 text-xs rounded-full ${
                      appointment.status === 'completed' 
                        ? 'bg-green-500/20 text-green-400'
                        : appointment.status === 'cancelled'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {appointment.status === 'completed' ? 'Tamamlandı'
                        : appointment.status === 'cancelled' ? 'İptal'
                        : 'Bekliyor'}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard; 
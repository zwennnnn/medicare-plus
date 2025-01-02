import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import api from '../../utils/axios';

const DoctorDashboard = () => {
  const [stats, setStats] = useState({
    todayAppointments: 0,
    totalPatients: 0,
    completedAppointments: 0,
    pendingAppointments: 0,
    recentAppointments: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [statsResponse, appointmentsResponse] = await Promise.all([
        api.get('/doctor/stats'),
        api.get('/doctor/appointments')
      ]);
      
      // Bekleyen randevuları filtrele
      const pendingAppointments = appointmentsResponse.data.filter(
        app => app.status === 'pending'
      );

      setStats({
        ...statsResponse.data,
        pendingAppointments: pendingAppointments.length,
        recentAppointments: appointmentsResponse.data.slice(0, 5)
      });
    } catch (error) {
      toast.error('İstatistikler yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400';
      case 'cancelled': return 'bg-red-500/20 text-red-400';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Tamamlandı';
      case 'cancelled': return 'İptal';
      case 'pending': return 'Bekliyor';
      default: return status;
    }
  };

  const handleConfirmAppointment = async (appointmentId) => {
    try {
      await api.put(`/appointments/${appointmentId}/confirm`);
      
      // Stats ve randevuları güncelle
      fetchStats();
      toast.success('Randevu onaylandı');
    } catch (error) {
      toast.error('Randevu onaylanırken bir hata oluştu');
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
        Doktor Dashboard
      </h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Bugünkü Randevular", value: stats.todayAppointments, icon: "📅", color: "from-blue-500 to-cyan-400" },
          { title: "Toplam Hasta", value: stats.totalPatients, icon: "👥", color: "from-purple-500 to-pink-400" },
          { title: "Tamamlanan", value: stats.completedAppointments, icon: "✅", color: "from-green-500 to-emerald-400" },
          { title: "Bekleyen", value: stats.pendingAppointments, icon: "⏳", color: "from-yellow-500 to-orange-400" }
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-gray-400">{stat.title}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Appointments Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-6"
      >
        <h2 className="text-xl font-semibold text-white mb-4">Son Randevular</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-white/10">
                <th className="pb-3 text-gray-400">Hasta</th>
                <th className="pb-3 text-gray-400">Tarih</th>
                <th className="pb-3 text-gray-400">Saat</th>
                <th className="pb-3 text-gray-400">Durum</th>
                <th className="pb-3 text-gray-400">İşlem</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {stats.recentAppointments.map((appointment) => (
                <tr key={appointment._id} className="border-b border-white/5">
                  <td className="py-3">{appointment.userId?.name}</td>
                  <td className="py-3">
                    {new Date(appointment.date).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="py-3">{appointment.time}</td>
                  <td className="py-3">
                    <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(appointment.status)}`}>
                      {getStatusText(appointment.status)}
                    </span>
                  </td>
                  <td className="py-3">
                    {appointment.status === 'pending' && (
                      <button
                        onClick={() => handleConfirmAppointment(appointment._id)}
                        className="px-4 py-1 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                      >
                        Onayla
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard; 
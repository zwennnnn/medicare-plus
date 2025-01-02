import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../utils/axios';

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAppointments();
  }, [filter]);

  const fetchAppointments = async () => {
    try {
      const response = await api.get(`/doctor/appointments?status=${filter}`);
      setAppointments(response.data);
    } catch (error) {
      toast.error('Randevular yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmAppointment = async (appointmentId) => {
    try {
      await api.put(`/appointments/${appointmentId}/confirm`);
      fetchAppointments(); // Randevuları yenile
      toast.success('Randevu tamamlandı olarak işaretlendi');
    } catch (error) {
      toast.error('Randevu güncellenirken bir hata oluştu');
    }
  };

  // Status renk ve metin yardımcı fonksiyonları
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400';
      case 'confirmed':
        return 'bg-blue-500/20 text-blue-400';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Tamamlandı';
      case 'cancelled':
        return 'İptal Edildi';
      case 'confirmed':
        return 'Onaylandı';
      case 'pending':
        return 'Bekliyor';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          Randevularım
        </h1>

        {/* Filter */}
        <div className="flex gap-2">
          {['all', 'pending', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === status 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-800">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Hasta
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Tarih
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Saat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Şikayet
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  İşlem
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {appointments.map((appointment) => (
                <tr key={appointment._id} className="hover:bg-white/5">
                  <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                    {appointment.userId?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                    {new Date(appointment.date).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                    {appointment.time}
                  </td>
                  <td className="px-6 py-4 text-gray-300">
                    {appointment.complaint || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(appointment.status)}`}>
                      {getStatusText(appointment.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {appointment.status === 'pending' && (
                      <button
                        onClick={() => handleConfirmAppointment(appointment._id)}
                        className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
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
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && appointments.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">Randevu bulunmuyor</p>
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments; 
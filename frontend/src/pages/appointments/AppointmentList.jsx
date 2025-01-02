import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

const AppointmentList = () => {
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, [filter]);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/appointments/my-appointments?status=${filter}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      } else {
        toast.error('Randevular yüklenemedi');
      }
    } catch (error) {
      console.error('Randevu listesi hatası:', error);
      toast.error('Randevular yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/appointments/${id}/cancel`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Randevu başarıyla iptal edildi');
        fetchAppointments();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Randevu iptal edilemedi');
      }
    } catch (error) {
      console.error('İptal hatası:', error);
      toast.error('Randevu iptal edilirken bir hata oluştu');
    }
  };

  const filterButtons = [
    { value: 'all', label: 'Tümü' },
    { value: 'upcoming', label: 'Yaklaşan' },
    { value: 'completed', label: 'Tamamlanan' },
    { value: 'cancelled', label: 'İptal Edilen' }
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Randevularım</h2>

      <div className="flex gap-4 mb-6">
        {filterButtons.map(button => (
          <button
            key={button.value}
            onClick={() => setFilter(button.value)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === button.value 
                ? 'bg-primary-500 text-white' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {button.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center text-gray-500 mt-8">
          {filter === 'all' 
            ? 'Henüz randevunuz bulunmuyor' 
            : `${filterButtons.find(b => b.value === filter).label} randevunuz bulunmuyor`}
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <motion.div
              key={appointment._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-lg shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">
                      Dr. {appointment.doctorId?.name || 'Bilinmiyor'}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      appointment.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                      appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {appointment.status === 'upcoming' ? 'Yaklaşan' :
                       appointment.status === 'completed' ? 'Tamamlandı' :
                       'İptal Edildi'}
                    </span>
                  </div>
                  <p className="text-gray-600">{appointment.department}</p>
                  <p className="text-gray-500 mt-2">
                    {appointment.date} - {appointment.time}
                  </p>
                  {appointment.complaint && (
                    <p className="text-gray-600 mt-2">
                      <span className="font-medium">Şikayet:</span> {appointment.complaint}
                    </p>
                  )}
                </div>
                {appointment.status === 'upcoming' && (
                  <button
                    onClick={() => handleCancel(appointment._id)}
                    className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                  >
                    İptal Et
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AppointmentList; 
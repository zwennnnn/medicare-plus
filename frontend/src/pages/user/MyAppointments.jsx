import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { FaStar } from 'react-icons/fa';
import api from '../../utils/axios';

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: ''
  });

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await api.get('/appointments/my-appointments');
      setAppointments(response.data);
    } catch (error) {
      toast.error('Randevular yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelAppointment = async (id) => {
    if (!window.confirm('Randevuyu iptal etmek istediğinize emin misiniz?')) return;

    try {
      await api.put(`/appointments/${id}/cancel`);
      toast.success('Randevu başarıyla iptal edildi');
      fetchAppointments();
    } catch (error) {
      toast.error('Randevu iptal edilirken bir hata oluştu');
    }
  };

  const handleAddReview = async () => {
    try {
      if (!reviewData.comment.trim()) {
        return toast.error('Lütfen bir yorum yazın');
      }

      const response = await api.post(`/users/doctors/${selectedAppointment.doctorId._id}/reviews`, {
        rating: Number(reviewData.rating),
        comment: reviewData.comment.trim(),
        appointmentId: selectedAppointment._id
      });

      if (response.data.success) {
        setAppointments(appointments.map(app => 
          app._id === selectedAppointment._id 
            ? { ...app, hasReview: true, review: response.data.review }
            : app
        ));
        
        toast.success('Yorum başarıyla eklendi');
        setIsModalOpen(false);
        setReviewData({ rating: 5, comment: '' });
        setSelectedAppointment(null);
        fetchAppointments();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Yorum eklenirken bir hata oluştu');
    }
  };

  const handleEditReview = async () => {
    try {
      if (!reviewData.comment.trim()) {
        return toast.error('Lütfen bir yorum yazın');
      }

      const response = await api.put(`/users/doctors/reviews/${selectedAppointment.review._id}`, {
        rating: Number(reviewData.rating),
        comment: reviewData.comment.trim()
      });

      if (response.data.success) {
        setAppointments(appointments.map(app => 
          app._id === selectedAppointment._id 
            ? { ...app, review: response.data.review }
            : app
        ));
        
        toast.success('Yorum başarıyla güncellendi');
        setIsModalOpen(false);
        setReviewData({ rating: 5, comment: '' });
        setSelectedAppointment(null);
        fetchAppointments();
      }
    } catch (error) {
      toast.error('Yorum güncellenirken bir hata oluştu');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Yorumu silmek istediğinize emin misiniz?')) return;

    try {
      const response = await api.delete(`/users/doctors/reviews/${reviewId}`);

      if (response.data.success) {
        setAppointments(appointments.map(app => {
          if (app.review?._id === reviewId) {
            return { ...app, hasReview: false, review: null };
          }
          return app;
        }));
        
        toast.success('Yorum başarıyla silindi');
      }
    } catch (error) {
      console.error('Yorum silme hatası:', error);
      toast.error(error.response?.data?.message || 'Yorum silinirken bir hata oluştu');
    }
  };

  const openReviewModal = (appointment, isEdit = false) => {
    setSelectedAppointment(appointment);
    if (isEdit && appointment.review) {
      setReviewData({
        rating: appointment.review.rating,
        comment: appointment.review.comment
      });
    } else {
      setReviewData({ rating: 5, comment: '' });
    }
    setIsEditing(isEdit);
    setIsModalOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Randevularım</h1>

        {isLoading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div
                key={appointment._id}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold">
                      Dr. {appointment.doctorId?.name}
                    </h3>
                    <p className="text-gray-600">{appointment.doctorId?.department}</p>
                    <p className="text-gray-500 mt-2">
                      {new Date(appointment.date).toLocaleDateString('tr-TR')} - {appointment.time}
                    </p>
                    <p className="text-gray-500">Şikayet: {appointment.complaint}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                      appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {appointment.status === 'completed' ? 'Tamamlandı' :
                       appointment.status === 'cancelled' ? 'İptal Edildi' :
                       'Bekliyor'}
                    </span>
                  </div>
                </div>

                {/* Yorum Bölümü */}
                {appointment.status === 'completed' && (
                  <div className="mt-4 pt-4 border-t">
                    {appointment.review ? (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <FaStar
                                key={i}
                                className="w-5 h-5"
                                color={i < appointment.review.rating ? "#ffc107" : "#e4e5e9"}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-600">
                            {new Date(appointment.review.createdAt).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                        <p className="text-gray-700">{appointment.review.comment}</p>
                        <div className="flex gap-4 mt-2">
                          <button
                            onClick={() => openReviewModal(appointment, true)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Yorumu Düzenle
                          </button>
                          <button
                            onClick={() => handleDeleteReview(appointment.review._id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Yorumu Sil
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => openReviewModal(appointment)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Yorum Yap
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Yorum Modalı */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg p-6 max-w-lg w-full"
            >
              <h2 className="text-xl font-semibold mb-4">
                {isEditing ? 'Yorumu Düzenle' : 'Yorum Yap'}
              </h2>

              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, index) => {
                  const ratingValue = index + 1;
                  return (
                    <FaStar
                      key={index}
                      className="cursor-pointer w-8 h-8"
                      color={ratingValue <= reviewData.rating ? "#ffc107" : "#e4e5e9"}
                      onClick={() => setReviewData({ ...reviewData, rating: ratingValue })}
                    />
                  );
                })}
              </div>

              <textarea
                value={reviewData.comment}
                onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32 resize-none"
                placeholder="Randevu hakkında yorumunuzu yazın..."
              />

              <div className="flex justify-end gap-4 mt-4">
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setReviewData({ rating: 5, comment: '' });
                  }}
                  className="px-4 py-2 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={isEditing ? handleEditReview : handleAddReview}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  {isEditing ? 'Güncelle' : 'Gönder'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAppointments; 
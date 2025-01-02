import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/axios';

const DoctorPanel = () => {
  const { user } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDoctorData();
  }, []);

  const fetchDoctorData = async () => {
    try {
      const doctorResponse = await api.get(`/users/${user.userId}`);
      setDoctor(doctorResponse.data);

      if (doctorResponse.data && !doctorResponse.data.photo) {
        const photoResponse = await api.get(`/doctor/photo/${user.userId}`);
        if (photoResponse.data.photo) {
          setDoctor(prev => ({ ...prev, photo: photoResponse.data.photo }));
        }
      }
    } catch (error) {
      console.error('Doktor bilgileri alınırken hata:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('photo', file);

    try {
      const response = await api.post('/doctor/photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        setDoctor(prev => ({ ...prev, photo: response.data.photo }));
        toast.success('Fotoğraf başarıyla yüklendi');
      }
    } catch (error) {
      toast.error('Fotoğraf yüklenirken bir hata oluştu');
    }
  };

  if (isLoading) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <div>
      {/* Doktor paneli içeriği */}
      {doctor?.photo && (
        <img 
          src={doctor.photo} 
          alt="Doktor fotoğrafı"
          className="w-32 h-32 rounded-full object-cover"
        />
      )}
    </div>
  );
};

export default DoctorPanel; 
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DoctorSidebar from '../../components/doctor/DoctorSidebar';
import DoctorDashboard from './DoctorDashboard';
import DoctorAppointments from './DoctorAppointments';
import DoctorPatients from './DoctorPatients';
import DoctorProfile from './DoctorProfile';

const DoctorLayout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Kullanıcı doktor değilse veya giriş yapmamışsa yönlendir
    if (!user || user.role !== 'doctor') {
      navigate('/login');
      return;
    }

    // Sayfa yüklendiğinde bir kerelik yenileme yap
    const hasReloaded = sessionStorage.getItem('doctorLayoutLoaded');
    if (!hasReloaded) {
      sessionStorage.setItem('doctorLayoutLoaded', 'true');
      window.location.reload();
    }
  }, [user, navigate]);

  if (!user || user.role !== 'doctor') {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-primary-900 to-gray-900">
      <DoctorSidebar />
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <Routes>
            <Route index element={<DoctorDashboard />} />
            <Route path="appointments" element={<DoctorAppointments />} />
            <Route path="patients" element={<DoctorPatients />} />
            <Route path="profile" element={<DoctorProfile />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default DoctorLayout; 
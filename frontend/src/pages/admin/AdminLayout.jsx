import { Routes, Route } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar';
import Dashboard from './Dashboard';
import DoctorList from './DoctorList';
import AppointmentList from './AppointmentList';

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-primary-900 to-gray-900">
      <AdminSidebar />
      <main className="flex-1 p-8 relative">
        {/* Decorative Elements */}
        <div className="fixed inset-0 bg-[url('/pattern.png')] opacity-[0.02] pointer-events-none" />
        <div className="fixed top-0 -left-40 w-[600px] h-[600px] bg-blue-500/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
        <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-purple-500/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
        
        {/* Content Container */}
        <div className="relative z-10">
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="doctors" element={<DoctorList />} />
            <Route path="appointments" element={<AppointmentList />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout; 
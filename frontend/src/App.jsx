import { BrowserRouter as Router, Routes, Route, useLocation, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import DoctorLayout from './pages/doctor/DoctorLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Home from './pages/Home';
import About from './pages/About';
import AdminLayout from './pages/admin/AdminLayout';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';
import MyAppointments from './pages/user/MyAppointments';
import Navbar from './components/Navbar';
import UserProfile from './pages/user/UserProfile';

const NavbarWrapper = () => {
  const location = useLocation();
  const isAdminOrDoctorPanel = location.pathname.includes('/panel/');

  return (
    <>
      {!isAdminOrDoctorPanel && <Navbar />}
      <Outlet />
    </>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route element={<NavbarWrapper />}>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected user routes */}
            <Route path="/my-appointments" element={
              <ProtectedRoute allowedRoles={['user']}>
                <MyAppointments />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute allowedRoles={['user']}>
                <UserProfile />
              </ProtectedRoute>
            } />
          </Route>

          {/* Protected admin routes - No Navbar */}
          <Route path="/panel/admin/*" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          } />

          {/* Protected doctor routes - No Navbar */}
          <Route path="/panel/doctor/*" element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DoctorLayout />
            </ProtectedRoute>
          } />

          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster position="top-right" />
      </AuthProvider>
    </Router>
  );
}

export default App;

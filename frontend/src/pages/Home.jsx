import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import CountUp from 'react-countup';
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import PanelCard from '../components/PanelCard';
import { DEPARTMENTS } from '../constants/departments';
import ChatBot from '../components/ChatBot';
import { generateTimeSlots } from '../utils/timeUtils';
import api from '../utils/axios';
import { AiFillStar } from 'react-icons/ai';


const Home = () => {

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableHours] = useState(generateTimeSlots());
  const [formData, setFormData] = useState({ complaint: '' });
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [userAppointments, setUserAppointments] = useState([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({
    totalDoctors: 0,
    totalPatients: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const appointmentSectionRef = useRef(null);

  useEffect(() => {
    if (selectedDepartment) {
      fetchDoctorsByDepartment();
    } else {
      setAvailableDoctors([]);
    }
  }, [selectedDepartment]);

  const fetchDoctorsByDepartment = async () => {
    setIsLoadingDoctors(true);
    try {
      const encodedDepartment = encodeURIComponent(selectedDepartment);
      const response = await fetch(`http://localhost:5000/api/users/doctors/by-department?department=${encodedDepartment}`);

      if (response.ok) {
        const data = await response.json();
        setAvailableDoctors(data);
      } else {
        toast.error('Doktorlar yüklenemedi');
      }
    } catch (error) {
      console.error('Doktorlar yüklenirken hata:', error);
      toast.error('Doktorlar yüklenemedi');
    } finally {
      setIsLoadingDoctors(false);
    }
  };



  const validateForm = () => {
    const errors = {};

    if (!user) {
      toast.error('Randevu oluşturmak için giriş yapmalısınız');
      navigate('/login');
      return false;
    }

    if (!selectedDepartment) {
      errors.department = 'Lütfen bir bölüm seçin';
    }

    if (!selectedDoctor) {
      errors.doctor = 'Lütfen bir doktor seçin';
    }

    if (!selectedDate) {
      errors.date = 'Lütfen bir tarih seçin';
    }

    if (!selectedTime) {
      errors.time = 'Lütfen bir saat seçin';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAppointment = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const response = await api.post('/appointments', {
        doctorId: selectedDoctor,
        date: selectedDate,
        time: selectedTime,
        complaint: formData.complaint
      });

      if (response.data) {
        toast.success('Randevunuz başarıyla oluşturuldu');
        setSelectedDepartment('');
        setSelectedDoctor('');
        setSelectedDate('');
        setSelectedTime('');
        setFormData({ complaint: '' });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Randevu oluşturulurken bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToAppointment = () => {
    appointmentSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (user) {
      fetchUserAppointments();
    }
  }, [user]);

  const fetchUserAppointments = async () => {
    setIsLoadingAppointments(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/appointments/my-appointments', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUserAppointments(data);
      } else {
        toast.error('Randevular yüklenemedi');
      }
    } catch (error) {
      console.error('Randevular yüklenirken hata:', error);
      toast.error('Randevular yüklenemedi');
    } finally {
      setIsLoadingAppointments(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
    fetchLatestReviews();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users/doctors/featured');
      if (response.ok) {
        const data = await response.json();
        setDoctors(data.doctors);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Doktorlar yüklenirken hata:', error);
    }
  };

  const fetchLatestReviews = async () => {
    try {
      console.log('Yorumlar yükleniyor...');
      const response = await api.get('/users/reviews/latest');
      console.log('Gelen yorumlar:', response.data);
      setReviews(response.data);
    } catch (error) {
      console.error('Yorumlar yüklenirken hata:', error.response || error);
      setReviews([]);
    } finally {
      setIsLoading(false);
    }
  };

  const CustomSelect = ({ 
    label, 
    value, 
    onChange, 
    options, 
    disabled, 
    placeholder, 
    icon,
    error 
  }) => (
    <div className="group">
      <label className="block text-sm font-medium mb-2 transition-colors duration-200
                     group-hover:text-primary-600 text-gray-700">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`
            appearance-none w-full px-4 py-3.5 pl-5 rounded-xl
            transition-all duration-200 ease-in-out
            bg-white/70 backdrop-blur-sm border-2
            ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''}
            ${error ? 'border-red-300 focus:border-red-500' : 'border-gray-200 hover:border-primary-400 focus:border-primary-500'}
            focus:ring-4 ${error ? 'focus:ring-red-500/20' : 'focus:ring-primary-500/20'}
            text-gray-700 placeholder-gray-400
          `}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              className="py-2"
            >
              {option.label}
            </option>
          ))}
        </select>

        {/* Icon */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
          <motion.div
            animate={{ rotate: value ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className={`transition-colors duration-200 
                     ${error ? 'text-red-400' : 'text-gray-400 group-hover:text-primary-500'}`}
          >
            {icon || (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </motion.div>
        </div>

        {/* Hover Effect */}
        <div className={`absolute inset-0 rounded-xl transition-opacity pointer-events-none
                      ${error ? 'bg-red-50' : 'bg-primary-50'} opacity-0 group-hover:opacity-10`} />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );

  const TimeSlot = ({ time, selected, onClick, disabled }) => (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      onClick={() => !disabled && onClick(time)}
      className={`
        px-4 py-2 rounded-lg text-sm font-medium
        transition-all duration-200 relative overflow-hidden
        ${disabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :
          selected ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30' :
          'bg-white text-gray-700 hover:bg-primary-50 hover:text-primary-600 border border-gray-200'}
      `}
    >
      {time}
      {selected && (
        <motion.div
          layoutId="selected-time"
          className="absolute inset-0 bg-primary-500 -z-10"
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.button>
  );

  useEffect(() => {
    setSelectedDoctor('');
    setSelectedTime('');
    setFormErrors({});
  }, [selectedDepartment]);

  useEffect(() => {
    setSelectedTime('');
    setFormErrors({});
  }, [selectedDoctor]);

  const getStepStatus = (step) => {
    switch(step) {
      case 0: return !!selectedDepartment;
      case 1: return !!selectedDoctor;
      case 2: return !!selectedDate;
      case 3: return !!selectedTime;
      default: return false;
    }
  };

  const getProgressWidth = () => {
    if (selectedTime) return 100;
    if (selectedDate) return 75;
    if (selectedDoctor) return 50;
    if (selectedDepartment) return 25;
    return 0;
  };

  if (isLoading) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative min-h-screen bg-gradient-to-br from-[#1a365d] via-[#1e4b8f] to-[#1a365d] overflow-hidden"
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-[0.02] z-0" />
          
          {/* Soft Medical Gradient Orbs */}
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-blue-400/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyan-400/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
          <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-sky-400/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000" />
        </div>

        {/* Main Content */}
        <div className="relative z-10 h-screen flex items-center">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="text-white space-y-8"
              >
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="inline-block"
                >
                  <span className="px-6 py-2 bg-white/5 rounded-full border border-white/10 backdrop-blur-sm text-sm font-medium
                               shadow-lg group hover:bg-white/10 transition-all duration-300">
                    <span className="inline-block mr-2">🏥</span>
                    Modern Sağlık Hizmetleri
                  </span>
                </motion.div>

                <h1 className="text-6xl lg:text-7xl font-bold leading-tight">
                  <span className="block text-white">
                    Sağlığınız İçin
                  </span>
                  <motion.span
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-200"
                  >
                    Yanınızdayız
                  </motion.span>
                </h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 }}
                  className="text-xl text-gray-300 max-w-xl leading-relaxed"
                >
                  Uzman kadromuz ve modern teknolojimizle sağlığınız için en iyi hizmeti sunuyoruz.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.3 }}
                  className="flex flex-wrap gap-4"
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={scrollToAppointment}
                    className="group relative px-8 py-4 rounded-xl font-semibold overflow-hidden bg-blue-600 hover:bg-blue-700 transition-all duration-300"
                  >
                    <span className="relative z-10 text-white flex items-center gap-2">
                      Randevu Al
                      <motion.span
                        animate={{ x: [0, 5, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="group-hover:translate-x-1"
                      >
                        →
                      </motion.span>
                    </span>
                  </motion.button>
                </motion.div>

                {/* Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.5 }}
                  className="grid grid-cols-3 gap-8 pt-8"
                >
                  {[
                    { value: stats.totalDoctors, label: 'Uzman Doktor' },
                    { value: stats.totalPatients, label: 'Mutlu Hasta' },
                    { value: '15+', label: 'Yıllık Deneyim' }
                  ].map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.5 + index * 0.2 }}
                      className="relative"
                    >
                      <div className="relative bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300">
                        <motion.div
                          className="text-4xl font-bold text-white"
                        >
                          <CountUp end={parseInt(stat.value)} duration={2} />
                          {isNaN(stat.value) ? stat.value.replace(/[0-9]/g, '') : '+'}
                        </motion.div>
                        <p className="text-gray-400 mt-2">{stat.label}</p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>

              {/* Right Content - Image */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="hidden lg:block relative"
              >
                <div className="relative w-full h-[600px] rounded-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent animate-pulse-slow" />
                  
                  <motion.div
                    animate={{ 
                      scale: [1, 1.02, 1],
                      rotate: [0, 1, 0]
                    }}
                    transition={{ 
                      duration: 5,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                    className="relative w-full h-full rounded-2xl overflow-hidden group"
                  >
                    <img
                      src="/images/clinic-hero.jpg"
                      alt="Modern Healthcare"
                      className="w-full h-full object-cover rounded-2xl transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?ixlib=rb-4.0.3&auto=format&fit=crop&w=2800&q=80';
                      }}
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Animated Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center p-2"
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 bg-white rounded-full"
            />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Panel Seçenekleri */}
      {user && (
        <div className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">Yönetim Panelleri</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {user.role === 'admin' && (
                <PanelCard
                  title="Admin Panel"
                  description="Doktor, randevu ve kullanıcı yönetimi için admin paneline erişin."
                  icon="⚡"
                  path="/panel/admin"
                  color="hover:border-primary-500 border-2 border-transparent"
                />
              )}
              {user.role === 'doctor' && (
                <PanelCard
                  title="Doktor Panel"
                  description="Randevularınızı ve hasta bilgilerinizi yönetin."
                  icon="👨‍⚕️"
                  path="/panel/doctor"
                  color="hover:border-blue-500 border-2 border-transparent"
                />
              )}
              <PanelCard
                title="Randevularım"
                description="Randevularınızı görüntüleyin ve yönetin."
                icon="📅"
                path="/my-appointments"
                color="hover:border-green-500 border-2 border-transparent"
              />
              <PanelCard
                title="Profil Yönetimi"
                description="Kişisel bilgilerinizi güncelleyin ve yönetin."
                icon="👤"
                path="/profile"
                color="hover:border-purple-500 border-2 border-transparent"
              />
            </div>
          </div>
        </div>
      )}

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 via-secondary-500 to-primary-600 relative overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-10"></div>
        
        {/* Decorative Blobs */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-yellow-400/30 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-purple-500/30 rounded-full filter blur-3xl animate-pulse"></div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Rakamlarla Biz
            </h2>
            <div className="w-24 h-1 bg-yellow-400 mx-auto rounded-full"></div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative group"
            >
              <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-8 border border-white/30 
                          hover:bg-white/30 transition-all duration-300 hover:scale-105 transform">
                <motion.h3 
                  className="text-5xl font-bold text-white mb-4"
                  initial={{ scale: 1 }}
                  whileInView={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, times: [0, 0.5, 1] }}
                >
                  {stats.totalDoctors}
                  <span className="text-yellow-400">+</span>
                </motion.h3>
                <div className="h-1 w-12 bg-yellow-400 rounded-full mb-4"></div>
                <p className="text-white text-lg font-medium">Uzman Doktor</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="relative group"
            >
              <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-8 border border-white/30 
                          hover:bg-white/30 transition-all duration-300 hover:scale-105 transform">
                <motion.h3 
                  className="text-5xl font-bold text-white mb-4"
                  initial={{ scale: 1 }}
                  whileInView={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, times: [0, 0.5, 1] }}
                >
                  {stats.totalPatients}
                  <span className="text-yellow-400">+</span>
                </motion.h3>
                <div className="h-1 w-12 bg-purple-400 rounded-full mb-4"></div>
                <p className="text-white text-lg font-medium">Hasta Sayısı</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="relative group"
            >
              <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-8 border border-white/30 
                          hover:bg-white/30 transition-all duration-300 hover:scale-105 transform">
                <motion.h3 
                  className="text-5xl font-bold text-white mb-4"
                  initial={{ scale: 1 }}
                  whileInView={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, times: [0, 0.5, 1] }}
                >
                  15
                  <span className="text-yellow-400">+</span>
                </motion.h3>
                <div className="h-1 w-12 bg-green-400 rounded-full mb-4"></div>
                <p className="text-white text-lg font-medium">Yıllık Deneyim</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="relative group"
            >
              <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-8 border border-white/30 
                          hover:bg-white/30 transition-all duration-300 hover:scale-105 transform">
                <motion.h3 
                  className="text-5xl font-bold text-white mb-4"
                  initial={{ scale: 1 }}
                  whileInView={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, times: [0, 0.5, 1] }}
                >
                  98
                  <span className="text-yellow-400">%</span>
                </motion.h3>
                <div className="h-1 w-12 bg-pink-400 rounded-full mb-4"></div>
                <p className="text-white text-lg font-medium">Hasta Memnuniyeti</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Quick Appointment Section */}
      <section 
        ref={appointmentSectionRef}
        className="py-24 min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-primary-900"
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-grid opacity-[0.02]" />
          <div className="absolute top-0 -left-4 w-96 h-96 bg-primary-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob" />
          <div className="absolute top-0 -right-4 w-96 h-96 bg-secondary-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-2000" />
          <div className="absolute -bottom-8 left-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-4000" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Header */}
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="inline-block p-2 px-6 bg-white/5 backdrop-blur-lg rounded-full mb-4 border border-white/10"
            >
              <span className="text-white/80 flex items-center gap-2">
                <span className="animate-pulse">🏥</span> Online Randevu Sistemi
              </span>
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-5xl font-bold text-white mb-4"
            >
              Sağlığınız İçin Buradayız
            </motion.h2>
          </div>

          {/* Form Card */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <div className="relative">
              {/* Glass Card */}
              <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-12 border border-white/20">
                {/* Progress Steps */}
                <div className="flex items-center justify-between mb-12 relative">
                  {['Bölüm', 'Doktor', 'Tarih', 'Saat'].map((step, index) => (
                    <motion.div 
                      key={step} 
                      className="flex flex-col items-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className={`
                        w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold
                        transition-all duration-500 relative overflow-hidden group
                        ${getStepStatus(index) ? 'bg-primary-500 text-white' : 'bg-white/10 text-white/60'}
                      `}>
                        <div className="relative z-10">{index + 1}</div>
                        <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-secondary-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                      <span className="mt-2 text-sm font-medium text-white/80">{step}</span>
                    </motion.div>
                  ))}
                  
                  {/* Progress Line */}
                  <div className="absolute top-6 left-0 h-[2px] bg-white/10 w-full -z-10" />
                  <motion.div 
                    className="absolute top-6 left-0 h-[2px] bg-gradient-to-r from-primary-500 to-secondary-500"
                    initial={{ width: '0%' }}
                    animate={{ 
                      width: `${getProgressWidth()}%`
                    }}
                    transition={{ duration: 0.5 }}
                  />
                </div>

                {/* Form Fields */}
                <div className="space-y-8">
                  <CustomSelect
                    label="Bölüm Seçin"
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    options={DEPARTMENTS}
                    icon="🏥"
                    error={formErrors.department}
                    lightTheme={false}
                  />

                  <CustomSelect
                    label="Doktor Seçin"
                    value={selectedDoctor}
                    onChange={(e) => setSelectedDoctor(e.target.value)}
                    options={availableDoctors.map(doc => ({
                      value: doc._id,
                      label: doc.name
                    }))}
                    disabled={!selectedDepartment || isLoadingDoctors}
                    icon="👨‍⚕️"
                    error={formErrors.doctor}
                    lightTheme={false}
                  />

                  {/* Date & Time Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-white/80">Tarih Seçin</label>
                      <motion.div 
                        whileHover={{ scale: 1.02 }}
                        className="relative"
                      >
                        <input
                          type="date"
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white
                                   focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500
                                   disabled:opacity-50 disabled:cursor-not-allowed
                                   placeholder-white/50"
                          min={new Date().toISOString().split('T')[0]}
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          disabled={!selectedDoctor}
                        />
                      </motion.div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-white/80">Saat Seçin</label>
                      <div className="grid grid-cols-4 gap-2">
                        {availableHours.slice(0, 8).map((time) => (
                          <motion.button
                            key={time}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedTime(time)}
                            disabled={!selectedDate}
                            className={`
                              px-3 py-2 rounded-lg text-sm font-medium
                              transition-all duration-200
                              ${selectedTime === time 
                                ? 'bg-primary-500 text-white' 
                                : 'bg-white/10 text-white/80 hover:bg-white/20'}
                              disabled:opacity-50 disabled:cursor-not-allowed
                            `}
                          >
                            {time}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Complaint Field */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white/80">Şikayetiniz</label>
                    <textarea
                      value={formData.complaint}
                      onChange={(e) => setFormData({ ...formData, complaint: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white
                               focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500
                               placeholder-white/50 resize-none h-32"
                      placeholder="Şikayetinizi kısaca açıklayın..."
                    />
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isSubmitting}
                    onClick={handleAppointment}
                    className={`
                      w-full py-4 rounded-xl font-semibold text-white
                      relative overflow-hidden group
                      ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}
                    `}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-secondary-500 transition-transform duration-300" />
                    <div className="relative flex items-center justify-center gap-2">
                      {isSubmitting ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                        />
                      ) : (
                        <>
                          <span>Randevu Oluştur</span>
                          <motion.span
                            animate={{ x: [0, 5, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                          >
                            →
                          </motion.span>
                        </>
                      )}
                    </div>
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h2 className="text-4xl font-bold text-gray-900">
              Neden <span className="text-primary-500">MediCare Plus</span>?
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Modern teknoloji ve uzman kadromuzla sağlığınız için buradayız
            </p>
          </motion.div>

          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="relative p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="text-primary-500 text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
                <p className="mt-2 text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Doctors Section */}
      <div className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">En Çok Tercih Edilen Doktorlarımız</h2>
            <p className="mt-4 text-xl text-gray-600">Deneyimli ve uzman kadromuz</p>
          </div>

          <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {doctors
              .sort((a, b) => {
                // Önce toplam hasta sayısına göre sırala
                if (b.totalPatients !== a.totalPatients) {
                  return b.totalPatients - a.totalPatients;
                }
                // Eşitse, tamamlanan randevu sayısına göre sırala
                return b.completedAppointments - a.completedAppointments;
              })
              .slice(0, 3) // İlk 3 doktoru al
              .map((doctor) => (
                <motion.div
                  key={doctor._id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="h-24 w-24 rounded-full overflow-hidden ring-4 ring-primary-50">
                        <img
                          src={doctor.photo}
                          alt={doctor.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-headingColor">{doctor.name}</h3>
                        <p className="text-primaryColor">{doctor.department}</p>
                      </div>
                    </div>
                    <p className="mt-4 text-[16px] leading-7 text-textColor line-clamp-3">{doctor.bio}</p>
                    <div className="mt-4 flex justify-between text-sm text-textColor">
                      <span>{doctor.completedAppointments} Randevu Tamamlandı</span>
                      <span>{doctor.totalPatients} Hasta Sayısı</span>
                    </div>
                  </div>
                </motion.div>
              ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      {reviews && reviews.length > 0 && (
        <section className="pb-[30px] mt-8">
          <div className="container mx-auto px-4">
            <div className="max-w-[570px] mx-auto mb-12">
              <h2 className="heading text-center text-3xl font-bold">Hasta Yorumları</h2>
              <p className="text__para text-center text-gray-600 mt-4">
                Hastalarımızın deneyimleri ve değerlendirmeleri
              </p>
            </div>

            <div className="mt-[30px] max-w-5xl mx-auto">
              <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={30}
                slidesPerView={1}
                navigation
                pagination={{ clickable: true }}
                autoplay={{ delay: 3000, disableOnInteraction: false }}
                breakpoints={{
                  640: { slidesPerView: 1 },
                  768: { slidesPerView: 2 },
                  1024: { slidesPerView: 3 },
                }}
                className="pb-12"
              >
                {reviews.map((review) => (
                  <SwiperSlide key={review._id}>
                    <div className="py-[30px] px-5 rounded-lg bg-white shadow-lg h-[300px] flex flex-col">
                      <div className="flex flex-col items-center">
                        <h4 className="text-[18px] leading-[30px] font-semibold text-headingColor">
                          {review?.userId?.name?.split(' ')[0]} {review?.userId?.name?.split(' ')[1]?.charAt(0)}.
                        </h4>
                        <div className="flex items-center gap-[2px] mt-2">
                          <p className="text-[14px] text-textColor">
                            Dr. {review?.doctorId?.name} için değerlendirme
                          </p>
                          {review.isEdited && (
                            <span className="text-[12px] text-gray-500 ml-2">(düzenlendi)</span>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 text-center flex-grow flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-center gap-[2px] mb-[10px]">
                            {[...Array(5)].map((_, index) => (
                              <AiFillStar
                                key={index}
                                className={`w-5 h-5 ${
                                  index < review.rating 
                                    ? 'text-yellow-400' 
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-[16px] leading-7 text-textColor">
                            {review.comment}
                          </p>
                        </div>
                        <p className="text-[14px] text-gray-500 mt-3">
                          {new Date(review.createdAt).toLocaleDateString('tr-TR')}
                        </p>
                      </div>

                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </section>
      )}

      {/* Services Section */}
      <section className="py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-4">
              Öne Çıkan Hizmetlerimiz
            </h2>
            <p className="text-xl text-gray-600">
              Sağlığınız için kapsamlı çözümler sunuyoruz
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ 
                  y: -10,
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
                }}
                className="relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 group overflow-hidden"
              >
                {/* Decorative Background */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary-50 to-secondary-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Icon Container */}
                <div className="relative z-10 mb-6">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center transform group-hover:rotate-6 transition-transform duration-300">
                    <span className="text-3xl text-white group-hover:scale-110 transition-transform duration-300">
                      {service.icon}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="relative z-10">
                  <h3 className="text-xl font-semibold text-center text-gray-900 mb-4 group-hover:text-primary-600 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-center text-gray-600 group-hover:text-gray-700 transition-colors">
                    {service.description}
                  </p>
                </div>

                {/* Hover Effect Circle */}
                <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-primary-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.div>
            ))}
          </div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
          </motion.div>
        </div>
      </section>

      {/* ChatBot */}
      <ChatBot />

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-primary-300 bg-clip-text text-transparent">
                MediCare Plus
              </h3>
              <p className="mt-4 text-gray-400">
                Sağlığınız için modern çözümler sunuyoruz.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-100">Hizmetler</h4>
              <ul className="mt-4 space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-primary-400">Kardiyoloji</a></li>
                <li><a href="#" className="text-gray-400 hover:text-primary-400">Nöroloji</a></li>
                <li><a href="#" className="text-gray-400 hover:text-primary-400">Ortopedi</a></li>
                <li><a href="#" className="text-gray-400 hover:text-primary-400">Genel Cerrahi</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-100">İletişim</h4>
              <ul className="mt-4 space-y-2">
                <li className="text-gray-400">📍 Ataşehir, İstanbul</li>
                <li className="text-gray-400">📞 (0216) 555 55 55</li>
                <li className="text-gray-400">✉️ info@medicareplus.com</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-100">Takip Edin</h4>
              <div className="mt-4 flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-primary-400">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-primary-400">
                  <span className="sr-only">Instagram</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2024 MediCare Plus. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const features = [
  {
    icon: "🏥",
    title: "Modern Teknoloji",
    description: "En son teknoloji tıbbi cihazlar ve ekipmanlarla hizmet veriyoruz."
  },
  {
    icon: "👨‍⚕️",
    title: "Uzman Kadro",
    description: "Alanında uzman ve deneyimli doktorlarımızla güvenilir sağlık hizmeti."
  },
  {
    icon: "⏰",
    title: "7/24 Hizmet",
    description: "Acil durumlar için 7/24 hizmet veriyoruz."
  }
];

const services = [
  {
    icon: "🫀",
    title: "Kardiyoloji",
    description: "Kalp sağlığınız için kapsamlı kontrol ve tedavi"
  },
  {
    icon: "🧠",
    title: "Nöroloji",
    description: "Sinir sistemi hastalıklarında uzman tedavi"
  },
  {
    icon: "🦴",
    title: "Ortopedi",
    description: "Kas ve iskelet sistemi rahatsızlıkları tedavisi"
  },
  {
    icon: "👶",
    title: "Pediatri",
    description: "Çocuk sağlığı ve hastalıkları uzman bakımı"
  }
];

export default Home;

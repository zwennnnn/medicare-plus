import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import api from '../../utils/axios';

const DoctorPatients = () => {
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await api.get('/doctor/patients');
      setPatients(response.data);
    } catch (error) {
      toast.error('Hastalar yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
        Hastalarım
      </h1>

      {/* Patients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {patients.map((patient) => (
          <motion.div
            key={patient._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/10"
          >
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <span className="text-xl">👤</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{patient.name}</h3>
                  <p className="text-sm text-gray-400">{patient.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-3 rounded-lg">
                  <div className="text-lg font-semibold text-white">{patient.visitCount}</div>
                  <div className="text-xs text-gray-400">Toplam Ziyaret</div>
                </div>
                <div className="bg-white/5 p-3 rounded-lg">
                  <div className="text-sm font-semibold text-white">
                    {formatDate(patient.lastVisit)}
                  </div>
                  <div className="text-xs text-gray-400">Son Ziyaret</div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && patients.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">
            Henüz hiç hasta bulunmuyor
          </p>
        </div>
      )}
    </div>
  );
};

export default DoctorPatients; 
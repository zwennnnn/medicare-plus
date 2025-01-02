import express from 'express';
import authRoutes from './authRoutes.js';
import adminRoutes from './adminRoutes.js';
import appointmentRoutes from './appointmentRoutes.js';
import userRoutes from './userRoutes.js';
import doctorRoutes from './doctorRoutes.js';

const router = express.Router();

// Debug middleware - tüm route'ları logla
router.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/users', userRoutes);
router.use('/doctors', doctorRoutes);

export default router; 
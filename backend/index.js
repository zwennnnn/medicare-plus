import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Debug için yolu konsola yazdıralım
console.log('Current directory:', __dirname);

// Uploads klasörlerini oluştur
const uploadsPath = path.join(__dirname, 'public', 'uploads', 'doctors');
fs.mkdirSync(uploadsPath, { recursive: true });

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Debug middleware - tüm istekleri logla
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Uploads klasörünü oluştur
const uploadsPath = path.join(__dirname, 'public', 'uploads', 'doctors');
fs.mkdirSync(uploadsPath, { recursive: true });

// Statik dosya servis etme - düzeltilmiş
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Eğer dosya bulunamazsa özel handler
app.use('/uploads', (req, res, next) => {
  const filePath = path.join(__dirname, 'public', 'uploads', req.url);
  console.log('Trying to access:', filePath);
  
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    console.log('File not found:', filePath);
    res.status(404).json({ message: 'Dosya bulunamadı' });
  }
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB bağlantısı başarılı');
    app.listen(PORT, () => {
      console.log(`Server ${PORT} portunda çalışıyor`);
      console.log('Uploads klasör yolu:', uploadsPath);
      // Klasör içeriğini kontrol et
      fs.readdir(uploadsPath, (err, files) => {
        if (err) {
          console.error('Klasör okunamadı:', err);
        } else {
          console.log('Uploads klasöründeki dosyalar:', files);
        }
      });
    });
  })
  .catch((error) => {
    console.error('MongoDB bağlantı hatası:', error);
  });

// Hata yakalama middleware'i
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ message: 'Sunucu hatası' });
});

export default app; 
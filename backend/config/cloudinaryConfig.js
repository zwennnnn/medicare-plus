import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Cloudinary yapılandırması
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Fotoğraf yükleme fonksiyonu
export const uploadImage = async (file) => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: 'doctor-profiles',
      transformation: [
        { width: 128, height: 128, crop: "fill", radius: "max" },
        { quality: "auto" }
      ]
    });
    return result;
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    throw new Error('Fotoğraf yüklenemedi');
  }
};

export default cloudinary; 
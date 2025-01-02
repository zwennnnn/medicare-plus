import express from 'express';
import Review from '../models/reviewModel.js';
import Appointment from '../models/appointmentModel.js';
import User from '../models/userModel.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Son yorumları getir - Bu route'u en üste alıyoruz
router.get('/latest', async (req, res) => {
  try {
    console.log('Son yorumlar istendi');
    const reviews = await Review.find()
      .populate('userId', 'name')
      .populate('doctorId', 'name department')
      .sort({ createdAt: -1 })
      .limit(6);

    console.log('Bulunan yorumlar:', reviews);
    res.json(reviews);
  } catch (error) {
    console.error('Get Latest Reviews Error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Doktorun yorumlarını getir
router.get('/doctor/:id', async (req, res) => {
  try {
    const reviews = await Review.find({ doctorId: req.params.id })
      .populate('userId', 'name')
      .populate('doctorId', 'name department')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    console.error('Get Doctor Reviews Error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Yorum ekle - POST /api/reviews
router.post('/', auth, async (req, res) => {
  try {
    const { rating, comment, appointmentId } = req.body;

    console.log('Gelen yorum verileri:', { rating, comment, appointmentId, userId: req.user.userId });

    // Randevuyu kontrol et
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Randevu bulunamadı' });
    }

    // Yetki kontrolü
    if (appointment.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
    }

    // Önceki yorum kontrolü
    const existingReview = await Review.findOne({ appointmentId });
    if (existingReview) {
      return res.status(400).json({ message: 'Bu randevuya zaten yorum yapılmış' });
    }

    // Yeni yorum oluştur
    const review = new Review({
      userId: req.user.userId,
      doctorId: appointment.doctorId,
      appointmentId,
      rating: Number(rating),
      comment: comment.trim()
    });

    const savedReview = await review.save();

    // Randevuyu güncelle
    appointment.hasReview = true;
    appointment.review = savedReview._id;
    await appointment.save();

    // Doktorun ortalama puanını güncelle
    const allReviews = await Review.find({ doctorId: appointment.doctorId });
    const averageRating = allReviews.reduce((acc, curr) => acc + curr.rating, 0) / allReviews.length;
    
    await User.findByIdAndUpdate(
      appointment.doctorId,
      { $set: { rating: Number(averageRating.toFixed(1)) } }
    );

    // Populate edilmiş yorumu döndür
    const populatedReview = await Review.findById(savedReview._id)
      .populate('userId', 'name')
      .populate('doctorId', 'name department');

    res.status(201).json({
      success: true,
      message: 'Yorum başarıyla eklendi',
      review: populatedReview
    });
  } catch (error) {
    console.error('Add Review Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Yorum eklenirken bir hata oluştu',
      error: error.message 
    });
  }
});

export default router; 
import User from '../models/userModel.js';

export const isDoctor = async (req, res, next) => {
  try {
    console.log('Checking doctor role for user:', req.user.userId);
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      console.log('User not found');
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    console.log('User role:', user.role);
    if (user.role !== 'doctor') {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
    }
    
    next();
  } catch (error) {
    console.error('Role Check Error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

export const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
}; 
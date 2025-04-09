import express from 'express';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Regular authenticated route
router.get('/dashboard-data', authMiddleware, (req, res) => {
  res.json({ 
    message: 'Secure content',
    userId: req.user.id,
    userName: req.user.name,
    isAdmin: req.user.isAdmin 
  });
});

// Admin-only route
router.get('/admin-data', authMiddleware, adminMiddleware, (req, res) => {
  res.json({ message: 'Super secret admin content' });
});

export default router;
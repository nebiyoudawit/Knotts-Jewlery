import express from 'express';
import { registerUser, loginUser } from '../controllers/authController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

// ✅ Add token verification route
router.get('/verify', protect, (req, res) => {
  res.json({ user: req.user });
});

export default router;

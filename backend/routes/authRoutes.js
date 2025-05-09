import express from 'express';
import { registerUser, loginUser } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js'; // Correct import

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

// ✅ Add token verification route
router.get('/verify', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

export default router;

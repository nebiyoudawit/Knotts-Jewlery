import express from 'express';
import { updateUserProfile, changeUserPassword } from '../controllers/userController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.put('/update', protect, updateUserProfile);
router.put('/change-password', protect, changeUserPassword);

export default router;

import express from 'express';
import { registerUser, loginUser, logoutUser } from '../controller/authController.js';
import { protect } from '../middlewares/protect.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
// Making logout accessible without authentication since we're handling it client-side
router.post('/logout', logoutUser);

export default router;
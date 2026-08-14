import { Router } from 'express';
import { 
    googleSignIn, 
    googleCallback, 
    microsoftSignIn, 
    microsoftCallback,
    getMe,
    logout
} from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

// Public OAuth triggers & callbacks
router.get('/google', googleSignIn);
router.get('/google/callback', googleCallback);

router.get('/microsoft', microsoftSignIn);
router.get('/microsoft/callback', microsoftCallback);

// Protected session endpoints
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

export default router;

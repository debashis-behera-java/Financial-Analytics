import { Router } from 'express';
import { getMe, login, logout, protectedTest } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post('/login', login);
router.post('/logout', logout);
router.get('/me', requireAuth, getMe);
router.get('/protected-test', requireAuth, protectedTest);

export default router;

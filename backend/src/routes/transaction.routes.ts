import { Router } from 'express';
import { exportTransactions, getTransaction, getTransactions } from '../controllers/transaction.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

// All transaction endpoints require a valid JWT.
// NOTE: /export must precede /:id so "export" is not treated as an id.
router.get('/export', requireAuth, exportTransactions);
router.get('/', requireAuth, getTransactions);
router.get('/:id', requireAuth, getTransaction);

export default router;

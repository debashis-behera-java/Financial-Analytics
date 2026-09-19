import { Router } from 'express';
import {
  getCategoriesHandler,
  getRevenueExpenseHandler,
  getSummaryHandler,
} from '../controllers/analytics.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

// All analytics endpoints require a valid JWT.
router.get('/summary', requireAuth, getSummaryHandler);
router.get('/revenue-expense', requireAuth, getRevenueExpenseHandler);
router.get('/categories', requireAuth, getCategoriesHandler);

export default router;

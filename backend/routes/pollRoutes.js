import express from 'express';
import { createPoll, getPolls, votePoll } from '../controllers/pollController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, admin, createPoll);
router.get('/', protect, getPolls);
router.post('/:id/vote', protect, votePoll);

export default router;

import express from 'express';
import { createScheme, getSchemes } from '../controllers/schemeController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, admin, createScheme);
router.get('/', protect, getSchemes);

export default router;

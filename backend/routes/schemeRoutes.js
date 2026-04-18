import express from 'express';
import { createScheme, getSchemes, updateScheme, deleteScheme } from '../controllers/schemeController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, admin, createScheme);
router.get('/', protect, getSchemes);
router.put('/:id', protect, admin, updateScheme);
router.delete('/:id', protect, admin, deleteScheme);

export default router;

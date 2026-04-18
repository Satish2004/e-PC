import express from 'express';
import multer from 'multer';
import { createComplaint, getComplaints, updateComplaintStatus, deleteComplaint } from '../controllers/complaintController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Multer Config for Memory Storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max per image
});

router.post('/', protect, upload.array('images', 3), createComplaint);
router.get('/', protect, getComplaints);
router.put('/:id', protect, admin, updateComplaintStatus);
router.delete('/:id', protect, admin, deleteComplaint);

export default router;

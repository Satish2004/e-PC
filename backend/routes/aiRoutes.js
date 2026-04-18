import express from 'express';
import { chatWithGovtAI } from '../utils/gemini.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/chat', protect, async (req, res) => {
    const { prompt } = req.body;
    try {
        const responseText = await chatWithGovtAI(prompt);
        res.json({ response: responseText });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;

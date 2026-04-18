import Scheme from '../models/Scheme.js';
import { summarizeSchemes } from '../utils/gemini.js';

export const createScheme = async (req, res) => {
    const { title, description, eligibility, link } = req.body;
    try {
        const simplifiedDescription = await summarizeSchemes(description);
        const scheme = await Scheme.create({
            title, description, simplifiedDescription, eligibility, link
        });
        res.status(201).json(scheme);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getSchemes = async (req, res) => {
    try {
        const schemes = await Scheme.find().sort({ createdAt: -1 });
        res.json(schemes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

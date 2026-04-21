import Scheme from '../models/Scheme.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { summarizeSchemes, translateToHindi } from '../utils/gemini.js';
import { sendEmail } from '../utils/email.js';

export const createScheme = async (req, res) => {
    const { title, description, eligibility, link } = req.body;
    try {
        const translatedDescription = await translateToHindi(description);
        const simplifiedDescription = await summarizeSchemes(translatedDescription);
        const scheme = await Scheme.create({
            title, description: translatedDescription, simplifiedDescription, eligibility, link
        });

        // Notify all citizens about the new scheme
        const citizens = await User.find({ role: 'Citizen' });
        if (citizens.length > 0) {
            const notifications = citizens.map(citizen => ({
                user: citizen._id,
                title: 'New Government Scheme',
                message: `A new scheme "${title}" has been launched. Check it out!`,
                type: 'Scheme'
            }));
            await Notification.insertMany(notifications);

            // Dispatch realtime emails asynchronously
            citizens.forEach(citizen => {
                const emailBody = `A new scheme "${title}" has been launched by the Panchayat.\n\nDetails:\n${description}\n\nEligibility: ${eligibility}\nMore info: ${link}\n\nLog in to your e-PC Dashboard to know more.`;
                sendEmail(citizen.email, `New Government Scheme: ${title}`, emailBody).catch(e => console.log(e));
            });
        }

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

export const updateScheme = async (req, res) => {
    try {
        const { title, description, eligibility, link } = req.body;
        const scheme = await Scheme.findById(req.params.id);
        if (!scheme) return res.status(404).json({ message: 'Scheme not found' });
        
        let newSimplification = scheme.simplifiedDescription;
        let finalDescription = scheme.description;
        if (description && description !== scheme.description) {
            finalDescription = await translateToHindi(description);
            newSimplification = await summarizeSchemes(finalDescription);
        }

        scheme.title = title || scheme.title;
        scheme.description = finalDescription;
        scheme.simplifiedDescription = newSimplification;
        scheme.eligibility = eligibility || scheme.eligibility;
        scheme.link = link || scheme.link;
        await scheme.save();
        
        const citizens = await User.find({ role: 'Citizen' });
        if (citizens.length > 0) {
            const notifications = citizens.map(citizen => ({
                user: citizen._id,
                title: 'Updated Government Scheme',
                message: `The scheme "${scheme.title}" has been updated. Check it out!`,
                type: 'Scheme'
            }));
            await Notification.insertMany(notifications);

            citizens.forEach(citizen => {
                const emailBody = `The scheme "${scheme.title}" has been updated by the Panchayat.\n\nDetails:\n${scheme.description}\n\nEligibility: ${scheme.eligibility}\nMore info: ${scheme.link}\n\nLog in to your e-PC Dashboard to know more.`;
                sendEmail(citizen.email, `Updated Government Scheme: ${scheme.title}`, emailBody).catch(e => console.log(e));
            });
        }
        res.json(scheme);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteScheme = async (req, res) => {
    try {
        const scheme = await Scheme.findById(req.params.id);
        if (!scheme) return res.status(404).json({ message: 'Scheme not found' });
        await scheme.deleteOne();
        res.json({ message: 'Scheme deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

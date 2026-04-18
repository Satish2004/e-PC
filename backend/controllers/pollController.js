import Poll from '../models/Poll.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { sendEmail } from '../utils/email.js';

export const createPoll = async (req, res) => {
    const { question, options } = req.body;
    try {
        const optionArray = options.map(opt => ({ text: opt }));
        const poll = await Poll.create({ question, options: optionArray });

        // Notify all citizens about the new poll
        const citizens = await User.find({ role: 'Citizen' });
        if (citizens.length > 0) {
            const notifications = citizens.map(citizen => ({
                user: citizen._id,
                title: 'New Village Poll',
                message: `A new poll "${question}" has been created. Cast your vote now!`,
                type: 'Notice'
            }));
            await Notification.insertMany(notifications);

            // Dispatch realtime emails asynchronously
            citizens.forEach(citizen => {
                const emailBody = `The Panchayat Admin has created a new community poll:\n\nQuestion: "${question}"\n\nPlease log in to your e-PC Dashboard to cast your vote and make your voice heard!`;
                sendEmail(citizen.email, `New Village Poll: ${question}`, emailBody).catch(e => console.log(e));
            });
        }

        res.status(201).json(poll);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getPolls = async (req, res) => {
    try {
        const polls = await Poll.find().sort({ createdAt: -1 });
        res.json(polls);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const votePoll = async (req, res) => {
    const { optionId } = req.body;
    try {
        const poll = await Poll.findById(req.params.id);
        if (!poll) return res.status(404).json({ message: 'Poll not found' });

        if (poll.voters.includes(req.user._id)) {
            return res.status(400).json({ message: 'Already voted' });
        }

        const option = poll.options.id(optionId);
        if (!option) return res.status(404).json({ message: 'Option not found' });

        option.votes += 1;
        poll.voters.push(req.user._id);
        await poll.save();
        
        res.json(poll);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updatePoll = async (req, res) => {
    try {
        const { question, options } = req.body;
        const poll = await Poll.findById(req.params.id);
        if (!poll) return res.status(404).json({ message: 'Poll not found' });
        
        if (question) poll.question = question;
        if (options && options.length > 0) {
            poll.options = options.map(opt => ({ text: opt, votes: 0 }));
            poll.voters = []; 
        }
        await poll.save();

        const citizens = await User.find({ role: 'Citizen' });
        if (citizens.length > 0) {
            const notifications = citizens.map(citizen => ({
                user: citizen._id,
                title: 'Updated Village Poll',
                message: `The poll "${poll.question}" has been updated.`,
                type: 'Notice'
            }));
            await Notification.insertMany(notifications);

            citizens.forEach(citizen => {
                const emailBody = `The Panchayat Admin has updated a community poll \n\nQuestion: "${poll.question}"\n\nPlease log in to your e-PC Dashboard to cast your vote!`;
                sendEmail(citizen.email, `Updated Village Poll: ${poll.question}`, emailBody).catch(e => console.log(e));
            });
        }

        res.json(poll);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deletePoll = async (req, res) => {
    try {
        const poll = await Poll.findById(req.params.id);
        if (!poll) return res.status(404).json({ message: 'Poll not found' });
        await poll.deleteOne();
        res.json({ message: 'Poll deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

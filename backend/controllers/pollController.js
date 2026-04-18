import Poll from '../models/Poll.js';

export const createPoll = async (req, res) => {
    const { question, options } = req.body;
    try {
        const optionArray = options.map(opt => ({ text: opt }));
        const poll = await Poll.create({ question, options: optionArray });
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

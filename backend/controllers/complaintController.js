import Complaint from '../models/Complaint.js';
import Notification from '../models/Notification.js';
import { analyzeComplaint } from '../utils/gemini.js';
import { sendEmail } from '../utils/email.js';
import cloudinary from '../config/cloudinary.js';

const uploadToCloudinary = (buffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: "epc_complaints" },
            (error, result) => {
                if (result) resolve(result.secure_url);
                else reject(error);
            }
        );
        stream.end(buffer);
    });
};

export const createComplaint = async (req, res) => {
    const { title, description, location } = req.body;
    let parsedLocation = null;
    
    if (location) {
        try { parsedLocation = JSON.parse(location); } catch(e) {}
    }

    try {
        let imageUrls = [];
        if (req.files && req.files.length > 0) {
            const uploadPromises = req.files.map(file => uploadToCloudinary(file.buffer));
            imageUrls = await Promise.all(uploadPromises);
        }

        const aiData = await analyzeComplaint(description);
        const complaint = await Complaint.create({
            user: req.user._id,
            title,
            description,
            aiEnhancement: aiData.enhancedText,
            category: aiData.category,
            urgency: aiData.urgency,
            images: imageUrls,
            location: parsedLocation
        });

        res.status(201).json(complaint);
    } catch (error) {
        console.error("Complaint creation error:", error);
        res.status(500).json({ message: error.message });
    }
};

export const getComplaints = async (req, res) => {
    try {
        const complaints = req.user.role === 'Admin' 
            ? await Complaint.find().populate('user', 'name email').sort({ createdAt: -1 })
            : await Complaint.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(complaints);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateComplaintStatus = async (req, res) => {
    const { status } = req.body;
    try {
        const complaint = await Complaint.findById(req.params.id).populate('user', 'name email');
        if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

        complaint.status = status;
        await complaint.save();

        // Notify User
        await Notification.create({
            user: complaint.user._id,
            title: 'Complaint Update',
            message: `Your complaint "${complaint.title}" is now ${status}.`,
            type: 'Complaint'
        });

        // Email Notify
        sendEmail(complaint.user.email, 'e-PC Complaint Update', `Your complaint "${complaint.title}" status has been updated to: ${status}.`);

        res.json(complaint);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteComplaint = async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id);
        if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
        await complaint.deleteOne();
        res.json({ message: 'Complaint deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

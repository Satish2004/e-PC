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

const getDistanceInKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c; // Distance in km
};

export const createComplaint = async (req, res) => {
    const { title, description, location } = req.body;
    let parsedLocation = null;
    
    if (location) {
        try { parsedLocation = JSON.parse(location); } catch(e) {}
    }

    try {
        const aiData = await analyzeComplaint(description);

        // Smart Deduplication check (same category within 200 meters)
        if (parsedLocation && parsedLocation.lat && parsedLocation.lng) {
            const existingComplaints = await Complaint.find({ status: { $ne: 'Resolved' } }).populate('user', 'name');
            for (let c of existingComplaints) {
                if (c.location && c.location.lat && c.location.lng) {
                    const distance = getDistanceInKm(parsedLocation.lat, parsedLocation.lng, c.location.lat, c.location.lng);
                    if (distance <= 0.2) { // 200 meters
                        const newCat = (aiData.category || '').toLowerCase();
                        const oldCat = (c.category || '').toLowerCase();
                        if (newCat && oldCat && (newCat.includes(oldCat) || oldCat.includes(newCat) || newCat === oldCat)) {
                            return res.status(400).json({ message: `Duplicate Detected! This ${c.category} issue has already been raised near this location by citizen ${c.user?.name?.split(' ')[0] || 'someone'}.` });
                        }
                    }
                }
            }
        }

        let imageUrls = [];
        if (req.files && req.files.length > 0) {
            const uploadPromises = req.files.map(file => uploadToCloudinary(file.buffer));
            imageUrls = await Promise.all(uploadPromises);
        }

        const complaint = await Complaint.create({
            user: req.user._id,
            title,
            description: aiData.translatedHinglish || description,
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

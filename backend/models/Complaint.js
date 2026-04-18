import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    aiEnhancement: { type: String }, // Store AI-generated professional version
    category: { type: String, default: 'General' },
    urgency: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
    status: { type: String, enum: ['Pending', 'In Progress', 'Resolved'], default: 'Pending' },
    images: [{ type: String }], // Cloudinary URLs
    location: {
        lat: { type: Number },
        lng: { type: Number },
        address: { type: String }
    }
}, { timestamps: true });

const Complaint = mongoose.model('Complaint', complaintSchema);
export default Complaint;

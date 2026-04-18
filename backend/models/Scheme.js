import mongoose from 'mongoose';

const schemeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    simplifiedDescription: { type: String }, // AI simplified Hindi version
    eligibility: { type: String },
    link: { type: String }
}, { timestamps: true });

const Scheme = mongoose.model('Scheme', schemeSchema);
export default Scheme;

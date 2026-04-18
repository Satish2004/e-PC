import mongoose from 'mongoose';

const pollSchema = new mongoose.Schema({
    question: { type: String, required: true },
    options: [{
        text: { type: String, required: true },
        votes: { type: Number, default: 0 }
    }],
    voters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Poll = mongoose.model('Poll', pollSchema);
export default Poll;

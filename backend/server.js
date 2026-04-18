import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { startScheduler } from './utils/scheduler.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import complaintRoutes from './routes/complaintRoutes.js';
import pollRoutes from './routes/pollRoutes.js';
import schemeRoutes from './routes/schemeRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

// Load env
dotenv.config();

// Connect DB
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/polls', pollRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', aiRoutes);

app.get('/', (req, res) => {
    res.send('e-PC Backend is running');
});

// Start Background Jobs
startScheduler();

const PORT = Math.floor(Math.random() * (6000 - 5000 + 1) + 5000); // Because standard port might be busy, but wait, usually we just use process.env.PORT, let's use 5000
const actualPort = process.env.PORT || 5000;
app.listen(actualPort, () => {
    console.log(`Server running on port ${actualPort}`);
});

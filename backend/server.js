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

app.use(cors({
    origin: ['https://e-pc-mocha.vercel.app', 'http://localhost:5173', 'http://localhost:5000'],
    credentials: true
}));
app.use(express.json());

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mount Routes
app.use('/auth', authRoutes);
app.use('/complaints', complaintRoutes);
app.use('/polls', pollRoutes);
app.use('/schemes', schemeRoutes);
app.use('/notifications', notificationRoutes);
app.use('/ai', aiRoutes);

// Serve Frontend
app.use(express.static(path.join(__dirname, '../frontend/dist')));

app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// Start Background Jobs
startScheduler();

const PORT = Math.floor(Math.random() * (6000 - 5000 + 1) + 5000); // Because standard port might be busy, but wait, usually we just use process.env.PORT, let's use 5000
const actualPort = process.env.PORT || 5000;
app.listen(actualPort, () => {
    console.log(`Server running on port ${actualPort}`);
});

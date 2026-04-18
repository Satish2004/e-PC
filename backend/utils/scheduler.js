import cron from 'node-cron';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

export const startScheduler = () => {
    // Run every day at 8:00 AM to simulate daily scheme rotation or unread summary
    cron.schedule('0 8 * * *', async () => {
        console.log('Running daily scheme notification job...');
        try {
            const users = await User.find({});
            const notifications = users.map(user => ({
                user: user._id,
                title: 'Daily Update',
                message: 'Check out the latest government schemes updated today!',
                type: 'Scheme'
            }));
            await Notification.insertMany(notifications);
            console.log(`Sent daily scheme notifications to ${users.length} users.`);
        } catch (error) {
            console.error('Scheduler error:', error);
        }
    });
};

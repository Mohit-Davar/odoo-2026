import cron from 'node-cron';
import { getDriversWithExpiringLicenses, getAdminUsers } from '../models/cron.model.js';
import { sendLicenseExpiryNotification } from './mailer.js';

const scheduleEmailReminders = () => {
  // Schedule a task to run every day at 9:00 AM
  cron.schedule('0 9 * * *', async () => {
    console.log('Running daily check for expiring driver licenses...');
    try {
      const expiringDrivers = await getDriversWithExpiringLicenses();

      if (expiringDrivers.length === 0) {
        console.log('No expiring licenses found today.');
        return;
      }

      console.log(`Found ${expiringDrivers.length} expiring license(s). Fetching admin users...`);
      const adminUsers = await getAdminUsers();

      if (adminUsers.length === 0) {
        console.log('No admin users found to send notification.');
        return;
      }

      const adminEmails = adminUsers.map(user => user.email);
      console.log(`Sending notification to ${adminEmails.length} admin(s)...`);

      await sendLicenseExpiryNotification(adminEmails, expiringDrivers);
      console.log('License expiry notification email sent successfully.');

    } catch (error) {
      console.error('Error running license expiry cron job:', error);
    }
  });
};

export default scheduleEmailReminders;

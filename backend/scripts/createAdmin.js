const dotenv = require('dotenv');
const { sequelize } = require('../config/database');
const User = require('../models/User');

dotenv.config();

const [, , emailArg, passwordArg, nameArg] = process.argv;
const adminEmail = (emailArg || process.env.ADMIN_EMAIL || 'admin@gmail.com').toLowerCase();
const adminPassword = passwordArg || process.env.ADMIN_PASSWORD || 'admin123';
const adminName = nameArg || process.env.ADMIN_NAME || 'Administrator';

async function createAdminUser() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    const existingAdmin = await User.findOne({ where: { email: adminEmail } });

    if (existingAdmin) {
      console.log(`Admin user already exists with email ${adminEmail}`);
      process.exit(0);
    }

    const user = await User.create({
      email: adminEmail,
      password: adminPassword,
      name: adminName,
      role: 'admin',
      isActive: true
    });

    console.log('Admin user created successfully!');
    console.log(`Email: ${user.email}`);
    console.log('You can set ADMIN_EMAIL/ADMIN_PASSWORD environment variables or pass them as arguments:');
    console.log('  npm run create-admin -- admin@example.com StrongPass123 "Admin Name"');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminUser();

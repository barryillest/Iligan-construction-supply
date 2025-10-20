const User = require('../models/User');

const DEFAULT_ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@gmail.com').toLowerCase();
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const DEFAULT_ADMIN_NAME = process.env.ADMIN_NAME || 'Administrator';

/**
 * Ensures that at least one administrator account exists so developers
 * have working credentials out of the box.
 */
const ensureDefaultAdmin = async () => {
  const existingAdmin = await User.findOne({ where: { email: DEFAULT_ADMIN_EMAIL } });

  if (existingAdmin) {
    return existingAdmin;
  }

  const adminUser = await User.create({
    email: DEFAULT_ADMIN_EMAIL,
    password: DEFAULT_ADMIN_PASSWORD,
    name: DEFAULT_ADMIN_NAME,
    role: 'admin',
    isActive: true,
  });

  console.log(`[seed] Created default admin user (${adminUser.email}). Update ADMIN_PASSWORD to override the default.`);
  return adminUser;
};

module.exports = { ensureDefaultAdmin };

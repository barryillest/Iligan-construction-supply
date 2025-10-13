const { sequelize } = require('../config/database');
const User = require('../models/User');

async function deleteUser() {
  try {
    const userEmail = 'admin@gmail.com';
    const user = await User.findOne({ where: { email: userEmail } });

    if (user) {
      await user.destroy();
      console.log(`User with email ${userEmail} has been deleted.`);
    } else {
      console.log(`User with email ${userEmail} not found.`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error deleting user:', error);
    process.exit(1);
  }
}

deleteUser();

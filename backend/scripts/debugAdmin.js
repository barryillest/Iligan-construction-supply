const { sequelize } = require('../config/database');
const User = require('../models/User');

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    const user = await User.findOne({ where: { email: 'admin@gmail.com' } });
    if (!user) {
      console.log('Admin not found');
      process.exit(0);
    }
    const ok = await user.comparePassword('admin123');
    const pwHashed = !!user.password && user.password.startsWith('');
    console.log(JSON.stringify({ id: user.id, role: user.role, isActive: user.isActive, pwHashed, compareOk: ok }));
  } catch (e) {
    console.error('Error:', e);
  } finally {
    process.exit(0);
  }
})();

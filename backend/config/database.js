const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../database/iligan_construction.sqlite'),
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    timestamps: true,
    underscored: false,
  }
});

const cleanupDanglingBackupTables = async () => {
  if (sequelize.getDialect() !== 'sqlite') {
    return;
  }

  const queryInterface = sequelize.getQueryInterface();
  const tables = await queryInterface.showAllTables();
  const normalizeName = (table) => {
    if (!table) return null;
    if (typeof table === 'string') return table;
    if (typeof table === 'object') {
      return table.tableName || table.name || null;
    }
    return null;
  };

  const backupTables = tables
    .map(normalizeName)
    .filter((name) => typeof name === 'string' && name.endsWith('_backup'));

  for (const tableName of backupTables) {
    // Leftover SQLite tables from a previous interrupted ALTER TABLE sequence.
    console.warn(`Cleaning up dangling backup table: ${tableName}`);
    await queryInterface.dropTable(tableName);
  }
};

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('SQLite database connected successfully');

    await cleanupDanglingBackupTables();

    // Sync all models
    await sequelize.sync({ alter: true });
    console.log('Database models synchronized');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { connectDB } = require('./config/database');
const { ensureDefaultAdmin } = require('./utils/ensureDefaultAdmin');

dotenv.config();

const app = express();
const DEFAULT_PORT = Number(process.env.PORT) || 5000;
const MAX_PORT_ATTEMPTS = 5;
const isProduction = process.env.NODE_ENV === 'production';

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProduction ? 100 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    if (isProduction) {
      return false;
    }
    const localIps = ['::1', '127.0.0.1', '::ffff:127.0.0.1'];
    return localIps.includes(req.ip);
  },
  message: {
    message: 'Too many requests from this IP, please try again later.'
  }
});

// Middleware
app.use(helmet());
app.use(limiter);
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 'your-production-url' : 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/users', require('./routes/users'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Iligan Construction Supply API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Initialize database and start server
const startServer = async () => {
  try {
    await connectDB();
    await ensureDefaultAdmin();

    const attemptListen = (port, attempt = 0) => {
      const server = app.listen(port, () => {
        console.log(`Server running on port ${port}`);
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      });

      server.on('error', (err) => {
        if (err && err.code === 'EADDRINUSE') {
          const nextAttempt = attempt + 1;
          if (nextAttempt > MAX_PORT_ATTEMPTS) {
            console.error(`Port ${port} is in use and no fallback ports are available after ${MAX_PORT_ATTEMPTS} attempts.`);
            process.exit(1);
          } else {
            const nextPort = port + 1;
            console.warn(`Port ${port} is in use. Trying port ${nextPort} (attempt ${nextAttempt}/${MAX_PORT_ATTEMPTS})...`);
            attemptListen(nextPort, nextAttempt);
          }
        } else {
          console.error('Failed to start server:', err);
          process.exit(1);
        }
      });
    };

    attemptListen(DEFAULT_PORT);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

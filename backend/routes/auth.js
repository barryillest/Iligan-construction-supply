const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET || 'development_jwt_secret';

const decodeGoogleCredential = (credential) => {
  if (!credential || typeof credential !== 'string') {
    return null;
  }

  const parts = credential.split('.');
  if (parts.length < 2) {
    return null;
  }

  const base64Url = parts[1];
  let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }

  try {
    const payload = Buffer.from(base64, 'base64').toString('utf8');
    return JSON.parse(payload);
  } catch (error) {
    console.error('Failed to decode Google credential payload:', error);
    return null;
  }
};

// Surface Google Sign-In configuration so the frontend can stay in sync
router.get('/google/config', (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!clientId) {
    return res.status(404).json({ message: 'Google Sign-In is not configured on the server' });
  }

  const allowedOrigins = process.env.GOOGLE_ALLOWED_ORIGINS
    ? process.env.GOOGLE_ALLOWED_ORIGINS.split(',').map(origin => origin.trim()).filter(Boolean)
    : ['http://localhost:3000'];

  res.json({
    clientId,
    allowedOrigins
  });
});

// Register with email/password
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = await User.create({
      email,
      password,
      name
    });

    const jwtToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token: jwtToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    // Surface common, helpful error messages
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    if (error.name === 'SequelizeValidationError') {
      const firstMsg = error.errors?.[0]?.message || 'Validation error';
      return res.status(400).json({ message: firstMsg });
    }
    res.status(500).json({ message: 'Registration failed' });
  }
});

// Login with email/password
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const jwtToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token: jwtToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

// Google Sign-In
router.post('/google', async (req, res) => {
  try {
    const { token } = req.body;

    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({ message: 'Google Sign-In not configured on server' });
    }

    let payload;

    try {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      payload = ticket.getPayload();
    } catch (verificationError) {
      console.warn('Google token verification failed, attempting decode fallback (non-production only).', verificationError);

      if (process.env.NODE_ENV === 'production') {
        throw verificationError;
      }

      const decoded = decodeGoogleCredential(token);
      if (!decoded || decoded.aud !== process.env.GOOGLE_CLIENT_ID) {
        throw verificationError;
      }

      payload = decoded;
    }

    const googleId = payload.sub || payload.user_id || payload.email;
    if (!googleId) {
      throw new Error('Google token payload does not include a subject identifier.');
    }
    const email = (payload.email || `${googleId}@google.test`).toLowerCase();
    const name = payload.name || payload.given_name || email;
    const picture = payload.picture || '';

    let user = await User.findOne({
      where: {
        [User.sequelize.Sequelize.Op.or]: [
          { googleId },
          { email }
        ]
      }
    });

    if (!user) {
      user = await User.create({
        googleId,
        email,
        name,
        avatar: picture
      });
    } else if (!user.googleId) {
      user.googleId = googleId;
      user.avatar = picture;
      await user.save();
    }

    const jwtToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token: jwtToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    const message = process.env.NODE_ENV !== 'production'
      ? 'Google sign-in failed. Verify GOOGLE_CLIENT_ID is set on the backend and exposed to the frontend, and that localhost:3000 is authorised in Google Cloud.'
      : 'Invalid Google token.';
    res.status(400).json({ message });
  }
});

// Verify JWT token middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }

    try {
      const dbUser = await User.findByPk(decoded.userId);

      if (!dbUser || !dbUser.isActive) {
        return res.status(401).json({ message: 'User no longer has access' });
      }

      req.authUser = dbUser;
      req.user = {
        userId: dbUser.id,
        email: dbUser.email,
        role: dbUser.role,
      };
      next();
    } catch (error) {
      console.error('Auth lookup error:', error);
      return res.status(500).json({ message: 'Authentication failed' });
    }
  });
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId, {
      attributes: { exclude: ['password'] }
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
module.exports.authenticateToken = authenticateToken;
module.exports.requireAdmin = requireAdmin;

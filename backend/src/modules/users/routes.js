import crypto from 'crypto';
import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../../models/User.js';
import Order from '../../models/Order.js';
import { verifyToken, requireAdmin } from '../../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';
const ACCESS_TOKEN_EXPIRES_IN = '15m';

function generateAccessToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES_IN });
}

function generateRefreshToken() {
  return crypto.randomBytes(48).toString('hex');
}

async function createAuthResponse(user) {
  const token = generateAccessToken(user);
  const refreshToken = generateRefreshToken();
  user.refreshTokens = user.refreshTokens.concat(refreshToken);
  await user.save();
  return {
    token,
    refreshToken,
    user: { id: user._id, name: user.name, email: user.email, role: user.role }
  };
}

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ error: 'User already exists' });
    user = new User({ name, email, password });
    await user.save();
    const authResponse = await createAuthResponse(user);
    res.status(201).json(authResponse);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    const match = await user.comparePassword(password);
    if (!match) return res.status(400).json({ error: 'Invalid credentials' });
    const authResponse = await createAuthResponse(user);
    res.json(authResponse);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: 'Refresh token required' });
    const user = await User.findOne({ refreshTokens: refreshToken });
    if (!user) return res.status(401).json({ error: 'Invalid refresh token' });
    user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
    const authResponse = await createAuthResponse(user);
    res.json(authResponse);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: 'Refresh token required' });
    const user = await User.findOne({ refreshTokens: refreshToken });
    if (user) {
      user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
      await user.save();
    }
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/me', verifyToken, async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  res.json(req.user);
});

const adminRouter = express.Router();

adminRouter.get('/users', verifyToken, requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.get('/users/:id/orders', verifyToken, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('email');
    if (!user) return res.status(404).json({ error: 'User not found' });
    const orders = await Order.find({
      $or: [
        { userId: user._id },
        { customerEmail: user.email }
      ]
    }).populate('items.productId');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export { router as authRoutes, adminRouter as adminRoutes };

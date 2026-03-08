import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import { verifyToken } from '../middleware/auth.js';
import { sendEmail } from '../utils/email.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    // Generate secure email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = new User({ email, passwordHash, name, verificationToken });
    await user.save();

    // Send verification email
    const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email/${verificationToken}`;
    const emailHtml = `
      <h2>Welcome to Collab Hub!</h2>
      <p>Click the link below to verify your email address and activate your account:</p>
      <a href="${verificationUrl}" style="padding: 10px 15px; background: #0ea5e9; color: white; text-decoration: none; border-radius: 5px;">Verify Email Address</a>
      <p>If the button doesn't work, copy and paste this link into your browser: <br/>${verificationUrl}</p>
      <p>This link is valid indefinitely until you verify.</p>
    `;
    await sendEmail(user.email, 'Verify your Collab Hub Email', emailHtml);

    // Notify user to check their email (No automatic JWT login cookie anymore)
    res.status(201).json({ message: 'Registration successful. Please check your email to verify your account.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    // Enforce email verification protocol
    if (!user.isVerified) {
      return res.status(403).json({ error: 'Please verify your email address before logging in. Check your inbox.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });
    
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ user: { id: user._id, email: user.email, name: user.name, avatarUrl: user.avatarUrl } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user: { id: user._id, email: user.email, name: user.name, avatarUrl: user.avatarUrl } });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// EMAIL AUTHENTICATION ROUTES
// ============================================

router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Missing verification token' });

    const user = await User.findOne({ verificationToken: token });
    if (!user) return res.status(400).json({ error: 'Invalid or expired verification token' });

    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    res.json({ message: 'Email successfully verified. You can now log in.' });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ error: 'Server error during verification' });
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const user = await User.findOne({ email });
    // Always return a success message here to prevent email enumeration attacks
    if (!user) {
      return res.json({ message: 'If an account exists, a password reset link has been sent.' });
    }

    // Generate heavy 64 byte token
    const resetToken = crypto.randomBytes(64).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = Date.now() + 3600000; // 1 Hour TTL
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
    const emailHtml = `
      <h2>Collab Hub Password Reset</h2>      <p>We received a request to reset your password. Click the link below to set a new one:</p>
      <a href="${resetUrl}" style="padding: 10px 15px; background: #22c55e; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
      <p>If you did not request this, you can safely ignore this email.</p>
      <p>This link will expire in 1 hour.</p>
    `;

    await sendEmail(user.email, 'Collab Hub Password Reset', emailHtml);
    res.json({ message: 'If an account exists, a password reset link has been sent.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Server error processing password reset.' });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ error: 'Missing token or new password.' });

    const user = await User.findOne({ 
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: Date.now() } // Ensure token is not expired
    });

    if (!user) {
      return res.status(400).json({ error: 'Password reset token is invalid or has expired.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    
    // Clear out reset tokens once consumed
    user.resetPasswordToken = null;
    user.resetPasswordExpiresAt = null;
    await user.save();

    res.json({ message: 'Password has been successfully reset. You may now log in.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Server error attempting to reset password.' });
  }
});

export default router;

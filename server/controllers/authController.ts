import { RequestHandler } from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { User } from '../models/User';
import { Organization } from '../models/Organization';
import { generateToken } from '../utils/jwt';
import { sendVerificationEmail } from '../services/emailService';

export const register: RequestHandler = async (req, res, next) => {
  let session;
  try {
    session = await mongoose.startSession();
    session.startTransaction();
  } catch (err) {
    // If the database doesn't support transactions (e.g., standalone MongoDB instead of replica set),
    // we'll proceed without a session, but log a warning.
    console.warn('MongoDB transactions not supported, proceeding without transaction.', err);
  }

  try {
    const { organization, user } = req.body;

    // 1. Validation
    if (!organization || !organization.name) {
      res.status(400).json({ success: false, message: 'Organization name is required.' });
      return;
    }
    if (!user || !user.name || !user.email || !user.password) {
      res.status(400).json({ success: false, message: 'User name, email, and password are required.' });
      return;
    }
    if (user.password.length < 8) {
      res.status(400).json({ success: false, message: 'Password must be at least 8 characters long.' });
      return;
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(user.email)) {
      res.status(400).json({ success: false, message: 'Invalid email format.' });
      return;
    }

    // 2. Duplicate Check
    const userQuery = User.findOne({ email: user.email.toLowerCase() });
    if (session) {
      userQuery.session(session);
    }
    const existingUser = await userQuery;

    if (existingUser) {
      res.status(409).json({ success: false, message: 'An account with this email already exists.' });
      return;
    }

    // 3. Organization Slug (Simple unique strategy for MVP)
    const baseSlug = organization.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const slug = `${baseSlug}-${randomSuffix}`;

    // 4. Create Organization
    const newOrganization = new Organization({
      name: organization.name,
      slug: slug,
      industry: organization.industry,
      size: organization.size,
      country: organization.country,
      contactEmail: organization.contactEmail || user.email,
      status: 'active'
    });
    await newOrganization.save(session ? { session } : undefined);

    // 5. Password Hashing
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(user.password, salt);

    // 6. Create Verification OTP
    const rawOtp = crypto.randomInt(0, 1000000).toString().padStart(6, '0');
    const otpHash = crypto.createHash('sha256').update(rawOtp).digest('hex');
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // 7. Create User
    const newUser = new User({
      organizationId: newOrganization._id,
      name: user.name,
      email: user.email.toLowerCase(),
      passwordHash: passwordHash,
      role: 'dpo',
      status: 'active',
      emailVerified: false,
      emailVerificationOtpHash: otpHash,
      emailVerificationOtpExpiresAt: otpExpiresAt,
      emailVerificationAttempts: 0
    });
    await newUser.save(session ? { session } : undefined);

    // 7b. Assign owner to Organization
    newOrganization.ownerId = newUser._id;
    await newOrganization.save(session ? { session } : undefined);

    // 8. Send Email
    try {
      await sendVerificationEmail(newUser.email, rawOtp);
    } catch (emailError) {
      console.error('Failed to send verification email during registration:', emailError);
      // We do not abort the transaction here, so the user is created, but they will need to resend the email
    }

    // 9. Commit Transaction
    if (session) {
      await session.commitTransaction();
      session.endSession();
    }

    // 10. Return Safe Response
    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email for the verification code.',
      data: {
        requiresEmailVerification: true,
        email: newUser.email
      }
    });
  } catch (error) {
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }
    next(error);
  }
};

export const login: RequestHandler = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required.' });
      return;
    }

    const normalizedEmail = email.toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    if (user.status !== 'active') {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    if (!user.emailVerified) {
      res.status(401).json({ success: false, message: 'Please verify your email address before logging in.', unverified: true });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const token = generateToken({
      userId: user._id.toString(),
      organizationId: user.organizationId.toString(),
      role: user.role,
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          organizationId: user.organizationId,
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

import { AuthRequest } from '../middleware/auth';

export const getCurrentUser: RequestHandler = async (req: AuthRequest, res, next) => {
  try {
    if (!req.user || !req.user.userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    if (user.status !== 'active') {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          organizationId: user.organizationId,
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const adminTest: RequestHandler = async (req: AuthRequest, res, next) => {
  res.json({ success: true, message: 'You have accessed an admin-only endpoint.' });
};

export const verifyEmailOtp: RequestHandler = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp || typeof email !== 'string' || typeof otp !== 'string') {
      res.status(400).json({ success: false, message: 'Email and OTP are required.' });
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      res.status(400).json({ success: false, message: 'OTP must be exactly 6 digits.' });
      return;
    }

    const normalizedEmail = email.toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      res.status(400).json({ success: false, message: 'Invalid email or OTP.' });
      return;
    }

    if (user.emailVerified) {
      res.status(400).json({ success: false, message: 'Email is already verified.' });
      return;
    }

    if (!user.emailVerificationOtpExpiresAt || user.emailVerificationOtpExpiresAt < new Date()) {
      res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
      return;
    }

    if ((user.emailVerificationAttempts || 0) >= 5) {
      res.status(429).json({ success: false, message: 'Too many failed attempts. Please request a new OTP.' });
      return;
    }

    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

    if (user.emailVerificationOtpHash !== otpHash) {
      user.emailVerificationAttempts = (user.emailVerificationAttempts || 0) + 1;
      
      // If they just hit the max, invalidate the OTP immediately
      if (user.emailVerificationAttempts >= 5) {
        user.emailVerificationOtpHash = undefined;
        user.emailVerificationOtpExpiresAt = undefined;
      }
      
      await user.save();
      res.status(400).json({ success: false, message: 'Invalid OTP.' });
      return;
    }

    // Success
    user.emailVerified = true;
    user.emailVerificationOtpHash = undefined;
    user.emailVerificationOtpExpiresAt = undefined;
    user.emailVerificationAttempts = 0;
    
    await user.save();

    res.json({ success: true, message: 'Email verified successfully.' });
  } catch (error) {
    next(error);
  }
};

export const resendEmailOtp: RequestHandler = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ success: false, message: 'Email is required.' });
      return;
    }

    const normalizedEmail = email.toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    // Safety: don't reveal if user exists or is verified via success message
    const safeResponse = { success: true, message: 'If an account requires verification, a new verification code has been sent.' };

    if (!user) {
      res.json(safeResponse);
      return;
    }

    if (user.emailVerified) {
      res.json(safeResponse);
      return;
    }
    
    // Cooldown check (e.g. 60 seconds)
    // We could check if expiresAt is > 9 minutes in the future assuming 10 min expiry, 
    // but the easiest is just generating. Let's do a strict 60s cooldown if we have an unexpired OTP.
    if (user.emailVerificationOtpExpiresAt) {
      const msSinceLastOtp = (10 * 60 * 1000) - (user.emailVerificationOtpExpiresAt.getTime() - Date.now());
      if (msSinceLastOtp > 0 && msSinceLastOtp < 60 * 1000) {
        res.status(429).json({ success: false, message: `Please wait before requesting a new code. Try again in ${Math.ceil((60000 - msSinceLastOtp)/1000)}s.` });
        return;
      }
    }

    const rawOtp = crypto.randomInt(0, 1000000).toString().padStart(6, '0');
    const otpHash = crypto.createHash('sha256').update(rawOtp).digest('hex');
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    user.emailVerificationOtpHash = otpHash;
    user.emailVerificationOtpExpiresAt = otpExpiresAt;
    user.emailVerificationAttempts = 0;
    
    await user.save();

    try {
      await sendVerificationEmail(user.email, rawOtp);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
    }

    res.json(safeResponse);
  } catch (error) {
    next(error);
  }
};

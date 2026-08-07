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

    // 6. Create Verification Token
    const rawVerificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenHash = crypto.createHash('sha256').update(rawVerificationToken).digest('hex');
    const verificationExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // 7. Create User
    const newUser = new User({
      organizationId: newOrganization._id,
      name: user.name,
      email: user.email.toLowerCase(),
      passwordHash: passwordHash,
      role: 'dpo',
      status: 'active',
      emailVerified: false,
      emailVerificationTokenHash: verificationTokenHash,
      emailVerificationExpiresAt: verificationExpiresAt
    });
    await newUser.save(session ? { session } : undefined);

    // 8. Send Email
    try {
      await sendVerificationEmail(newUser.email, rawVerificationToken);
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
      message: 'Registration successful. Please check your email to verify your account.',
      data: {
        organization: {
          id: newOrganization._id,
          name: newOrganization.name,
          slug: newOrganization.slug
        },
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role
        }
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

export const verifyEmail: RequestHandler = async (req, res, next) => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      res.status(400).json({ success: false, message: 'Invalid token.' });
      return;
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      emailVerificationTokenHash: tokenHash,
      emailVerificationExpiresAt: { $gt: new Date() }
    });

    if (!user) {
      res.status(400).json({ success: false, message: 'Invalid or expired verification token.' });
      return;
    }

    if (user.emailVerified) {
      res.status(400).json({ success: false, message: 'Email is already verified.' });
      return;
    }

    user.emailVerified = true;
    user.emailVerificationTokenHash = undefined;
    user.emailVerificationExpiresAt = undefined;
    
    await user.save();

    res.json({ success: true, message: 'Email successfully verified.' });
  } catch (error) {
    next(error);
  }
};

export const resendVerification: RequestHandler = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ success: false, message: 'Email is required.' });
      return;
    }

    const normalizedEmail = email.toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      // Safe response
      res.json({ success: true, message: 'If the account requires verification, a verification email has been sent.' });
      return;
    }

    if (user.emailVerified) {
      // Safe response
      res.json({ success: true, message: 'If the account requires verification, a verification email has been sent.' });
      return;
    }

    const rawVerificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenHash = crypto.createHash('sha256').update(rawVerificationToken).digest('hex');
    const verificationExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    user.emailVerificationTokenHash = verificationTokenHash;
    user.emailVerificationExpiresAt = verificationExpiresAt;
    
    await user.save();

    try {
      await sendVerificationEmail(user.email, rawVerificationToken);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
    }

    res.json({ success: true, message: 'If the account requires verification, a verification email has been sent.' });
  } catch (error) {
    next(error);
  }
};

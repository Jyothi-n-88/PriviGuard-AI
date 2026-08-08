import { RequestHandler } from 'express';
import { Organization } from '../models/Organization';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';

export const getMyOrganization: RequestHandler = async (req: AuthRequest, res, next) => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const organization = await Organization.findById(organizationId);
    if (!organization) {
      res.status(404).json({ success: false, message: 'Organization not found' });
      return;
    }

    res.json({
      success: true,
      data: organization
    });
  } catch (error) {
    next(error);
  }
};

export const updateMyOrganization: RequestHandler = async (req: AuthRequest, res, next) => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { name, description, industry, size, country, contactEmail } = req.body;

    const organization = await Organization.findById(organizationId);
    if (!organization) {
      res.status(404).json({ success: false, message: 'Organization not found' });
      return;
    }

    if (name) organization.name = name;
    if (description !== undefined) organization.description = description;
    if (industry !== undefined) organization.industry = industry;
    if (size !== undefined) organization.size = size;
    if (country !== undefined) organization.country = country;
    if (contactEmail !== undefined) organization.contactEmail = contactEmail;

    await organization.save();

    res.json({
      success: true,
      message: 'Organization updated successfully',
      data: organization
    });
  } catch (error) {
    next(error);
  }
};

export const getMyOrganizationMembers: RequestHandler = async (req: AuthRequest, res, next) => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const members = await User.find({ organizationId }).select('-passwordHash -emailVerificationOtpHash');
    
    res.json({
      success: true,
      data: members
    });
  } catch (error) {
    next(error);
  }
};

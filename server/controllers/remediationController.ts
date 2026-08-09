import { RequestHandler } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Remediation } from '../models/Remediation';
import { Assessment } from '../models/Assessment';
import { User } from '../models/User';
import { createAuditLog } from '../services/auditService';

export const createRemediation: RequestHandler = async (req: AuthRequest, res, next) => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const assessmentId = req.params.assessmentId || req.params.id;
    const { title, description, sourceType, sourceReference, priority, dueDate, assignedTo } = req.body;

    const assessment = await Assessment.findOne({ _id: assessmentId, organizationId });
    if (!assessment) {
      res.status(404).json({ success: false, message: 'Assessment not found' });
      return;
    }

    if (assignedTo) {
      const user = await User.findOne({ _id: assignedTo, organizationId });
      if (!user) {
        res.status(400).json({ success: false, message: 'Assignee must belong to your organization' });
        return;
      }
    }

    const remediation = new Remediation({
      organizationId,
      assessmentId,
      title,
      description,
      sourceType,
      sourceReference,
      priority,
      status: 'OPEN',
      assignedTo,
      createdBy: req.user.userId,
      dueDate
    });

    await remediation.save();

    await createAuditLog({
      organizationId,
      assessmentId,
      actorId: req.user.userId,
      actorRole: req.user.role,
      action: 'remediation_created',
      details: { remediationId: remediation._id, title }
    });

    if (assignedTo) {
      await createAuditLog({
        organizationId,
        assessmentId,
        actorId: req.user.userId,
        actorRole: req.user.role,
        action: 'remediation_assigned',
        details: { remediationId: remediation._id, assignedTo }
      });
    }

    res.status(201).json({ success: true, data: remediation });
  } catch (error) {
    next(error);
  }
};

export const getAssessmentRemediations: RequestHandler = async (req: AuthRequest, res, next) => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const assessmentId = req.params.assessmentId || req.params.id;
    
    // Explicitly check assessment ownership although remediation queries enforce org isolation
    const assessment = await Assessment.findOne({ _id: assessmentId, organizationId });
    if (!assessment) {
      res.status(404).json({ success: false, message: 'Assessment not found' });
      return;
    }

    const remediations = await Remediation.find({ organizationId, assessmentId })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('dpoVerifiedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: remediations });
  } catch (error) {
    next(error);
  }
};

export const getRemediations: RequestHandler = async (req: AuthRequest, res, next) => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const remediations = await Remediation.find({ organizationId })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('dpoVerifiedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: remediations });
  } catch (error) {
    next(error);
  }
};

export const getRemediation: RequestHandler = async (req: AuthRequest, res, next) => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const remediation = await Remediation.findOne({ _id: req.params.id, organizationId })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('dpoVerifiedBy', 'name email');

    if (!remediation) {
      res.status(404).json({ success: false, message: 'Remediation not found' });
      return;
    }

    res.json({ success: true, data: remediation });
  } catch (error) {
    next(error);
  }
};

export const updateRemediation: RequestHandler = async (req: AuthRequest, res, next) => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { title, description, priority, dueDate, assignedTo } = req.body;

    const remediation = await Remediation.findOne({ _id: req.params.id, organizationId });
    if (!remediation) {
      res.status(404).json({ success: false, message: 'Remediation not found' });
      return;
    }
    
    // Check assignee org
    if (assignedTo && assignedTo !== remediation.assignedTo?.toString()) {
      const user = await User.findOne({ _id: assignedTo, organizationId });
      if (!user) {
        res.status(400).json({ success: false, message: 'Assignee must belong to your organization' });
        return;
      }
      
      await createAuditLog({
        organizationId,
        assessmentId: remediation.assessmentId,
        actorId: req.user.userId,
        actorRole: req.user.role,
        action: 'remediation_assigned',
        details: { remediationId: remediation._id, assignedTo }
      });
    }

    remediation.title = title !== undefined ? title : remediation.title;
    remediation.description = description !== undefined ? description : remediation.description;
    remediation.priority = priority !== undefined ? priority : remediation.priority;
    remediation.dueDate = dueDate !== undefined ? dueDate : remediation.dueDate;
    remediation.assignedTo = assignedTo !== undefined ? assignedTo : remediation.assignedTo;

    await remediation.save();
    
    await createAuditLog({
      organizationId,
      assessmentId: remediation.assessmentId,
      actorId: req.user.userId,
      actorRole: req.user.role,
      action: 'remediation_updated',
      details: { remediationId: remediation._id }
    });

    const updatedRemediation = await Remediation.findById(remediation._id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('dpoVerifiedBy', 'name email');

    res.json({ success: true, data: updatedRemediation });
  } catch (error) {
    next(error);
  }
};

export const updateRemediationStatus: RequestHandler = async (req: AuthRequest, res, next) => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { status, completionNotes, evidenceRef } = req.body;

    const remediation = await Remediation.findOne({ _id: req.params.id, organizationId });
    if (!remediation) {
      res.status(404).json({ success: false, message: 'Remediation not found' });
      return;
    }

    const oldStatus = remediation.status;
    
    if (status === 'IN_PROGRESS' && oldStatus === 'OPEN') {
      remediation.status = 'IN_PROGRESS';
      
      await createAuditLog({
        organizationId,
        assessmentId: remediation.assessmentId,
        actorId: req.user.userId,
        actorRole: req.user.role,
        action: 'remediation_started',
        details: { remediationId: remediation._id }
      });
    } else if (status === 'COMPLETED' && (oldStatus === 'IN_PROGRESS' || oldStatus === 'OPEN')) {
      if (!completionNotes && !evidenceRef && !remediation.completionNotes && !remediation.evidenceRef) {
        res.status(400).json({ success: false, message: 'Completion notes or evidence reference is required' });
        return;
      }
      
      remediation.status = 'COMPLETED';
      remediation.completionDate = new Date();
      if (completionNotes !== undefined) remediation.completionNotes = completionNotes;
      if (evidenceRef !== undefined) remediation.evidenceRef = evidenceRef;
      
      await createAuditLog({
        organizationId,
        assessmentId: remediation.assessmentId,
        actorId: req.user.userId,
        actorRole: req.user.role,
        action: 'remediation_completed',
        details: { remediationId: remediation._id }
      });
    } else {
      res.status(400).json({ success: false, message: `Invalid status transition from ${oldStatus} to ${status}` });
      return;
    }

    await remediation.save();

    const updatedRemediation = await Remediation.findById(remediation._id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('dpoVerifiedBy', 'name email');

    res.json({ success: true, data: updatedRemediation });
  } catch (error) {
    next(error);
  }
};

export const verifyRemediation: RequestHandler = async (req: AuthRequest, res, next) => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { action, comments } = req.body; // action: 'verify' or 'reopen'

    const remediation = await Remediation.findOne({ _id: req.params.id, organizationId });
    if (!remediation) {
      res.status(404).json({ success: false, message: 'Remediation not found' });
      return;
    }
    
    if (remediation.status !== 'COMPLETED' && remediation.status !== 'DPO_VERIFIED') {
        res.status(400).json({ success: false, message: `Cannot verify or reopen from status ${remediation.status}` });
        return;
    }

    if (action === 'verify') {
      remediation.status = 'CLOSED'; // Transition to closed upon verification
      remediation.dpoVerifiedBy = req.user.userId as any;
      remediation.dpoVerifiedAt = new Date();
      
      await remediation.save();
      
      await createAuditLog({
        organizationId,
        assessmentId: remediation.assessmentId,
        actorId: req.user.userId,
        actorRole: req.user.role,
        action: 'remediation_verified',
        details: { remediationId: remediation._id, comments }
      });
      await createAuditLog({
        organizationId,
        assessmentId: remediation.assessmentId,
        actorId: req.user.userId,
        actorRole: req.user.role,
        action: 'remediation_closed',
        details: { remediationId: remediation._id }
      });
    } else if (action === 'reopen') {
      remediation.status = 'IN_PROGRESS';
      remediation.completionDate = undefined;
      remediation.dpoVerifiedBy = undefined;
      remediation.dpoVerifiedAt = undefined;
      // Option to append comments to completionNotes if we want, but let's leave it out or just log it
      
      await remediation.save();
      
      await createAuditLog({
        organizationId,
        assessmentId: remediation.assessmentId,
        actorId: req.user.userId,
        actorRole: req.user.role,
        action: 'remediation_reopened',
        details: { remediationId: remediation._id, comments }
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid action. Must be verify or reopen' });
      return;
    }

    const updatedRemediation = await Remediation.findById(remediation._id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('dpoVerifiedBy', 'name email');

    res.json({ success: true, data: updatedRemediation });
  } catch (error) {
    next(error);
  }
};

import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IRemediation extends Document {
  organizationId: mongoose.Types.ObjectId;
  assessmentId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  sourceType: 'risk_finding' | 'ai_compliance_gap' | 'dpo_recommendation' | 'other';
  sourceReference?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'DPO_VERIFIED' | 'CLOSED';
  assignedTo?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  dueDate?: Date;
  completionDate?: Date;
  completionNotes?: string;
  evidenceRef?: string;
  dpoVerifiedBy?: mongoose.Types.ObjectId;
  dpoVerifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const remediationSchema: Schema<IRemediation> = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    assessmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Assessment',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    sourceType: {
      type: String,
      enum: ['risk_finding', 'ai_compliance_gap', 'dpo_recommendation', 'other'],
      required: true,
    },
    sourceReference: {
      type: String,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: true,
    },
    status: {
      type: String,
      enum: ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'DPO_VERIFIED', 'CLOSED'],
      default: 'OPEN',
      required: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    dueDate: {
      type: Date,
    },
    completionDate: {
      type: Date,
    },
    completionNotes: {
      type: String,
    },
    evidenceRef: {
      type: String,
    },
    dpoVerifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    dpoVerifiedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

remediationSchema.index({ organizationId: 1, assessmentId: 1 });
remediationSchema.index({ organizationId: 1, assignedTo: 1 });
remediationSchema.index({ organizationId: 1, status: 1 });
remediationSchema.index({ organizationId: 1, dueDate: 1 });

export const Remediation: Model<IRemediation> =
  mongoose.models.Remediation || mongoose.model<IRemediation>('Remediation', remediationSchema);

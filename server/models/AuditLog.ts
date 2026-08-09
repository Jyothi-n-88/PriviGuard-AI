import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IAuditLog extends Document {
  organizationId: mongoose.Types.ObjectId;
  assessmentId: mongoose.Types.ObjectId;
  actorId: mongoose.Types.ObjectId;
  actorRole: string;
  action: 'assessment_created' | 'assessment_updated' | 'risk_recalculated' | 'ai_report_generated' | 'dpo_approved' | 'dpo_rejected' | 'dpo_reassessment_requested' | 'remediation_created' | 'remediation_assigned' | 'remediation_updated' | 'remediation_started' | 'remediation_completed' | 'remediation_verified' | 'remediation_closed' | 'remediation_reopened';
  details?: any;
  createdAt: Date;
  updatedAt: Date;
}

const auditLogSchema: Schema<IAuditLog> = new Schema(
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
    actorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    actorRole: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      enum: ['assessment_created', 'assessment_updated', 'risk_recalculated', 'ai_report_generated', 'dpo_approved', 'dpo_rejected', 'dpo_reassessment_requested', 'remediation_created', 'remediation_assigned', 'remediation_updated', 'remediation_started', 'remediation_completed', 'remediation_verified', 'remediation_closed', 'remediation_reopened'],
      required: true,
    },
    details: {
      type: Schema.Types.Mixed,
    }
  },
  { timestamps: true }
);

export const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', auditLogSchema);

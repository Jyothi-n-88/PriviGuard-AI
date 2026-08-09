import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IAssessmentVersion extends Document {
  organizationId: mongoose.Types.ObjectId;
  assessmentId: mongoose.Types.ObjectId;
  versionNumber: number;
  changedBy: mongoose.Types.ObjectId;
  factualData: any;
  calculatedRiskScore?: number;
  calculatedRiskLevel?: 'low' | 'medium' | 'high' | 'critical';
  createdAt: Date;
  updatedAt: Date;
}

const assessmentVersionSchema: Schema<IAssessmentVersion> = new Schema(
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
    versionNumber: {
      type: Number,
      required: true,
    },
    changedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    factualData: {
      type: Schema.Types.Mixed,
      required: true,
    },
    calculatedRiskScore: {
      type: Number,
    },
    calculatedRiskLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
    },
  },
  { timestamps: true }
);

export const AssessmentVersion: Model<IAssessmentVersion> =
  mongoose.models.AssessmentVersion || mongoose.model<IAssessmentVersion>('AssessmentVersion', assessmentVersionSchema);

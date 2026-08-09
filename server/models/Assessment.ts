import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IAssessment extends Document {
  organizationId: mongoose.Types.ObjectId;
  version: number;
  title: string;
  processingActivity: string;
  purpose: string;
  status: 'draft' | 'in_progress' | 'completed' | 'archived';
  description?: string;
  personalDataCategories?: string[];
  dataSubjects?: string[];
  dataSource?: string;
  storageLocation?: string;
  retentionPeriod?: string;
  thirdPartyProcessors?: string[];
  dataSharing?: string;
  securityMeasures?: string;
  riskLikelihood?: 'low' | 'medium' | 'high';
  riskImpact?: 'low' | 'medium' | 'high';
  calculatedRiskScore?: number;
  calculatedRiskLevel?: 'low' | 'medium' | 'high' | 'critical';
  riskFactors?: string[];
  riskFindings?: {
    category: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    reason: string;
    recommendation: string;
    points?: number;
  }[];
  riskEngineVersion?: string;
  riskCalculatedAt?: Date;
  aiInsights?: string[];
  aiRecommendations?: string[];
  dpoReviewStatus?: 'pending' | 'approved' | 'rejected' | 'reassessed';
  dpoReviewComment?: string;
  dpoReviewedBy?: mongoose.Types.ObjectId;
  dpoReviewedAt?: Date;
  isAiGenerated?: boolean;
  identifiedRisks?: string[];
  mitigationMeasures?: string;
  executiveSummary?: string;
  complianceGaps?: any[];
  riskExplanation?: string;
  aiReportRecommendations?: string[];
  aiReportGeneratedAt?: Date;
  aiReportAssessmentUpdatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const assessmentSchema: Schema<IAssessment> = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization ID is required'],
      index: true,
    },
    version: { type: Number, default: 1 },
    title: { type: String, required: [true, 'Title is required'], trim: true },
    processingActivity: { type: String, required: [true, 'Processing activity is required'], trim: true },
    purpose: { type: String, required: [true, 'Purpose is required'], trim: true },
    status: {
      type: String,
      enum: ['draft', 'in_progress', 'completed', 'archived'],
      default: 'draft',
    },
    description: { type: String, trim: true },
    personalDataCategories: [{ type: String, trim: true }],
    dataSubjects: [{ type: String, trim: true }],
    dataSource: { type: String, trim: true },
    storageLocation: { type: String, trim: true },
    retentionPeriod: { type: String, trim: true },
    thirdPartyProcessors: [{ type: String, trim: true }],
    dataSharing: { type: String, trim: true },
    securityMeasures: { type: String, trim: true },
    riskLikelihood: {
      type: String,
      enum: ['low', 'medium', 'high'],
    },
    riskImpact: {
      type: String,
      enum: ['low', 'medium', 'high'],
    },
    calculatedRiskScore: { type: Number },
    calculatedRiskLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
    },
    riskFactors: [{ type: String, trim: true }],
    riskFindings: [
      {
        category: { type: String },
        severity: { type: String, enum: ['low', 'medium', 'high', 'critical'] },
        title: { type: String },
        reason: { type: String },
        recommendation: { type: String },
        points: { type: Number },
      },
    ],
    riskEngineVersion: { type: String, default: 'rule-v1' },
    riskCalculatedAt: { type: Date },
    aiInsights: [{ type: String }],
    aiRecommendations: [{ type: String }],
    dpoReviewStatus: { 
      type: String, 
      enum: ['pending', 'approved', 'rejected', 'reassessed'], 
      default: 'pending' 
    },
    dpoReviewComment: { type: String },
    dpoReviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    dpoReviewedAt: { type: Date },
    isAiGenerated: { type: Boolean, default: false },
    identifiedRisks: [{ type: String, trim: true }],
    mitigationMeasures: { type: String, trim: true },
    executiveSummary: { type: String },
    complianceGaps: [{ type: Schema.Types.Mixed }],
    riskExplanation: { type: String },
    aiReportRecommendations: [{ type: String }],
    aiReportGeneratedAt: { type: Date },
    aiReportAssessmentUpdatedAt: { type: Date },
  },
  { timestamps: true }
);

export const Assessment: Model<IAssessment> =
  mongoose.models.Assessment || mongoose.model<IAssessment>('Assessment', assessmentSchema);

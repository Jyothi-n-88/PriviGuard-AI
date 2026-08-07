import mongoose, { Document, Schema, Model } from 'mongoose';
import { IOrganization } from './Organization';

export interface IUser extends Document {
  organizationId: mongoose.Types.ObjectId | IOrganization;
  name: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'dpo' | 'privacy_manager' | 'compliance_officer' | 'analyst' | 'viewer';
  status: 'active' | 'inactive';
  emailVerified: boolean;
  emailVerificationTokenHash?: string;
  emailVerificationExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema: Schema<IUser> = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization ID is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
    },
    role: {
      type: String,
      enum: ['admin', 'dpo', 'privacy_manager', 'compliance_officer', 'analyst', 'viewer'],
      required: [true, 'Role is required'],
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    emailVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
    emailVerificationTokenHash: {
      type: String,
    },
    emailVerificationExpiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Mongoose automatically prevents recompilation errors in some environments,
// but it's good practice to check if the model already exists.
export const User: Model<IUser> = 
  mongoose.models.User || mongoose.model<IUser>('User', userSchema);

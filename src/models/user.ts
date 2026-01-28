// models/User.ts
import mongoose, { Model } from 'mongoose';

export interface IUser extends mongoose.Document {
  email: string;
  password: string;
  role: 'user' | 'admin';

  firstName: string;
  lastName: string;
  phone: string;
  address?: string;
  dob: Date;

  companyName?: string;
  occupation?: string;
  workEmail?: string;
  monthlySalary?: number;

  bvn?: string;
  bankName?: string;
  bankCode?: string;
  accountNumber?: string;
  accountName?: string;

  hasAccessedCredit: boolean;
  creditLimit: number;
  availableCredit: number;
  verifiedSalary?: number;
  maxSingleDebit?: number;

  hasMandateCreated: boolean;
  mandateRef?: string;
  mandateToken?: string;
  mandateSubscription_id?: string;
  mandateStatus: 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'INITIATED';
  mandateActivatedAt?: Date;

  phoneVerified: boolean;
  emailVerified: boolean;
  bvnVerified: boolean;

  status:
    | 'pending_phone_verification'
    | 'pending_bvn_verification'
    | 'verified'
    | 'suspended';

  lastLogin?: Date;
  bvnTransactionRef?: number;

  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new mongoose.Schema(
  {
    // Authentication
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },

    // Personal Information
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    address: String,

    // Employment Information
    companyName: String,
    occupation: String,
    workEmail: String,
    monthlySalary: Number, // Self-declared salary

    // Banking Information
    // Masked: 221****5678
    bankName: String,
    bankCode: String, // CBN code e.g., "044"
    accountNumber: String,
    accountName: String, // From statement verification

    bvn: { type: String, unique: true, sparse: true }, // Unique but can be null

    // Credit Information
    hasAccessedCredit: {
      type: Boolean,
      default: false,
    },
    creditLimit: {
      type: Number,
      default: 0,
    },
    availableCredit: {
      type: Number,
      default: 0,
    },
    verifiedSalary: Number, // Verified from bank statement
    maxSingleDebit: Number, // Max amount per debit

    // Mandate Information
    hasMandateCreated: {
      type: Boolean,
      default: false,
    },
    mandateRef: String, // Reference from OnePipe
    mandateToken: String, // Encrypted token for collect operations
    mandateSubscription_id: {type: String},
    mandateStatus: {
      type: String,
      enum: ['PENDING', 'ACTIVE', 'EXPIRED', 'INITIATED'],
      default: 'PENDING',
    },
    mandateActivatedAt: Date,

    // Verification Status
    phoneVerified: {
      type: Boolean,
      default: false,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    bvnVerified: {
      type: Boolean,
      default: false,
    },

    // Account Status
    status: {
      type: String,
      enum: [
        'pending_phone_verification',
        'pending_bvn_verification',
        'verified',
        'suspended',
      ],
      default: 'pending_phone_verification',
    },
    dob: {
      type: Date,
      required: true,
    },

    // Metadata
    lastLogin: Date,
    bvnTransactionRef: Number,

  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  },
);

// Indexes for faster queries
UserSchema.index({ email: 1 });
UserSchema.index({ phone: 1 });
UserSchema.index({ status: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ bvn: 1 });


// Prevent model recompilation in development

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export default User;
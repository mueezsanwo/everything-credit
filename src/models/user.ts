// models/User.ts
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  // Authentication
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true,
    trim: true
  },
  password: { 
    type: String, 
    required: true 
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  
  // Personal Information
  firstName: { 
    type: String, 
    required: true 
  },
  lastName: { 
    type: String, 
    required: true 
  },
  phone: { 
    type: String, 
    required: true, 
    unique: true 
  },
  address: String,
  
  // Employment Information
  companyName: String,
  occupation: String,
  workEmail: String,
  monthlySalary: Number, // Self-declared salary
  
  // Banking Information
  bvn: String, // Masked: 221****5678
  bankName: String,
  bankCode: String, // CBN code e.g., "044"
  accountNumber: String,
  accountName: String, // From statement verification
  
  // Credit Information
  hasAccessedCredit: { 
    type: Boolean, 
    default: false 
  },
  creditLimit: { 
    type: Number, 
    default: 0 
  },
  availableCredit: { 
    type: Number, 
    default: 0 
  },
  verifiedSalary: Number, // Verified from bank statement
  maxSingleDebit: Number, // Max amount per debit
  
  // Mandate Information
  hasMandateCreated: { 
    type: Boolean, 
    default: false 
  },
  mandateRef: String, // Reference from OnePipe
  mandateToken: String, // Encrypted token for collect operations
  mandateStatus: { 
    type: String, 
    enum: ['pending', 'active', 'expired'], 
    default: 'pending' 
  },
  mandateActivatedAt: Date,
  
  // Verification Status
  phoneVerified: { 
    type: Boolean, 
    default: false 
  },
  emailVerified: { 
    type: Boolean, 
    default: false 
  },
  bvnVerified: { 
    type: Boolean, 
    default: false 
  },
  
  // Account Status
  status: { 
    type: String, 
    enum: ['pending_phone_verification', 'pending_bvn_verification', 'verified', 'suspended'],
    default: 'pending_phone_verification'
  },
  
  // Metadata
  lastLogin: Date
}, { 
  timestamps: true // Adds createdAt and updatedAt
});

// Indexes for faster queries
UserSchema.index({ email: 1 });
UserSchema.index({ phone: 1 });
UserSchema.index({ status: 1 });
UserSchema.index({ role: 1 });

// Prevent model recompilation in development
export default mongoose.models.User || mongoose.model('User', UserSchema);
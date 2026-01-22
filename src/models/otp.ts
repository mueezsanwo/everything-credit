// models/OTP.ts
import { IUser } from '@/types';
import mongoose, { Model } from 'mongoose';

export interface IOTP extends mongoose.Document {
  phone: string;
  email?: string;
  otp: string;
  type: 'phone' | 'email' | 'bvn';
  verified: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OTPSchema = new mongoose.Schema({
  phone: { 
    type: String, 
    required: true 
  },
  
  email: String,
  
  otp: { 
    type: String, 
    required: true 
  },
  
  type: { 
    type: String, 
    enum: ['phone', 'email', 'bvn'], 
    required: true 
  },
  
  verified: { 
    type: Boolean, 
    default: false 
  },
  
  expiresAt: { 
    type: Date, 
    required: true 
  }
}, { 
  timestamps: true 
});

// Indexes
OTPSchema.index({ phone: 1, type: 1 });
OTPSchema.index({ email: 1, type: 1 });
OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired OTPs

const Otp: Model<IOTP> =
  mongoose.models.OTP || mongoose.model<IOTP>("Otp", OTPSchema);
export default Otp;

// export default mongoose.models.OTP || mongoose.model('OTP', OTPSchema);
// models/OTP.ts
import mongoose from 'mongoose';

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

export default mongoose.models.OTP || mongoose.model('OTP', OTPSchema);
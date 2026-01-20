// models/Payment.ts
import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
  // Link to Loan or Purchase
  loanId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Loan' 
  },
  
  purchaseId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Purchase' 
  },
  
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  // Payment Details
  paymentNumber: { 
    type: Number, 
    required: true 
  }, // 1, 2, 3... (nth installment)
  
  dueDate: { 
    type: Date, 
    required: true 
  },
  
  amount: { 
    type: Number, 
    required: true 
  }, // In Naira
  
  // Status
  status: { 
    type: String, 
    enum: ['pending', 'paid', 'overdue', 'failed'], 
    default: 'pending' 
  },
  
  // Transaction Details
  paidDate: Date,
  transactionRef: String, // From OnePipe collect
  failureReason: String,
  
  // Retry Logic
  retryCount: { 
    type: Number, 
    default: 0 
  },
  
  lastRetryAt: Date
}, { 
  timestamps: true 
});

// Indexes
PaymentSchema.index({ loanId: 1 });
PaymentSchema.index({ purchaseId: 1 });
PaymentSchema.index({ userId: 1 });
PaymentSchema.index({ dueDate: 1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ dueDate: 1, status: 1 }); // Compound index for cron jobs

export default mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);
// models/Loan.ts
import mongoose from 'mongoose';

const LoanSchema = new mongoose.Schema({
  loanId: { 
    type: String, 
    required: true, 
    unique: true 
  }, // LN1234567890
  
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  type: { 
    type: String, 
    default: 'loan' 
  },
  
  name: { 
    type: String, 
    default: 'Quick Loan' 
  },
  
  // Amounts (in Naira, not kobo)
  amount: { 
    type: Number, 
    required: true 
  },
  
  fee: { 
    type: Number, 
    required: true 
  }, // 5% of amount
  
  totalRepayment: { 
    type: Number, 
    required: true 
  }, // amount + fee
  
  monthlyPayment: { 
    type: Number, 
    required: true 
  }, // Same as totalRepayment for 1-month loans
  
  installments: { 
    type: Number, 
    default: 1 
  },
  
  // Transaction Details
  transactionRef: String, // From OnePipe disburse
  purpose: String, // Optional user input
  
  // Status
  status: { 
    type: String, 
    enum: ['pending', 'active', 'completed', 'defaulted'], 
    default: 'pending' 
  },
  
  // Dates
  disbursedAt: Date,
  dueDate: Date,
  completedAt: Date
}, { 
  timestamps: true 
});

// Indexes
LoanSchema.index({ loanId: 1 });
LoanSchema.index({ userId: 1 });
LoanSchema.index({ status: 1 });
LoanSchema.index({ dueDate: 1 });

export default mongoose.models.Loan || mongoose.model('Loan', LoanSchema);
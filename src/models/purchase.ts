// models/Purchase.ts
import mongoose from 'mongoose';

const PurchaseSchema = new mongoose.Schema({
  purchaseId: { 
    type: String, 
    required: true, 
    unique: true 
  }, // PUR1234567890
  
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  type: { 
    type: String, 
    default: 'purchase' 
  },
  
  // Cart Items
  items: [{
    productId: String,
    name: String,
    price: Number,
    quantity: Number,
    image: String
  }],
  
  // Amounts (in Naira)
  subtotal: { 
    type: Number, 
    required: true 
  },
  
  fee: { 
    type: Number, 
    required: true 
  }, // 3% of subtotal
  
  totalRepayment: { 
    type: Number, 
    required: true 
  }, // subtotal + fee
  
  monthlyPayment: { 
    type: Number, 
    required: true 
  }, // totalRepayment / installments
  
  installments: { 
    type: Number, 
    required: true 
  }, // 1-6 months
  
  // Delivery
  deliveryStatus: { 
    type: String, 
    enum: ['pending_payment', 'in_transit', 'delivered'], 
    default: 'pending_payment' 
  },
  
  deliveryAddress: String,
  deliveredAt: Date,
  
  // Status
  status: { 
    type: String, 
    enum: ['pending', 'active', 'completed', 'defaulted'], 
    default: 'pending' 
  }
}, { 
  timestamps: true 
});

// Indexes
PurchaseSchema.index({ purchaseId: 1 });
PurchaseSchema.index({ userId: 1 });
PurchaseSchema.index({ status: 1 });
PurchaseSchema.index({ deliveryStatus: 1 });

export default mongoose.models.Purchase || mongoose.model('Purchase', PurchaseSchema);
// models/Webhook.ts
import mongoose from 'mongoose';

const WebhookSchema = new mongoose.Schema({
  requestRef: String,
  
  requestType: String,
  
  provider: String,
  
  transactionRef: String,
  
  transactionType: String,
  
  status: String,
  
  amount: Number,
  
  customerRef: String,
  
  payload: mongoose.Schema.Types.Mixed, // Store full webhook payload
  
  processed: { 
    type: Boolean, 
    default: false 
  },
  
  error: String
}, { 
  timestamps: true 
});

// Indexes
WebhookSchema.index({ transactionRef: 1 });
WebhookSchema.index({ requestRef: 1 });
WebhookSchema.index({ processed: 1 });
WebhookSchema.index({ createdAt: -1 });

export default mongoose.models.Webhook || mongoose.model('Webhook', WebhookSchema);
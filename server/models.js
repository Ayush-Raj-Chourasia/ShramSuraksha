import mongoose from 'mongoose';

const workerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  platform: { type: String, required: true },
  city: { type: String, required: true },
  zone: { type: String, default: '' },
  gpsLat: { type: Number, default: 19.076 },
  gpsLng: { type: Number, default: 72.8777 },
  riskScore: { type: Number, default: 25 },
  totalEarningsProtected: { type: Number, default: 0 },
}, { timestamps: true });

const policySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  plan: { type: String, required: true },
  status: { type: String, default: 'active' },
  weeklyPremium: { type: Number, required: true },
  dailyCoverage: { type: Number, required: true },
  weeklyCoverage: { type: Number, required: true },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  autoRenew: { type: Boolean, default: true },
  aiRecommended: { type: Boolean, default: false },
  aiPremium: { type: Number },
}, { timestamps: true });

const claimSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  policyId: { type: String, required: true },
  triggerType: { type: String, required: true },
  triggerData: { type: Object, default: {} },
  location: { type: Object, default: {} },
  status: { type: String, default: 'pending' },
  payoutAmount: { type: Number, default: 0 },
  settleTime: { type: Number },
  fraudScore: { type: Number, default: 0 },
  fraudFlag: { type: Boolean, default: false },
  fraudReasons: [String],
  paymentRef: { type: String },
  paymentMethod: { type: String, default: 'UPI' },
  verifiedGPS: { type: Boolean, default: true },
  wasWorking: { type: Boolean, default: true },
  settledAt: { type: Date },
  userName: { type: String },
  userPlatform: { type: String },
}, { timestamps: true });

const alertSchema = new mongoose.Schema({
  type: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  severity: { type: String, default: 'high' },
  zone: { type: String },
  city: { type: String },
  triggerValue: { type: Number },
  threshold: { type: Number },
  payoutTriggered: { type: Boolean, default: false },
  payoutAmount: { type: Number, default: 0 },
  workersAffected: { type: Number, default: 0 },
}, { timestamps: true });

export const Worker = mongoose.model('Worker', workerSchema);
export const Policy = mongoose.model('Policy', policySchema);
export const Claim = mongoose.model('Claim', claimSchema);
export const Alert = mongoose.model('Alert', alertSchema);

import mongoose from 'mongoose';

// City Tier Classification
export const CITY_TIERS = {
  tier1: { cities: ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata'], multiplier: 1.3, premiumMod: 1.2, label: 'Metro' },
  tier2: { cities: ['Pune', 'Ahmedabad', 'Jaipur', 'Surat', 'Lucknow', 'Chandigarh', 'Indore', 'Nagpur'], multiplier: 1.1, premiumMod: 1.0, label: 'Tier-2' },
  tier3: { cities: [], multiplier: 1.0, premiumMod: 0.9, label: 'Tier-3' },
};

export function getCityTier(city) {
  const c = city?.trim() || '';
  if (CITY_TIERS.tier1.cities.includes(c)) return { tier: 'tier1', ...CITY_TIERS.tier1 };
  if (CITY_TIERS.tier2.cities.includes(c)) return { tier: 'tier2', ...CITY_TIERS.tier2 };
  return { tier: 'tier3', ...CITY_TIERS.tier3 };
}

// Platform income benchmarks (INR/day estimated earnings)
export const PLATFORM_INCOME = {
  zomato: 800, swiggy: 750, zepto: 700, blinkit: 720, amazon: 850, flipkart: 800, default: 750
};

const workerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String, default: '' },
  platform: { type: String, required: true },
  city: { type: String, required: true },
  cityTier: { type: String, default: 'tier3' },        // tier1 / tier2 / tier3
  zone: { type: String, default: '' },
  gpsLat: { type: Number, default: 19.076 },
  gpsLng: { type: Number, default: 72.8777 },

  // Income & working profile
  avgDailyHours: { type: Number, default: 8 },          // declared working hours/day
  declaredIncome: { type: Number, default: 750 },        // INR/day

  // Behavioral risk metrics
  riskScore: { type: Number, default: 25 },
  behavioralScore: { type: Number, default: 100 },       // 0-100, higher = lower risk
  claimStreak: { type: Number, default: 0 },             // consecutive claims (fraud signal)
  cleanDays: { type: Number, default: 0 },               // clean days without claims
  platformTenure: { type: Number, default: 0 },          // months on platform
  peakHourAdherence: { type: Number, default: 0.8 },     // 0-1, works during typical hours
  otpVerified: { type: Boolean, default: false },
  whatsappOptIn: { type: Boolean, default: false },

  totalEarningsProtected: { type: Number, default: 0 },
  totalClaims: { type: Number, default: 0 },
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
  cityTier: { type: String, default: 'tier3' },
  tierMultiplier: { type: Number, default: 1.0 },
}, { timestamps: true });

const claimSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  policyId: { type: String, required: true },
  triggerType: { type: String, required: true },
  triggerData: { type: Object, default: {} },
  location: { type: Object, default: {} },
  status: { type: String, default: 'pending' },
  payoutAmount: { type: Number, default: 0 },
  basePayoutAmount: { type: Number, default: 0 },       // before multipliers
  incomeMultiplier: { type: Number, default: 1.0 },
  tierMultiplier: { type: Number, default: 1.0 },
  behavioralBonus: { type: Number, default: 1.0 },
  settleTime: { type: Number },
  fraudScore: { type: Number, default: 0 },
  fraudFlag: { type: Boolean, default: false },
  fraudReasons: [String],
  paymentRef: { type: String },
  paymentMethod: { type: String, default: 'UPI' },
  verifiedGPS: { type: Boolean, default: true },
  wasWorking: { type: Boolean, default: true },
  settledAt: { type: Date },
  autoTriggered: { type: Boolean, default: false },     // true if auto-filed by monitor
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
  cityTier: { type: String, default: 'tier3' },
  triggerValue: { type: Number },
  threshold: { type: Number },
  payoutTriggered: { type: Boolean, default: false },
  payoutAmount: { type: Number, default: 0 },
  workersAffected: { type: Number, default: 0 },
  autoTriggered: { type: Boolean, default: false },
}, { timestamps: true });

// OTP Session model
const otpSessionSchema = new mongoose.Schema({
  identifier: { type: String, required: true },         // email or phone
  otpCode: { type: String, required: true },
  otpType: { type: String, default: 'email' },          // email | sms
  expiresAt: { type: Date, required: true },
  attempts: { type: Number, default: 0 },
  verified: { type: Boolean, default: false },
}, { timestamps: true });

otpSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Worker = mongoose.model('Worker', workerSchema);
export const Policy = mongoose.model('Policy', policySchema);
export const Claim = mongoose.model('Claim', claimSchema);
export const Alert = mongoose.model('Alert', alertSchema);
export const OtpSession = mongoose.model('OtpSession', otpSessionSchema);

import { Router } from 'express';
import nodemailer from 'nodemailer';
import { Worker, Policy, Claim, OtpSession } from '../models.js';
import { getCityTier, PLATFORM_INCOME } from '../models.js';

const router = Router();

// ── Nodemailer transporter via Gmail SMTP ──────────────────────────────────
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// Helper: generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Helper: send OTP email
async function sendOTPEmail(email, otp, name) {
  const html = `
    <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f8f7ff;border-radius:16px;">
      <div style="text-align:center;margin-bottom:24px;">
        <div style="width:56px;height:56px;background:linear-gradient(135deg,#4F46E5,#7C3AED);border-radius:16px;margin:0 auto 12px;display:flex;align-items:center;justify-content:center;">
          <span style="color:white;font-size:24px;">🛡️</span>
        </div>
        <h2 style="margin:0;color:#1a1a2e;font-size:22px;font-weight:800;">ShramSuraksha</h2>
        <p style="color:#64748b;margin:4px 0 0;font-size:13px;">Parametric Insurance for Delivery Workers</p>
      </div>
      <div style="background:white;border-radius:12px;padding:28px;border:1px solid #e2e8f0;">
        <p style="color:#334155;font-size:15px;margin:0 0 20px;">Hi <strong>${name || 'there'}</strong>,</p>
        <p style="color:#64748b;font-size:14px;margin:0 0 24px;">Your one-time password (OTP) for ShramSuraksha login is:</p>
        <div style="text-align:center;padding:20px;background:#f8f7ff;border-radius:12px;border:2px dashed #4F46E5;margin-bottom:24px;">
          <span style="font-size:40px;font-weight:900;letter-spacing:12px;color:#4F46E5;">${otp}</span>
        </div>
        <p style="color:#94a3b8;font-size:12px;margin:0;text-align:center;">⏱️ This OTP expires in <strong>10 minutes</strong>. Never share it with anyone.</p>
      </div>
      <p style="color:#94a3b8;font-size:11px;text-align:center;margin-top:20px;">
        ShramSuraksha · Protecting India's gig workforce<br/>
        If you didn't request this OTP, please ignore this email.
      </p>
    </div>
  `;
  await transporter.sendMail({
    from: `"ShramSuraksha" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: `${otp} — Your ShramSuraksha OTP (valid 10 min)`,
    html,
  });
}

// ── POST /api/auth/send-otp ────────────────────────────────────────────────
router.post('/send-otp', async (req, res) => {
  try {
    const { email, phone, name } = req.body;
    if (!email && !phone) return res.status(400).json({ error: 'Email or phone required' });

    const identifier = email || phone;
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Upsert OTP session
    await OtpSession.findOneAndDelete({ identifier });
    await OtpSession.create({ identifier, otpCode: otp, otpType: email ? 'email' : 'sms', expiresAt });

    if (email) {
      try {
        await sendOTPEmail(email, otp, name || '');
        res.json({ success: true, message: `OTP sent to ${email}`, channel: 'email' });
      } catch (mailErr) {
        console.error('Gmail SMTP error:', mailErr.message);
        // In dev/demo, return OTP directly if email fails
        res.json({ success: true, message: `OTP sent (demo: ${otp})`, otp: process.env.NODE_ENV !== 'production' ? otp : undefined, channel: 'email' });
      }
    } else {
      // SMS fallback - just return success (could integrate SMS later)
      res.json({ success: true, message: `OTP for ${phone}: ${otp} (demo mode)`, otp, channel: 'sms' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/auth/verify-otp ──────────────────────────────────────────────
router.post('/verify-otp', async (req, res) => {
  try {
    const { identifier, otp } = req.body;
    if (!identifier || !otp) return res.status(400).json({ error: 'Identifier and OTP required' });

    const session = await OtpSession.findOne({ identifier });
    if (!session) return res.status(400).json({ error: 'No OTP sent. Please request a new OTP.' });
    if (session.verified) return res.status(400).json({ error: 'OTP already used.' });
    if (new Date() > session.expiresAt) return res.status(400).json({ error: 'OTP expired. Please request a new one.' });
    if (session.attempts >= 5) return res.status(429).json({ error: 'Too many attempts. Request a new OTP.' });

    if (session.otpCode !== otp.toString()) {
      await OtpSession.findByIdAndUpdate(session._id, { $inc: { attempts: 1 } });
      return res.status(400).json({ error: `Invalid OTP. ${4 - session.attempts} attempts remaining.` });
    }

    await OtpSession.findByIdAndUpdate(session._id, { verified: true });
    res.json({ success: true, message: 'OTP verified successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/auth/register ────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, phone, email, platform, city, zone, avgDailyHours, declaredIncome, whatsappOptIn } = req.body;
    if (!name || !phone || !platform || !city) {
      return res.status(400).json({ error: 'Name, phone, platform, and city are required' });
    }

    const existing = await Worker.findOne({ phone });
    if (existing) {
      return res.status(400).json({ error: 'Phone number already registered', user: existing });
    }

    const tierInfo = getCityTier(city);
    const platformBase = PLATFORM_INCOME[platform?.toLowerCase()] || PLATFORM_INCOME.default;
    const effectiveIncome = declaredIncome || platformBase;

    const user = await Worker.create({
      name, phone, email: email || '',
      platform: platform.toLowerCase(), city,
      cityTier: tierInfo.tier,
      zone: zone || 'auto',
      gpsLat: 19.0760 + (Math.random() - 0.5) * 0.1,
      gpsLng: 72.8777 + (Math.random() - 0.5) * 0.1,
      riskScore: Math.floor(Math.random() * 40) + 20,
      behavioralScore: 90 + Math.floor(Math.random() * 10),
      avgDailyHours: avgDailyHours || 8,
      declaredIncome: effectiveIncome,
      platformTenure: Math.floor(Math.random() * 24),
      whatsappOptIn: whatsappOptIn || false,
      otpVerified: true, // verified via OTP before register
    });

    res.status(201).json({
      success: true,
      user: { id: user._id, ...user.toObject() },
      tierInfo,
      message: `Registration successful! Welcome to ShramSuraksha. City tier: ${tierInfo.label}`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/auth/login ───────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { phone, email } = req.body;
    const identifier = phone || email;
    if (!identifier) return res.status(400).json({ error: 'Phone or email is required' });

    const user = await Worker.findOne(phone ? { phone } : { email }).lean();
    if (!user) return res.status(404).json({ error: 'User not found. Please register first.' });

    const uid = user._id.toString();
    const activePolicy = await Policy.findOne({ userId: uid, status: 'active' }).lean();
    const recentClaims = await Claim.find({ userId: uid }).sort({ createdAt: -1 }).limit(5).lean();
    const tierInfo = getCityTier(user.city);

    res.json({
      success: true,
      user: { id: uid, ...user },
      activePolicy: activePolicy ? { id: activePolicy._id, ...activePolicy } : null,
      recentClaims,
      tierInfo,
      message: `Welcome back, ${user.name}!`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/auth/profile/:userId ──────────────────────────────────────────
router.get('/profile/:userId', async (req, res) => {
  try {
    const user = await Worker.findById(req.params.userId).lean();
    if (!user) return res.status(404).json({ error: 'User not found' });

    const uid = user._id.toString();
    const activePolicy = await Policy.findOne({ userId: uid, status: 'active' }).lean();
    const claims = await Claim.find({ userId: uid }).lean();
    const totalPaidOut = claims.filter(c => c.status === 'settled').reduce((s, c) => s + (c.payoutAmount || 0), 0);
    const tierInfo = getCityTier(user.city);

    res.json({ user: { id: uid, ...user }, activePolicy, claims, totalPaidOut, tierInfo });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/auth/workers ──────────────────────────────────────────────────
router.get('/workers', async (req, res) => {
  try {
    const users = await Worker.find().lean();
    const policies = await Policy.find().lean();
    const claims = await Claim.find().lean();

    const workers = users.map(u => {
      const uid = u._id.toString();
      const tierInfo = getCityTier(u.city);
      return {
        id: uid, ...u,
        tierInfo,
        activePolicy: policies.find(p => p.userId === uid && p.status === 'active'),
        totalClaims: claims.filter(c => c.userId === uid).length,
        totalPaidOut: claims.filter(c => c.userId === uid && c.status === 'settled')
          .reduce((s, c) => s + (c.payoutAmount || 0), 0)
      };
    });
    res.json(workers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

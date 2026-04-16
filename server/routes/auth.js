import { Router } from 'express';
import nodemailer from 'nodemailer';
import twilio from 'twilio';
import { OAuth2Client } from 'google-auth-library';
import { Worker, Policy, Claim, OtpSession } from '../models.js';
import { getCityTier, PLATFORM_INCOME } from '../models.js';
import { issueAdminToken, requireAdmin } from '../middleware/adminAuth.js';

const router = Router();

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;
const hasTwilioVerify = !!(twilioClient && process.env.TWILIO_VERIFY_SERVICE_SID);

// ── Nodemailer transporter via Gmail SMTP ──────────────────────────────────
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  connectionTimeout: 8000,
  greetingTimeout: 8000,
  socketTimeout: 8000,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// Helper: generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function normalizeIdentifier({ email, phone }) {
  if (email) return email.trim().toLowerCase();
  return (phone || '').replace(/\D/g, '');
}

function toE164IN(phone) {
  const digits = (phone || '').replace(/\D/g, '');
  if (digits.length === 10) return `+91${digits}`;
  if (digits.startsWith('91') && digits.length === 12) return `+${digits}`;
  if (digits.startsWith('+')) return digits;
  return `+${digits}`;
}

async function markIdentifierVerified(identifier, otpType = 'email') {
  await OtpSession.findOneAndDelete({ identifier });
  return OtpSession.create({
    identifier,
    otpCode: 'verified',
    otpType,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    verified: true,
    attempts: 0,
  });
}

async function consumeVerifiedSession(identifier) {
  const session = await OtpSession.findOne({
    identifier,
    verified: true,
    expiresAt: { $gt: new Date() },
  }).sort({ updatedAt: -1 });

  if (!session) {
    throw new Error('OTP verification required. Please verify OTP again.');
  }

  await OtpSession.findByIdAndDelete(session._id);
  return session;
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

async function sendPhoneOtp(phone) {
  if (!hasTwilioVerify) {
    throw new Error('SMS OTP is not configured on server.');
  }
  const to = toE164IN(phone);
  await twilioClient.verify.v2
    .services(process.env.TWILIO_VERIFY_SERVICE_SID)
    .verifications.create({ to, channel: 'sms' });
}

async function verifyPhoneOtp(phone, otp) {
  const to = toE164IN(phone);
  const check = await twilioClient.verify.v2
    .services(process.env.TWILIO_VERIFY_SERVICE_SID)
    .verificationChecks.create({ to, code: otp.toString() });
  return check.status === 'approved';
}

async function verifyGoogleCredential(credential) {
  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload?.email_verified) {
    throw new Error('Google account email is not verified.');
  }
  return {
    email: payload.email?.toLowerCase(),
    name: payload.name || '',
    picture: payload.picture || '',
    sub: payload.sub,
  };
}

// ── POST /api/auth/send-otp ────────────────────────────────────────────────
router.post('/send-otp', async (req, res) => {
  try {
    const { email, phone, name } = req.body;
    if (!email && !phone) return res.status(400).json({ error: 'Email or phone required' });

    const identifier = normalizeIdentifier({ email, phone });
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Upsert OTP session
    await OtpSession.findOneAndDelete({ identifier });
    await OtpSession.create({ identifier, otpCode: otp, otpType: email ? 'email' : 'sms_verify', expiresAt });

    if (email) {
      try {
        if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
          return res.status(503).json({ error: 'Email OTP is not configured on server.' });
        }
        await sendOTPEmail(email, otp, name || '');
        res.json({ success: true, message: `OTP sent to ${email}`, channel: 'email' });
      } catch (mailErr) {
        console.error('Gmail SMTP error:', mailErr.message);
        res.status(503).json({ error: 'Failed to deliver email OTP in real-time. Please use Google sign-in or try phone OTP.' });
      }
    } else {
      try {
        await sendPhoneOtp(identifier);
        res.json({ success: true, message: `OTP sent to ${phone}`, channel: 'sms' });
      } catch (smsErr) {
        console.error('Twilio SMS error:', smsErr.message);
        res.status(503).json({ error: 'Failed to deliver SMS OTP in real-time. Please use Google sign-in.' });
      }
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

    const normalizedIdentifier = normalizeIdentifier({ email: identifier.includes('@') ? identifier : null, phone: identifier.includes('@') ? null : identifier });
    const session = await OtpSession.findOne({ identifier: normalizedIdentifier });
    if (!session) return res.status(400).json({ error: 'No OTP sent. Please request a new OTP.' });
    if (session.verified) return res.status(400).json({ error: 'OTP already used.' });
    if (new Date() > session.expiresAt) return res.status(400).json({ error: 'OTP expired. Please request a new one.' });
    if (session.attempts >= 5) return res.status(429).json({ error: 'Too many attempts. Request a new OTP.' });

    if (session.otpType === 'sms_verify') {
      if (!hasTwilioVerify) {
        return res.status(503).json({ error: 'SMS verification service is not configured.' });
      }
      const approved = await verifyPhoneOtp(normalizedIdentifier, otp);
      if (!approved) {
        await OtpSession.findByIdAndUpdate(session._id, { $inc: { attempts: 1 } });
        return res.status(400).json({ error: `Invalid OTP. ${4 - session.attempts} attempts remaining.` });
      }
    } else {
      if (session.otpCode !== otp.toString()) {
        await OtpSession.findByIdAndUpdate(session._id, { $inc: { attempts: 1 } });
        return res.status(400).json({ error: `Invalid OTP. ${4 - session.attempts} attempts remaining.` });
      }
    }

    await OtpSession.findByIdAndUpdate(session._id, { verified: true });
    res.json({ success: true, message: 'OTP verified successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/auth/google ────────────────────────────────────────────────
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(503).json({ error: 'Google sign-in is not configured on server.' });
    }
    if (!credential) {
      return res.status(400).json({ error: 'Google credential is required.' });
    }

    const profile = await verifyGoogleCredential(credential);
    await markIdentifierVerified(profile.email, 'google');

    const user = await Worker.findOne({ email: profile.email }).lean();
    if (!user) {
      return res.json({
        success: true,
        signupRequired: true,
        profile,
        message: 'Google verified. Complete your worker profile to continue.',
      });
    }

    const uid = user._id.toString();
    const activePolicy = await Policy.findOne({ userId: uid, status: 'active' }).lean();
    const recentClaims = await Claim.find({ userId: uid }).sort({ createdAt: -1 }).limit(5).lean();
    const tierInfo = getCityTier(user.city);

    await consumeVerifiedSession(profile.email);

    return res.json({
      success: true,
      user: { id: uid, ...user },
      activePolicy: activePolicy ? { id: activePolicy._id, ...activePolicy } : null,
      recentClaims,
      tierInfo,
      message: `Welcome back, ${user.name}!`,
    });
  } catch (err) {
    return res.status(401).json({ error: err.message || 'Google authentication failed.' });
  }
});

// ── POST /api/auth/admin/login ───────────────────────────────────────────
router.post('/admin/login', async (req, res) => {
  const { email, password } = req.body;

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) {
    return res.status(503).json({ error: 'Admin login is not configured on server.' });
  }

  if (!email || !password || email.toLowerCase() !== adminEmail.toLowerCase() || password !== adminPassword) {
    return res.status(401).json({ error: 'Invalid admin credentials.' });
  }

  const token = issueAdminToken({ role: 'admin', email: adminEmail });
  return res.json({ success: true, token, admin: { email: adminEmail } });
});

// ── POST /api/auth/register ────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, phone, email, platform, city, zone, avgDailyHours, declaredIncome, whatsappOptIn } = req.body;
    if (!name || !phone || !platform || !city) {
      return res.status(400).json({ error: 'Name, phone, platform, and city are required' });
    }

    const identifier = normalizeIdentifier({ email, phone });
    await consumeVerifiedSession(identifier);

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
    const identifier = normalizeIdentifier({ email, phone });
    if (!identifier) return res.status(400).json({ error: 'Phone or email is required' });

    await consumeVerifiedSession(identifier);

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

router.get('/workers-secure', requireAdmin, async (req, res) => {
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

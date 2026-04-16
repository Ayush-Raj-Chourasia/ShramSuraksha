import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Phone, User, MapPin, Truck, ArrowRight, CheckCircle2, Mail, Clock, IndianRupee, Timer, MessageCircle, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { sendOTP, verifyOTP, registerWorker, loginWorker } from '../api';

const PLATFORMS = [
  { id: 'zomato', label: 'Zomato', emoji: '🍕', color: '#E23744', income: 800 },
  { id: 'swiggy', label: 'Swiggy', emoji: '🍔', color: '#FC8019', income: 750 },
  { id: 'zepto', label: 'Zepto', emoji: '⚡', color: '#7B2FF7', income: 700 },
  { id: 'amazon', label: 'Amazon', emoji: '📦', color: '#FF9900', income: 850 },
  { id: 'flipkart', label: 'Flipkart', emoji: '🛒', color: '#2874F0', income: 800 },
  { id: 'blinkit', label: 'Blinkit', emoji: '🛍️', color: '#F8CB46', income: 720 },
];

const CITIES = [
  { name: 'Mumbai', tier: 'Tier-1 Metro', emoji: '🏙️' },
  { name: 'Delhi', tier: 'Tier-1 Metro', emoji: '🏛️' },
  { name: 'Bangalore', tier: 'Tier-1 Metro', emoji: '💻' },
  { name: 'Hyderabad', tier: 'Tier-1 Metro', emoji: '💎' },
  { name: 'Chennai', tier: 'Tier-1 Metro', emoji: '🌊' },
  { name: 'Kolkata', tier: 'Tier-1 Metro', emoji: '🎭' },
  { name: 'Pune', tier: 'Tier-2 City', emoji: '🎓' },
  { name: 'Ahmedabad', tier: 'Tier-2 City', emoji: '🏺' },
  { name: 'Jaipur', tier: 'Tier-2 City', emoji: '🏰' },
  { name: 'Surat', tier: 'Tier-2 City', emoji: '💍' },
  { name: 'Lucknow', tier: 'Tier-2 City', emoji: '🌷' },
  { name: 'Indore', tier: 'Tier-2 City', emoji: '🍜' },
];

// Steps: 'form' → 'otp' → 'done'
export default function AuthPage({ setUser, setPolicy }) {
  const [mode, setMode] = useState('register'); // register | login
  const [step, setStep] = useState('form');     // form | otp | done
  const [loading, setLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [error, setError] = useState('');
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [demoOtp, setDemoOtp] = useState('');
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '', phone: '', email: '', platform: 'zomato', city: 'Mumbai',
    zone: '', avgDailyHours: 8, declaredIncome: 800, whatsappOptIn: true,
  });

  const selectedPlatform = PLATFORMS.find(p => p.id === form.platform);
  const selectedCity = CITIES.find(c => c.name === form.city);

  // ── Step 1: Submit form → send OTP ──────────────────────────────────
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      if (mode === 'register' && !form.name) throw new Error('Name is required');
      if (!form.email && !form.phone) throw new Error('Email or phone is required');

      const res = await sendOTP({ email: form.email, phone: form.phone, name: form.name });
      if (res.data.otp) setDemoOtp(res.data.otp); // development fallback
      setStep('otp');
      startResendCountdown();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to send OTP. Check connection.');
    } finally { setLoading(false); }
  };

  const startResendCountdown = () => {
    setResendCountdown(30);
    const timer = setInterval(() => {
      setResendCountdown(prev => { if (prev <= 1) { clearInterval(timer); return 0; } return prev - 1; });
    }, 1000);
  };

  // ── Step 2: Verify OTP → register/login ─────────────────────────────
  const handleVerifyOTP = async () => {
    const otp = otpValues.join('');
    if (otp.length < 6) { setError('Enter all 6 digits'); return; }
    setError(''); setLoading(true);
    try {
      await verifyOTP({ identifier: form.email || form.phone, otp });

      if (mode === 'register') {
        const res = await registerWorker({ ...form, platform: form.platform.toLowerCase() });
        setUser(res.data.user);
        navigate('/plans');
      } else {
        const res = await loginWorker(form.phone, form.email);
        setUser(res.data.user);
        if (res.data.activePolicy) setPolicy(res.data.activePolicy);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'OTP verification failed');
    } finally { setLoading(false); }
  };

  // ── OTP input handler ────────────────────────────────────────────────
  const handleOtpChange = (index, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otpValues];
    next[index] = val;
    setOtpValues(next);
    if (val && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  // ── OTP Step UI ──────────────────────────────────────────────────────
  if (step === 'otp') {
    return (
      <div style={{ minHeight: 'calc(100vh - 72px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', background: 'linear-gradient(180deg, #F8F7FF 0%, var(--bg-primary) 100%)' }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: 440 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 8px 24px rgba(79,70,229,0.3)' }}>
              <Mail size={30} color="white" />
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>Check Your Email</h1>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              We sent a 6-digit OTP to<br />
              <strong style={{ color: 'var(--primary)' }}>{form.email || form.phone}</strong>
            </p>
          </div>

          <div className="card" style={{ padding: 32 }}>
            {/* OTP boxes */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 24 }}>
              {otpValues.map((v, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  type="text" inputMode="numeric" maxLength={1}
                  value={v}
                  onChange={e => handleOtpChange(i, e.target.value)}
                  onKeyDown={e => handleOtpKeyDown(i, e)}
                  style={{
                    width: 52, height: 60, textAlign: 'center', fontSize: 24, fontWeight: 800,
                    border: `2px solid ${v ? 'var(--primary)' : 'var(--border)'}`,
                    borderRadius: 12, outline: 'none', fontFamily: 'inherit',
                    background: v ? 'var(--primary-bg)' : 'white',
                    color: 'var(--text-primary)', transition: 'all 0.2s ease',
                  }}
                />
              ))}
            </div>

            {error && (
              <div style={{ padding: '12px 16px', borderRadius: 10, background: 'var(--danger-bg)', color: 'var(--danger)', fontSize: 13, fontWeight: 500, marginBottom: 16, border: '1px solid var(--danger-border)', textAlign: 'center' }}>
                {error}
              </div>
            )}

            {demoOtp && (
              <div style={{ padding: '10px 14px', borderRadius: 10, background: '#FFF7ED', color: '#92400E', fontSize: 13, marginBottom: 16, border: '1px solid #FDE68A', textAlign: 'center' }}>
                🧪 Demo mode OTP: <strong style={{ letterSpacing: 4 }}>{demoOtp}</strong>
              </div>
            )}

            <button onClick={handleVerifyOTP} className="btn btn-primary btn-full" disabled={loading || otpValues.join('').length < 6}
              style={{ marginBottom: 16, opacity: loading ? 0.7 : 1 }}>
              {loading ? <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />Verifying...</span>
                : <><CheckCircle2 size={16} /> Verify & {mode === 'register' ? 'Create Account' : 'Login'}</>}
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button onClick={() => { setStep('form'); setOtpValues(['', '', '', '', '', '']); setError(''); }}
                style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4 }}>
                ← Change email
              </button>
              <button onClick={handleSendOTP} disabled={resendCountdown > 0}
                style={{ background: 'none', border: 'none', color: resendCountdown > 0 ? 'var(--text-tertiary)' : 'var(--primary)', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4 }}>
                <RefreshCw size={12} /> {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : 'Resend OTP'}
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: 'var(--text-tertiary)' }}>
            🔒 OTP is verified server-side only. Never shared with third parties.
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Main Form Step ───────────────────────────────────────────────────
  return (
    <div style={{ minHeight: 'calc(100vh - 72px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', background: 'linear-gradient(180deg, #F8F7FF 0%, var(--bg-primary) 100%)' }}>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ width: '100%', maxWidth: 520 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, var(--primary), #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 24px rgba(79,70,229,0.3)' }}>
            <Shield size={28} color="white" />
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.5, marginBottom: 8 }}>
            {mode === 'register' ? 'Join ShramSuraksha' : 'Welcome Back'}
          </h1>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)' }}>
            {mode === 'register' ? 'Income protection tailored to your city & earnings' : 'Login securely with email OTP'}
          </p>
        </div>

        {/* Toggle */}
        <div style={{ display: 'flex', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', padding: 4, marginBottom: 24 }}>
          {['register', 'login'].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(''); }}
              style={{ flex: 1, padding: '10px', borderRadius: 'var(--radius-md)', border: 'none',
                background: mode === m ? 'white' : 'transparent',
                boxShadow: mode === m ? 'var(--shadow-sm)' : 'none',
                fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
                color: mode === m ? 'var(--text-primary)' : 'var(--text-tertiary)', transition: 'all 0.2s ease' }}>
              {m === 'register' ? '🛡️ Sign Up' : '🔑 Login'}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSendOTP} className="card" style={{ padding: 28 }}>

          {mode === 'register' && (
            <div className="form-group">
              <label className="form-label"><User size={14} style={{ marginRight: 6, verticalAlign: -2 }} />Full Name</label>
              <input className="form-input" placeholder="Enter your name" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
          )}

          <div className="form-group">
            <label className="form-label"><Mail size={14} style={{ marginRight: 6, verticalAlign: -2 }} />Email Address <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>(OTP sent here)</span></label>
            <input className="form-input" type="email" placeholder="your@email.com" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>

          <div className="form-group">
            <label className="form-label"><Phone size={14} style={{ marginRight: 6, verticalAlign: -2 }} />Phone Number</label>
            <input className="form-input" type="tel" placeholder="10-digit mobile number" value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })} pattern="[0-9]{10}" />
          </div>

          {mode === 'register' && (
            <>
              {/* Platform */}
              <div className="form-group">
                <label className="form-label"><Truck size={14} style={{ marginRight: 6, verticalAlign: -2 }} />Delivery Platform</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {PLATFORMS.map(p => (
                    <div key={p.id} onClick={() => setForm({ ...form, platform: p.id, declaredIncome: p.income })}
                      style={{ padding: '10px 8px', borderRadius: 'var(--radius-md)', border: `2px solid ${form.platform === p.id ? p.color : 'var(--border)'}`,
                        background: form.platform === p.id ? `${p.color}12` : 'white', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s ease' }}>
                      <div style={{ fontSize: 18, marginBottom: 2 }}>{p.emoji}</div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: form.platform === p.id ? p.color : 'var(--text-secondary)' }}>{p.label}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 1 }}>₹{p.income}/day</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* City */}
              <div className="form-group">
                <label className="form-label"><MapPin size={14} style={{ marginRight: 6, verticalAlign: -2 }} />City</label>
                <select className="form-input form-select" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })}>
                  {CITIES.map(c => (
                    <option key={c.name} value={c.name}>{c.emoji} {c.name} — {c.tier}</option>
                  ))}
                </select>
                {selectedCity && (
                  <div style={{ marginTop: 6, fontSize: 12, color: 'var(--primary)', fontWeight: 500 }}>
                    {selectedCity.tier === 'Tier-1 Metro' ? '📍 Tier-1 Metro — 1.3× payout multiplier' : '📍 Tier-2 City — 1.1× payout multiplier'}
                  </div>
                )}
              </div>

              {/* Income & Hours */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="form-group">
                <div>
                  <label className="form-label"><IndianRupee size={14} style={{ marginRight: 6, verticalAlign: -2 }} />Daily Income (₹)</label>
                  <input className="form-input" type="number" min="200" max="5000" value={form.declaredIncome}
                    onChange={e => setForm({ ...form, declaredIncome: parseInt(e.target.value) || 750 })} />
                </div>
                <div>
                  <label className="form-label"><Clock size={14} style={{ marginRight: 6, verticalAlign: -2 }} />Avg Hours/Day</label>
                  <input className="form-input" type="number" min="2" max="16" value={form.avgDailyHours}
                    onChange={e => setForm({ ...form, avgDailyHours: parseInt(e.target.value) || 8 })} />
                </div>
              </div>

              {/* Payout preview */}
              <div style={{ padding: '12px 16px', borderRadius: 10, background: 'linear-gradient(135deg, rgba(79,70,229,0.06), rgba(124,58,237,0.06))', border: '1px solid rgba(79,70,229,0.15)', marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', letterSpacing: 1, marginBottom: 6 }}>ESTIMATED DAILY PAYOUT</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    ₹{form.declaredIncome} × 50% loss × {selectedCity?.tier === 'Tier-1 Metro' ? '1.3× metro' : '1.1× tier-2'}
                  </span>
                  <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary)' }}>
                    ₹{Math.round(form.declaredIncome * 0.5 * (selectedCity?.tier === 'Tier-1 Metro' ? 1.3 : 1.1))}
                  </span>
                </div>
              </div>

              {/* WhatsApp opt-in */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px', background: '#F0FDF4', borderRadius: 10, border: '1px solid #BBF7D0', marginBottom: 16, cursor: 'pointer' }}
                onClick={() => setForm({ ...form, whatsappOptIn: !form.whatsappOptIn })}>
                <div style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${form.whatsappOptIn ? '#059669' : 'var(--border)'}`, background: form.whatsappOptIn ? '#059669' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                  {form.whatsappOptIn && <CheckCircle2 size={12} color="white" />}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#065F46' }}>📱 WhatsApp Claim Alerts</div>
                  <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                    Get instant claim approvals & auto-trigger alerts on WhatsApp. Send <strong>"join &lt;keyword&gt;"</strong> to +14155238886 to activate.
                  </div>
                </div>
              </div>
            </>
          )}

          {error && (
            <div style={{ padding: '12px 16px', borderRadius: 10, background: 'var(--danger-bg)', color: 'var(--danger)', fontSize: 13, fontWeight: 500, marginBottom: 16, border: '1px solid var(--danger-border)' }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
            {loading
              ? <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />Sending OTP...</span>
              : <><Mail size={16} /> Send OTP to Email <ArrowRight size={16} /></>}
          </button>

          {mode === 'register' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
              {['No documents required', `Income-linked payouts (≈ ₹${Math.round(form.declaredIncome * 0.5 * 1.1)}/claim)`, 'Secure OTP login — no passwords'].map((t, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                  <CheckCircle2 size={14} color="var(--success)" /> {t}
                </div>
              ))}
            </div>
          )}
        </form>

        {/* Demo hint */}
        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--text-tertiary)' }}>
          Demo: use{' '}
          <button onClick={() => setForm({ ...form, email: 'demo@shramsuraksha.app', phone: '9876543210' })} style={{ color: 'var(--primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>
            demo@shramsuraksha.app
          </button>
        </div>
      </motion.div>
    </div>
  );
}

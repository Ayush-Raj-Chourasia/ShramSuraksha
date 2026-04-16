import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Phone, User, MapPin, Truck, ArrowRight, CheckCircle2, Mail, Clock, IndianRupee, MessageCircle, RefreshCw, Globe } from 'lucide-react';
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

const DICT = {
  en: {
    signup: '🛡️ Sign Up', login: '🔑 Login',
    identifierLabel: 'Mobile Number or Email',
    identifierPh: 'Enter 10-digit number or email',
    sendOtp: 'Send OTP', verifying: 'Verifying...',
    checkMail: 'Check Your Email', checkMsg: 'Check Your Messages',
    otpDesc: 'We sent a 6-digit OTP to',
    verifyBtn: 'Verify',
    setupTitle: 'Complete Profile', setupDesc: 'Tell us about your work',
    nameLabel: 'Full Name', namePh: 'Enter your name',
    platformLabel: 'Delivery Platform',
    cityLabel: 'City', detectBtn: '📍 Detect', detecting: 'Locating...',
    incomeLabel: 'Daily Income (₹)', hoursLabel: 'Avg Hours/Day',
    estPayout: 'ESTIMATED DAILY PAYOUT', loss: 'loss',
    waTitle: '📱 WhatsApp Claim Alerts', waDesc: 'Get instant approvals on WhatsApp. Send "join <keyword>" to +14155238886.',
    finish: 'Finish & Create Account',
    demoHint: 'Demo: use demo@shramsuraksha.app'
  },
  hi: {
    signup: '🛡️ साइन अप (Sign Up)', login: '🔑 लॉगिन (Login)',
    identifierLabel: 'फ़ोन नंबर या ईमेल (Mobile/Email)',
    identifierPh: '10-अंकीय नंबर या ईमेल दर्ज करें',
    sendOtp: 'OTP भेजें', verifying: 'सत्यापन हो रहा है...',
    checkMail: 'अपना ईमेल जांचें', checkMsg: 'अपने मैसेज जांचें',
    otpDesc: 'हमने 6-अंकीय OTP यहाँ भेजा है:',
    verifyBtn: 'सत्यापित करें (Verify)',
    setupTitle: 'प्रोफ़ाइल पूरी करें', setupDesc: 'अपने काम के बारे में बताएं',
    nameLabel: 'पूरा नाम', namePh: 'अपना नाम दर्ज करें',
    platformLabel: 'डिलीवरी प्लेटफार्म',
    cityLabel: 'शहर (City)', detectBtn: '📍 ऑटो डिटेक्ट', detecting: 'स्थान खोज रहे...',
    incomeLabel: 'दैनिक आय (₹)', hoursLabel: 'औसत घंटे/दिन',
    estPayout: 'अनुमानित दैनिक भुगतान', loss: 'नुकसान',
    waTitle: '📱 WhatsApp क्लेम अलर्ट (Alerts)', waDesc: 'WhatsApp पर तुरंत अप्रूवल पाएं। +14155238886 पर "join <keyword>" भेजें।',
    finish: 'खाता बनाएं (Finish)',
    demoHint: 'डेमो: demo@shramsuraksha.app का उपयोग करें'
  }
};

export default function AuthPage({ setUser, setPolicy }) {
  const [lang, setLang] = useState('en');
  const t = DICT[lang];

  const [mode, setMode] = useState('register'); // register | login
  const [step, setStep] = useState('auth');     // auth | otp | profile
  const [loading, setLoading] = useState(false);
  const [detectingLoc, setDetectingLoc] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [error, setError] = useState('');
  
  const [identifier, setIdentifier] = useState(''); // single smart field
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '', platform: 'zomato', city: 'Mumbai',
    avgDailyHours: 8, declaredIncome: 800, whatsappOptIn: true,
  });

  const selectedPlatform = PLATFORMS.find(p => p.id === form.platform);
  const selectedCity = CITIES.find(c => c.name === form.city);
  const isEmail = identifier.includes('@');

  // ── Step 1: Send OTP ──────────────────────────────────
  const handleSendOTP = async (e) => {
    e?.preventDefault();
    if (!identifier) { setError('Please enter mobile or email'); return; }
    setError(''); setLoading(true);
    try {
      const payload = isEmail ? { email: identifier } : { phone: identifier };
      const res = await sendOTP(payload);
      setStep('otp');
      startResendCountdown();
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to send OTP.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally { setLoading(false); }
  };

  const startResendCountdown = () => {
    setResendCountdown(30);
    const timer = setInterval(() => {
      setResendCountdown(prev => { if (prev <= 1) { clearInterval(timer); return 0; } return prev - 1; });
    }, 1000);
  };

  // ── Step 2: Verify OTP ─────────────────────────────
  const handleVerifyOTP = async () => {
    const otp = otpValues.join('');
    if (otp.length < 6) { setError('Enter all 6 digits'); return; }
    setError(''); setLoading(true);
    try {
      await verifyOTP({ identifier, otp });

      if (mode === 'register') {
        // Move to progressive profile setup step!
        setStep('profile');
      } else {
        const payload = isEmail ? { email: identifier } : { phone: identifier };
        const res = await loginWorker(payload.phone, payload.email);
        setUser(res.data.user);
        if (res.data.activePolicy) setPolicy(res.data.activePolicy);
        navigate('/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'OTP verification failed';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally { setLoading(false); }
  };

  // ── Step 3: Complete Profile (Register Only) ────────────────────────
  const handleFinishProfile = async (e) => {
    e.preventDefault();
    if (!form.name) { setError('Name is required'); return; }
    setError(''); setLoading(true);
    try {
      const payload = {
        ...form,
        email: isEmail ? identifier : '',
        phone: !isEmail ? identifier : '9999999999', // fallback if they used email
      };
      
      const res = await registerWorker({ ...payload, platform: form.platform.toLowerCase() });
      setUser(res.data.user);
      navigate('/plans');
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Registration failed';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally { setLoading(false); }
  };

  const handleOtpChange = (index, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otpValues];
    next[index] = val;
    setOtpValues(next);
    if (val && index < 5) document.getElementById(`otp-${index + 1}`)?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  // ── GeoLocation Detect ───────────────────────────────────
  const detectLocation = () => {
    setDetectingLoc(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          // Mock geocoding matching:
          setTimeout(() => {
            setForm(f => ({ ...f, city: 'Delhi' })); // For demo, assuming Delhi
            setDetectingLoc(false);
          }, 800);
        },
        (err) => {
          console.error(err);
          setDetectingLoc(false);
          setError("Couldn't exact location. Please select manually.");
        }
      );
    } else {
      setDetectingLoc(false);
    }
  };

  // ── UI Renderers ──────────────────────────────────────────────
  
  const LanguageToggle = () => (
    <div style={{ position: 'absolute', top: 20, right: 20, display: 'flex', gap: 4, background: 'var(--bg-secondary)', padding: 4, borderRadius: 20 }}>
      {['en', 'hi'].map(l => (
        <button key={l} onClick={() => setLang(l)}
          style={{ padding: '4px 12px', border: 'none', borderRadius: 16, fontSize: 13, fontWeight: 600, cursor: 'pointer',
            background: lang === l ? 'var(--primary)' : 'transparent',
            color: lang === l ? 'white' : 'var(--text-secondary)', transition: 'all 0.2s' }}>
          {l === 'en' ? 'A' : 'अ'}
        </button>
      ))}
    </div>
  );

  return (
    <div style={{ minHeight: 'calc(100vh - 72px)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', background: 'var(--bg-primary)' }}>
      <LanguageToggle />
      <AnimatePresence mode="wait">

        {/* STEP 1: AUTHENTICATION */}
        {step === 'auth' && (
          <motion.div key="auth" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ width: '100%', maxWidth: 440 }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, var(--primary), #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 24px rgba(79,70,229,0.3)' }}>
                <Shield size={28} color="white" />
              </div>
              <h1 style={{ fontSize: 26, fontWeight: 800 }}>{mode === 'register' ? 'ShramSuraksha' : t.login}</h1>
            </div>

            <div style={{ display: 'flex', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', padding: 4, marginBottom: 24 }}>
              {['register', 'login'].map(m => (
                <button key={m} onClick={() => { setMode(m); setError(''); }}
                  style={{ flex: 1, padding: '10px', borderRadius: 'var(--radius-md)', border: 'none', background: mode === m ? 'white' : 'transparent', boxShadow: mode === m ? 'var(--shadow-sm)' : 'none', fontWeight: 600, fontSize: 14, cursor: 'pointer', color: mode === m ? 'var(--text-primary)' : 'var(--text-tertiary)', transition: 'all 0.2s' }}>
                  {m === 'register' ? t.signup : t.login}
                </button>
              ))}
            </div>

            <form onSubmit={handleSendOTP} className="card" style={{ padding: 28 }}>
              <div className="form-group">
                <label className="form-label">
                  {isEmail ? <Mail size={14} style={{ marginRight: 6, verticalAlign: -2 }} /> : <Phone size={14} style={{ marginRight: 6, verticalAlign: -2 }} />}
                  {t.identifierLabel}
                </label>
                <input className="form-input" placeholder={t.identifierPh} value={identifier} onChange={e => setIdentifier(e.target.value)} required />
              </div>

              {error && <div style={{ padding: 12, borderRadius: 10, background: 'var(--danger-bg)', color: 'var(--danger)', fontSize: 13, marginBottom: 16 }}>{error}</div>}

              <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                {loading ? <div className="spinner" style={{ width: 18, height: 18 }} /> : (mode === 'register' ? `${t.sendOtp} →` : `${t.login} →`)}
              </button>
            </form>
          </motion.div>
        )}

        {/* STEP 2: OTP VERIFICATION */}
        {step === 'otp' && (
          <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ width: '100%', maxWidth: 440 }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{ width: 64, height: 64, borderRadius: 20, background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                {isEmail ? <Mail size={30} color="white" /> : <MessageCircle size={30} color="white" />}
              </div>
              <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>{isEmail ? t.checkMail : t.checkMsg}</h1>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}> {t.otpDesc} <strong style={{ color: 'var(--primary)' }}>{identifier}</strong></p>
            </div>

            <div className="card" style={{ padding: 32 }}>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 24 }}>
                {otpValues.map((v, i) => (
                  <input key={i} id={`otp-${i}`} type="text" inputMode="numeric" maxLength={1} autoComplete="one-time-code" value={v} onChange={e => handleOtpChange(i, e.target.value)} onKeyDown={e => handleOtpKeyDown(i, e)}
                    style={{ width: 52, height: 60, textAlign: 'center', fontSize: 24, fontWeight: 800, border: `2px solid ${v ? 'var(--primary)' : 'var(--border)'}`, borderRadius: 12, outline: 'none', background: v ? 'var(--primary-bg)' : 'white' }} />
                ))}
              </div>
              {error && <div style={{ padding: 12, borderRadius: 10, background: 'var(--danger-bg)', color: 'var(--danger)', fontSize: 13, marginBottom: 16 }}>{error}</div>}
              
              <button onClick={handleVerifyOTP} className="btn btn-primary btn-full" disabled={loading || otpValues.join('').length < 6} style={{ marginBottom: 16 }}>
                {loading ? <div className="spinner" style={{ width: 18, height: 18 }} /> : <><CheckCircle2 size={16} /> {t.verifyBtn}</>}
              </button>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button onClick={() => { setStep('auth'); setOtpValues(['', '', '', '', '', '']); setError(''); }} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', fontSize: 13 }}>← Back</button>
                <button onClick={handleSendOTP} disabled={resendCountdown > 0} style={{ background: 'none', border: 'none', color: resendCountdown > 0 ? 'var(--text-tertiary)' : 'var(--primary)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                  <RefreshCw size={12} /> {resendCountdown > 0 ? `${resendCountdown}s` : t.sendOtp}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 3: PROFILE SETUP (Registration Only) */}
        {step === 'profile' && (
          <motion.div key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={{ width: '100%', maxWidth: 520 }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>{t.setupTitle}</h1>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{t.setupDesc}</p>
            </div>

            <form onSubmit={handleFinishProfile} className="card" style={{ padding: 28 }}>
              <div className="form-group">
                <label className="form-label"><User size={14} style={{ marginRight: 6 }} />{t.nameLabel}</label>
                <input className="form-input" placeholder={t.namePh} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>

              <div className="form-group">
                <label className="form-label"><Truck size={14} style={{ marginRight: 6 }} />{t.platformLabel}</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {PLATFORMS.map(p => (
                    <div key={p.id} onClick={() => setForm({ ...form, platform: p.id, declaredIncome: p.income })}
                      style={{ padding: '10px 8px', borderRadius: 'var(--radius-md)', border: `2px solid ${form.platform === p.id ? p.color : 'var(--border)'}`, background: form.platform === p.id ? `${p.color}12` : 'white', cursor: 'pointer', textAlign: 'center' }}>
                      <div style={{ fontSize: 18 }}>{p.emoji}</div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: form.platform === p.id ? p.color : 'var(--text-secondary)' }}>{p.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span><MapPin size={14} style={{ marginRight: 6 }} />{t.cityLabel}</span>
                  <button type="button" onClick={detectLocation} style={{ color: 'var(--primary)', fontSize: 12, background: 'none', border:'none', cursor:'pointer', fontWeight: 600 }}>
                    {detectingLoc ? t.detecting : t.detectBtn}
                  </button>
                </label>
                <select className="form-input form-select" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })}>
                  {CITIES.map(c => <option key={c.name} value={c.name}>{c.emoji} {c.name} — {c.tier}</option>)}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="form-group">
                <div>
                  <label className="form-label"><IndianRupee size={14} style={{ marginRight: 6 }} />{t.incomeLabel}</label>
                  <input className="form-input" type="number" min="200" value={form.declaredIncome} onChange={e => setForm({ ...form, declaredIncome: parseInt(e.target.value) || 750 })} />
                </div>
                <div>
                  <label className="form-label"><Clock size={14} style={{ marginRight: 6 }} />{t.hoursLabel}</label>
                  <input className="form-input" type="number" min="2" max="16" value={form.avgDailyHours} onChange={e => setForm({ ...form, avgDailyHours: parseInt(e.target.value) || 8 })} />
                </div>
              </div>

              <div style={{ padding: '12px 16px', borderRadius: 10, background: 'var(--primary-bg)', border: '1px solid var(--border)', marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', letterSpacing: 1, marginBottom: 6 }}>{t.estPayout}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>₹{form.declaredIncome} × 50% {t.loss}</span>
                  <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary)' }}>₹{Math.round(form.declaredIncome * 0.5 * (selectedCity?.tier === 'Tier-1 Metro' ? 1.3 : 1.1))}</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px', background: '#F0FDF4', borderRadius: 10, border: '1px solid #BBF7D0', marginBottom: 16, cursor: 'pointer' }} onClick={() => setForm({ ...form, whatsappOptIn: !form.whatsappOptIn })}>
                <div style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${form.whatsappOptIn ? '#059669' : 'var(--border)'}`, background: form.whatsappOptIn ? '#059669' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {form.whatsappOptIn && <CheckCircle2 size={12} color="white" />}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#065F46' }}>{t.waTitle}</div>
                  <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{t.waDesc}</div>
                </div>
              </div>

              {error && <div style={{ padding: 12, borderRadius: 10, background: 'var(--danger-bg)', color: 'var(--danger)', fontSize: 13, marginBottom: 16 }}>{error}</div>}

              <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                {loading ? <div className="spinner" style={{ width: 18, height: 18 }} /> : t.finish}
              </button>
            </form>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}

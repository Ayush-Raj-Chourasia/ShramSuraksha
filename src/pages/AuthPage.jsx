import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Phone, User, MapPin, Truck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { registerWorker, loginWorker } from '../api';

export default function AuthPage({ setUser, setPolicy }) {
  const [mode, setMode] = useState('register');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', phone: '', platform: 'zomato', city: 'Mumbai', zone: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'register') {
        const res = await registerWorker(form);
        setUser(res.data.user);
        navigate('/plans');
      } else {
        const res = await loginWorker(form.phone);
        setUser(res.data.user);
        if (res.data.activePolicy) setPolicy(res.data.activePolicy);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Connection failed. Please check if the server is running.');
    } finally {
      setLoading(false);
    }
  };

  const platforms = [
    { id: 'zomato', label: 'Zomato', emoji: '🍕', color: '#E23744' },
    { id: 'swiggy', label: 'Swiggy', emoji: '🍔', color: '#FC8019' },
    { id: 'zepto', label: 'Zepto', emoji: '⚡', color: '#7B2FF7' },
    { id: 'amazon', label: 'Amazon', emoji: '📦', color: '#FF9900' },
    { id: 'flipkart', label: 'Flipkart', emoji: '🛒', color: '#2874F0' },
    { id: 'blinkit', label: 'Blinkit', emoji: '🛍️', color: '#F8CB46' },
  ];

  return (
    <div style={{ minHeight: 'calc(100vh - 72px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', background: 'linear-gradient(180deg, #F8F7FF 0%, var(--bg-primary) 100%)' }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ width: '100%', maxWidth: 480 }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, var(--primary), #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 24px rgba(79,70,229,0.3)' }}>
            <Shield size={28} color="white" />
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.5, marginBottom: 8 }}>
            {mode === 'register' ? 'Join ShramSuraksha' : 'Welcome Back'}
          </h1>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)' }}>
            {mode === 'register' ? 'Protect your earnings in 30 seconds' : 'Login with your phone number'}
          </p>
        </div>

        {/* Toggle */}
        <div style={{ display: 'flex', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', padding: 4, marginBottom: 28 }}>
          {['register', 'login'].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(''); }}
              style={{
                flex: 1, padding: '10px', borderRadius: 'var(--radius-md)', border: 'none',
                background: mode === m ? 'white' : 'transparent',
                boxShadow: mode === m ? 'var(--shadow-sm)' : 'none',
                fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
                color: mode === m ? 'var(--text-primary)' : 'var(--text-tertiary)',
                transition: 'all 0.2s ease'
              }}
            >
              {m === 'register' ? 'Sign Up' : 'Login'}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="card" style={{ padding: 28 }}>
          {mode === 'register' && (
            <div className="form-group">
              <label className="form-label"><User size={14} style={{ marginRight: 6, verticalAlign: -2 }} />Full Name</label>
              <input className="form-input" placeholder="Enter your name" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
          )}

          <div className="form-group">
            <label className="form-label"><Phone size={14} style={{ marginRight: 6, verticalAlign: -2 }} />Phone Number</label>
            <input className="form-input" type="tel" placeholder="10-digit mobile number" value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })} required pattern="[0-9]{10}" />
          </div>

          {mode === 'register' && (
            <>
              <div className="form-group">
                <label className="form-label"><Truck size={14} style={{ marginRight: 6, verticalAlign: -2 }} />Delivery Platform</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {platforms.map(p => (
                    <div key={p.id} onClick={() => setForm({ ...form, platform: p.id })}
                      style={{
                        padding: '12px 8px', borderRadius: 'var(--radius-md)', border: `2px solid ${form.platform === p.id ? p.color : 'var(--border)'}`,
                        background: form.platform === p.id ? `${p.color}08` : 'white',
                        cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s ease'
                      }}>
                      <div style={{ fontSize: 20, marginBottom: 4 }}>{p.emoji}</div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: form.platform === p.id ? p.color : 'var(--text-secondary)' }}>{p.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label"><MapPin size={14} style={{ marginRight: 6, verticalAlign: -2 }} />City</label>
                <select className="form-input form-select" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })}>
                  {['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Hyderabad', 'Chennai', 'Kolkata', 'Jaipur', 'Ahmedabad'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {error && (
            <div style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'var(--danger-bg)', color: 'var(--danger)', fontSize: 13, fontWeight: 500, marginBottom: 16, border: '1px solid var(--danger-border)' }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}
            style={{ marginTop: 8, opacity: loading ? 0.7 : 1 }}>
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Processing...
              </span>
            ) : (
              <>{mode === 'register' ? 'Create Account' : 'Login'} <ArrowRight size={16} /></>
            )}
          </button>

          {mode === 'register' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
              {['No documents required', 'Weekly plans from ₹29', 'Instant UPI payouts'].map((t, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                  <CheckCircle2 size={14} color="var(--success)" /> {t}
                </div>
              ))}
            </div>
          )}
        </form>

        {/* Demo login hint */}
        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-tertiary)' }}>
          Demo login: <button onClick={() => { setForm({ ...form, phone: '9876543210' }); setMode('login'); }}
            style={{ color: 'var(--primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 }}>
            Use 9876543210
          </button>
        </div>
      </motion.div>
    </div>
  );
}

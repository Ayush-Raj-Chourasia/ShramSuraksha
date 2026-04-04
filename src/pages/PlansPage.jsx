import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Check, Sparkles, ArrowRight, Zap, Clock, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { activatePolicy, calculatePremium } from '../api';

export default function PlansPage({ user, policy, setPolicy }) {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(1);
  const [loading, setLoading] = useState(false);
  const [aiData, setAiData] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const plans = [
    { id: 0, key: 'basic', price: 29, coverage: 300, weekly: 2100, label: 'Basic', features: ['Income loss cover', 'Weather triggers', 'UPI payout'] },
    { id: 1, key: 'standard', price: 59, coverage: 850, weekly: 5950, label: 'Standard', badge: 'MOST POPULAR', features: ['All Basic features', 'AQI + heat triggers', 'Priority settlement', 'Higher payouts'] },
    { id: 2, key: 'premium', price: 119, coverage: 1800, weekly: 12600, label: 'Premium', features: ['All Standard features', 'All trigger types', 'Instant settlement', 'Maximum payouts', 'Priority support'] },
  ];

  useEffect(() => {
    if (user) loadAiPricing();
  }, [user]);

  const loadAiPricing = async () => {
    setAiLoading(true);
    try {
      const res = await calculatePremium({ platform: user?.platform, city: user?.city, zone: user?.zone });
      setAiData(res.data);
      if (res.data.recommendation === 'basic') setSelected(0);
      else if (res.data.recommendation === 'premium') setSelected(2);
      else setSelected(1);
    } catch (e) { console.error(e); }
    setAiLoading(false);
  };

  const handleActivate = async () => {
    if (!user) { navigate('/auth'); return; }
    setLoading(true);
    try {
      const res = await activatePolicy({ userId: user.id, plan: plans[selected].key, aiPremium: aiData?.adjustedPremium });
      setPolicy(res.data.policy);
      navigate('/dashboard');
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to activate plan');
    }
    setLoading(false);
  };

  return (
    <div className="page">
      <motion.div className="page-header" style={{ textAlign: 'center' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="page-title">Protection Plans</h1>
        <p className="page-desc" style={{ margin: '0 auto' }}>Weekly subscription · Cancel anytime · AI-optimized pricing</p>
      </motion.div>

      {/* AI Recommendation Banner */}
      {aiData && (
        <motion.div className="card" style={{ padding: '16px 20px', display: 'flex', gap: 14, alignItems: 'center', marginBottom: 28, background: 'linear-gradient(135deg, rgba(79,70,229,0.04), rgba(124,58,237,0.04))', borderColor: 'var(--primary-border)' }}
          initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
          <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Sparkles size={20} color="var(--primary)" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', marginBottom: 2 }}>AI Recommendation</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Based on your zone risk ({aiData.riskScore}/100) and weather forecast: <strong>{aiData.recommendation?.toUpperCase()}</strong> plan
              {aiData.discount > 0 && <> with <span style={{ color: 'var(--success)', fontWeight: 700 }}>₹{aiData.discount} discount</span></>}.
              {aiData.weeklyForecast && <> {aiData.weeklyForecast}</>}
            </div>
          </div>
        </motion.div>
      )}

      {/* Plans Grid */}
      <motion.div className="plans-grid" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        {plans.map((p, i) => (
          <div key={p.id}
            className={`card card-interactive plan-card ${selected === p.id ? 'card-selected' : 'card-hover'}`}
            onClick={() => setSelected(p.id)}
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            {p.badge && <div className="plan-badge">{p.badge}</div>}
            {aiData?.recommendation === p.key && !p.badge && <div className="plan-badge" style={{ background: 'linear-gradient(135deg, var(--success), #047857)' }}>AI PICK</div>}

            <div className="plan-name">{p.label}</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 2 }}>
              <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: 6 }}>₹</span>
              <span className="plan-price">
                {aiData?.recommendation === p.key && aiData.adjustedPremium ? aiData.adjustedPremium : p.price}
              </span>
            </div>
            <div className="plan-period">/week</div>
            {aiData?.recommendation === p.key && aiData.discount > 0 && (
              <div style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600, marginTop: 4 }}>
                <s style={{ color: 'var(--text-tertiary)' }}>₹{p.price}</s> Save ₹{aiData.discount}
              </div>
            )}

            <div className="plan-divider" />

            <div className="plan-coverage">₹{p.coverage}</div>
            <div className="plan-coverage-label">daily coverage</div>

            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'left' }}>
              {p.features.map((f, j) => (
                <div key={j} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12, color: 'var(--text-secondary)' }}>
                  <Check size={12} color="var(--success)" /> {f}
                </div>
              ))}
            </div>
          </div>
        ))}
      </motion.div>

      {/* AutoPay Toggle */}
      <motion.div className="card" style={{ padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, maxWidth: 900, margin: '24px auto 0' }}
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>AutoPay</div>
          <div style={{ fontSize: 13, color: 'var(--text-tertiary)', marginTop: 2 }}>Auto-renew weekly for uninterrupted coverage</div>
        </div>
        <div style={{ width: 44, height: 24, borderRadius: 100, background: 'var(--primary)', cursor: 'pointer', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 2, left: 22, width: 20, height: 20, borderRadius: '50%', background: 'white', transition: 'left 0.2s ease' }} />
        </div>
      </motion.div>

      {/* Features List */}
      <motion.div className="card" style={{ padding: 24, marginTop: 16, maxWidth: 900, margin: '16px auto 0' }}
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: 'var(--text-tertiary)', marginBottom: 16, textTransform: 'uppercase' }}>All Plans Include</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          {[
            { icon: <Zap size={14} />, text: 'Parametric — no paperwork' },
            { icon: <Shield size={14} />, text: 'IMD + CPCB verified data' },
            { icon: <Clock size={14} />, text: 'UPI payout < 90 seconds' },
            { icon: <FileText size={14} />, text: 'Cancel anytime, no lock-in' },
          ].map((f, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 13, color: 'var(--text-secondary)' }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)', flexShrink: 0 }}>{f.icon}</div>
              {f.text}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Activate Button */}
      <motion.div style={{ maxWidth: 900, margin: '24px auto 0' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <button className="btn btn-primary btn-full btn-lg" onClick={handleActivate} disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Activating...' : <><Shield size={18} /> Activate ₹{aiData?.recommendation === plans[selected].key && aiData?.adjustedPremium ? aiData.adjustedPremium : plans[selected].price}/week {plans[selected].label} Plan <ArrowRight size={16} /></>}
        </button>
      </motion.div>
    </div>
  );
}

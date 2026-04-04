import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Zap, CloudRain, Wind, Thermometer, ArrowRight, CheckCircle2, Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { getWeather, getAQI, getUserClaims } from '../api';

export default function Dashboard({ user, policy, setPolicy }) {
  const navigate = useNavigate();
  const [weather, setWeather] = useState(null);
  const [aqi, setAqi] = useState(null);
  const [claims, setClaims] = useState([]);

  useEffect(() => {
    if (!user) { navigate('/auth'); return; }
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const [w, a, c] = await Promise.allSettled([
        getWeather(user.city || 'Mumbai'),
        getAQI(user.city || 'Mumbai'),
        getUserClaims(user.id)
      ]);
      if (w.status === 'fulfilled') setWeather(w.value.data);
      if (a.status === 'fulfilled') setAqi(a.value.data);
      if (c.status === 'fulfilled') setClaims(c.value.data);
    } catch (e) { console.error(e); }
  };

  if (!user) return null;

  const totalPaidOut = claims.filter(c => c.status === 'settled').reduce((s, c) => s + (c.payoutAmount || 0), 0);
  const daysProtected = policy ? Math.ceil((Date.now() - new Date(policy.startDate).getTime()) / 86400000) : 0;

  return (
    <div className="page">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <p style={{ fontSize: 13, color: 'var(--text-tertiary)', fontWeight: 600, letterSpacing: 0.5, marginBottom: 8 }}>
              GOOD {new Date().getHours() < 12 ? 'MORNING' : new Date().getHours() < 17 ? 'AFTERNOON' : 'EVENING'}, {user.name?.split(' ')[0]?.toUpperCase()} 👋
            </p>
            <h1 className="page-title" style={{ fontSize: 32 }}>
              You're {policy ? <span style={{ color: 'var(--success)' }}>Protected</span> : <span style={{ color: 'var(--danger)' }}>Unprotected</span>} Today
            </h1>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
            {policy ? (
              <span className="badge badge-success"><span className="badge-dot" style={{ background: 'var(--success)' }} /> Active Coverage</span>
            ) : (
              <span className="badge badge-danger"><span className="badge-dot" style={{ background: 'var(--danger)' }} /> No Coverage</span>
            )}
            <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Zone {user.zone} · {user.city}</span>
          </div>
        </div>
      </motion.div>

      {/* Hero Coverage Card */}
      <motion.div className="card" style={{ padding: 28, marginTop: 24, background: policy ? 'linear-gradient(135deg, rgba(5,150,105,0.03), rgba(79,70,229,0.03))' : 'white' }}
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: 'var(--text-tertiary)', marginBottom: 12 }}>
              {policy ? "TODAY'S COVERAGE" : 'NO ACTIVE PLAN'}
            </p>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <span style={{ fontSize: 20, color: 'var(--primary)', fontWeight: 700, marginBottom: 8, marginRight: 4 }}>₹</span>
              <span style={{ fontSize: 56, fontWeight: 800, letterSpacing: -2, lineHeight: 1, color: 'var(--text-primary)' }}>
                {policy ? policy.dailyCoverage : '0'}
              </span>
              <span style={{ fontSize: 14, color: 'var(--text-tertiary)', fontWeight: 500, marginBottom: 8, marginLeft: 6 }}>/day</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: policy ? 'var(--success-bg)' : 'var(--danger-bg)', border: `1px solid ${policy ? 'var(--success-border)' : 'var(--danger-border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={24} color={policy ? 'var(--success)' : 'var(--danger)'} />
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, color: policy ? 'var(--success)' : 'var(--danger)', letterSpacing: 0.5 }}>
              {policy ? 'ACTIVE' : 'INACTIVE'}
            </span>
          </div>
        </div>

        {/* Risk gauge */}
        {policy && (
          <div style={{ marginTop: 24, marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>Risk Level</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: user.riskScore < 40 ? 'var(--success)' : user.riskScore < 70 ? 'var(--warning)' : 'var(--danger)' }}>
                {user.riskScore < 40 ? 'Low' : user.riskScore < 70 ? 'Medium' : 'High'} Risk
              </span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${user.riskScore}%`, background: user.riskScore < 40 ? 'var(--success)' : user.riskScore < 70 ? 'var(--warning)' : 'var(--danger)' }} />
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid-3">
          <div style={{ padding: '14px 8px', textAlign: 'center', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary)' }}>{daysProtected}</div>
            <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 4, fontWeight: 600 }}>Days Protected</div>
          </div>
          <div style={{ padding: '14px 8px', textAlign: 'center', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--success)' }}>₹{totalPaidOut}</div>
            <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 4, fontWeight: 600 }}>Total Payouts</div>
          </div>
          <div style={{ padding: '14px 8px', textAlign: 'center', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#8B5CF6' }}>87s</div>
            <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 4, fontWeight: 600 }}>Avg Settle</div>
          </div>
        </div>
      </motion.div>

      {/* CTAs */}
      <motion.div style={{ display: 'flex', gap: 12, marginTop: 20 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        {!policy ? (
          <Link to="/plans" className="btn btn-primary btn-full">🛡️ Get Protected Now <ArrowRight size={16} /></Link>
        ) : (
          <>
            <Link to="/claims" className="btn btn-primary" style={{ flex: 1 }}>⚡ File a Claim</Link>
            <Link to="/plans" className="btn btn-secondary" style={{ flex: 1 }}>🛡️ Change Plan</Link>
          </>
        )}
      </motion.div>

      {/* Weather & Conditions */}
      <motion.div style={{ marginTop: 28 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: 'var(--text-tertiary)', marginBottom: 12, textTransform: 'uppercase' }}>
          Today's Conditions
        </p>
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
          {weather && (
            <>
              <div className={`chip ${weather.temp > 40 ? 'chip-danger' : 'chip-primary'}`}>
                <Thermometer size={12} /> {weather.temp}°C
              </div>
              <div className="chip chip-primary"><Wind size={12} /> {weather.windSpeed} km/h</div>
              {weather.rain1h > 0 && <div className="chip chip-warning"><CloudRain size={12} /> {weather.rain1h}mm/hr</div>}
            </>
          )}
          {aqi && (
            <div className={`chip ${aqi.aqi > 200 ? 'chip-danger' : aqi.aqi > 100 ? 'chip-warning' : 'chip-success'}`}>
              🌫️ AQI: {aqi.aqi}
            </div>
          )}
          <div className="chip chip-success"><CheckCircle2 size={12} /> Zone {user.zone}</div>
        </div>
      </motion.div>

      {/* Recent Claims */}
      {claims.length > 0 && (
        <motion.div style={{ marginTop: 28 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Recent Claims</p>
            <Link to="/claims" style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>View All →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {claims.slice(0, 3).map((c, i) => (
              <div key={i} className="card" style={{ padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: c.status === 'settled' ? 'var(--success-bg)' : 'var(--warning-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {c.status === 'settled' ? <CheckCircle2 size={18} color="var(--success)" /> : <Clock size={18} color="var(--warning)" />}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{c.triggerType?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>
                      {new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {c.settleTime ? `${c.settleTime}s` : 'Pending'}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: c.status === 'settled' ? 'var(--success)' : 'var(--text-secondary)' }}>₹{c.payoutAmount}</div>
                  <span className={`badge ${c.status === 'settled' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: 10 }}>
                    {c.status === 'settled' ? '✓ Credited' : '⏳ Pending'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Trust Metrics */}
      <motion.div className="card" style={{ padding: '24px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 28, background: 'var(--bg-secondary)', border: 'none' }}
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        {[
          { val: '₹12.4L', label: 'Paid This Week', color: 'var(--primary)' },
          { val: '98%', label: 'Claims < 90s', color: 'var(--success)' },
          { val: '4,821', label: 'Workers Safe', color: '#8B5CF6' },
        ].map((t, i, arr) => (
          <div key={i} style={{ textAlign: 'center', flex: 1, borderRight: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: t.color }}>{t.val}</div>
            <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 4, fontWeight: 600 }}>{t.label}</div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

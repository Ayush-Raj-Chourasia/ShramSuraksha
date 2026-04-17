import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Zap, CloudRain, Wind, Thermometer, ArrowRight, CheckCircle2, Clock, TrendingUp, AlertTriangle, Star, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { getWeather, getAQI, getUserClaims, getBehavioralScore, getProfile, getPublicMetrics, getHealth } from '../api';

const CITY_TIER_INFO = {
  tier1: { label: 'Metro', multiplier: 1.3, color: '#4F46E5', bg: 'rgba(79,70,229,0.08)' },
  tier2: { label: 'Tier-2', multiplier: 1.1, color: '#0D9488', bg: 'rgba(13,148,136,0.08)' },
  tier3: { label: 'Tier-3', multiplier: 1.0, color: '#64748B', bg: 'rgba(100,116,139,0.08)' },
};

export default function Dashboard({ user, policy, setPolicy }) {
  const navigate = useNavigate();
  const [weather, setWeather] = useState(null);
  const [aqi, setAqi] = useState(null);
  const [claims, setClaims] = useState([]);
  const [behavioral, setBehavioral] = useState(null);
  const [liveUser, setLiveUser] = useState(null);
  const [platformMetrics, setPlatformMetrics] = useState(null);
  const [healthSummary, setHealthSummary] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    let active = true;

    const loadData = async () => {
      try {
        const [profileRes, claimsRes, behavioralRes, weatherRes, aqiRes, metricsRes, healthRes] = await Promise.allSettled([
          getProfile(user.id),
          getUserClaims(user.id),
          getBehavioralScore(user.id),
          getWeather((liveUser || user).city || 'Mumbai'),
          getAQI((liveUser || user).city || 'Mumbai'),
          getPublicMetrics(),
          getHealth(),
        ]);

        if (!active) return;

        if (profileRes.status === 'fulfilled') {
          setLiveUser(profileRes.value.data.user);
          if (profileRes.value.data.activePolicy) {
            setPolicy(profileRes.value.data.activePolicy);
          }
        }
        if (claimsRes.status === 'fulfilled') setClaims(claimsRes.value.data);
        if (behavioralRes.status === 'fulfilled') setBehavioral(behavioralRes.value.data);
        if (weatherRes.status === 'fulfilled') setWeather(weatherRes.value.data);
        if (aqiRes.status === 'fulfilled') setAqi(aqiRes.value.data);
        if (metricsRes.status === 'fulfilled') setPlatformMetrics(metricsRes.value.data);
        if (healthRes.status === 'fulfilled') setHealthSummary(healthRes.value.data);
      } catch (e) {
        console.error(e);
      }
    };

    loadData();
    const poll = setInterval(loadData, 30000);
    return () => {
      active = false;
      clearInterval(poll);
    };
  }, [user, navigate, setPolicy]);

  const activeUser = liveUser || user;
  if (!activeUser) return null;

  const totalPaidOut = claims.filter(c => c.status === 'settled').reduce((s, c) => s + (c.payoutAmount || 0), 0);
  const daysProtected = policy ? Math.ceil((Date.now() - new Date(policy.startDate).getTime()) / 86400000) : 0;
  const autoTriggered = claims.filter(c => c.autoTriggered).length;

  const tierKey = activeUser.cityTier || 'tier3';
  const tierInfo = CITY_TIER_INFO[tierKey] || CITY_TIER_INFO.tier3;
  const behScore = behavioral?.behavioralScore || activeUser.behavioralScore || 80;
  const behavBonus = behScore >= 90 ? '20%' : behScore >= 75 ? '10%' : '0%';
  const estimatedPayout = behavioral?.estimatedDailyPayout || Math.round((activeUser.declaredIncome || 750) * 0.5 * tierInfo.multiplier);
  const formatCompactInr = (value = 0) => {
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
    return `₹${value}`;
  };

  return (
    <div className="page">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <p style={{ fontSize: 13, color: 'var(--text-tertiary)', fontWeight: 600, letterSpacing: 0.5, marginBottom: 8 }}>
              GOOD {new Date().getHours() < 12 ? 'MORNING' : new Date().getHours() < 17 ? 'AFTERNOON' : 'EVENING'}, {activeUser.name?.split(' ')[0]?.toUpperCase()} 👋
            </p>
            <h1 className="page-title" style={{ fontSize: 32 }}>
              You're {policy ? <span style={{ color: 'var(--success)' }}>Protected</span> : <span style={{ color: 'var(--danger)' }}>Unprotected</span>} Today
            </h1>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
            {policy
              ? <span className="badge badge-success"><span className="badge-dot" style={{ background: 'var(--success)' }} /> Active Coverage</span>
              : <span className="badge badge-danger"><span className="badge-dot" style={{ background: 'var(--danger)' }} /> No Coverage</span>}
            {/* City Tier Badge */}
            <span style={{ fontSize: 12, padding: '2px 10px', borderRadius: 20, background: tierInfo.bg, color: tierInfo.color, fontWeight: 600 }}>
              📍 {activeUser.city} · {tierInfo.label} · {tierInfo.multiplier}× payout
            </span>
          </div>
        </div>
      </motion.div>

      {/* Income-linked coverage card */}
      <motion.div className="card" style={{ padding: 28, marginTop: 24, background: policy ? 'linear-gradient(135deg, rgba(5,150,105,0.03), rgba(79,70,229,0.03))' : 'white' }}
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: 'var(--text-tertiary)', marginBottom: 12 }}>
              {policy ? "INCOME PROTECTION TODAY" : 'NO ACTIVE PLAN'}
            </p>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <span style={{ fontSize: 20, color: 'var(--primary)', fontWeight: 700, marginBottom: 8, marginRight: 4 }}>₹</span>
              <span style={{ fontSize: 56, fontWeight: 800, letterSpacing: -2, lineHeight: 1, color: 'var(--text-primary)' }}>
                {policy ? estimatedPayout : '0'}
              </span>
              <span style={{ fontSize: 14, color: 'var(--text-tertiary)', fontWeight: 500, marginBottom: 8, marginLeft: 6 }}>/event</span>
            </div>
            {policy && (
              <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-tertiary)' }}>
                ₹{activeUser.declaredIncome || 750}/day income × 50% loss × {tierInfo.multiplier}× {tierInfo.label} × {behavBonus} behavioral bonus
              </div>
            )}
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

        {/* Behavioral + Risk Gauges */}
        {policy && (
          <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>Risk Level</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: activeUser.riskScore < 40 ? 'var(--success)' : activeUser.riskScore < 70 ? 'var(--warning)' : 'var(--danger)' }}>
                  {activeUser.riskScore < 40 ? 'Low' : activeUser.riskScore < 70 ? 'Medium' : 'High'}
                </span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${activeUser.riskScore || 30}%`, background: activeUser.riskScore < 40 ? 'var(--success)' : activeUser.riskScore < 70 ? 'var(--warning)' : 'var(--danger)' }} />
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>Behavioral Score</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: behScore >= 90 ? 'var(--success)' : behScore >= 75 ? 'var(--primary)' : 'var(--warning)' }}>
                  {behScore}/100 (+{behavBonus})
                </span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${behScore}%`, background: behScore >= 90 ? 'var(--success)' : behScore >= 75 ? 'var(--primary)' : 'var(--warning)' }} />
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid-3" style={{ marginTop: 24 }}>
          {[
            { val: daysProtected, label: 'Days Protected', color: 'var(--primary)' },
            { val: `₹${totalPaidOut}`, label: 'Total Payouts', color: 'var(--success)' },
            { val: autoTriggered, label: 'Auto-Claims', color: '#8B5CF6' },
          ].map((s, i) => (
            <div key={i} style={{ padding: '14px 8px', textAlign: 'center', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.val}</div>
              <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 4, fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Behavioral Tips */}
      {behavioral?.tips?.length > 0 && (
        <motion.div className="card" style={{ padding: 20, marginTop: 16, background: 'linear-gradient(135deg, rgba(79,70,229,0.04), rgba(124,58,237,0.04))', border: '1px solid rgba(79,70,229,0.15)' }}
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, color: 'var(--primary)', marginBottom: 10 }}>🧠 BEHAVIORAL RISK INSIGHTS</div>
          {behavioral.tips.map((tip, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: 'var(--text-secondary)', marginBottom: i < behavioral.tips.length - 1 ? 8 : 0 }}>
              <span style={{ color: 'var(--primary)', marginTop: 1 }}>→</span> {tip}
            </div>
          ))}
        </motion.div>
      )}

      {/* CTAs */}
      <motion.div style={{ display: 'flex', gap: 12, marginTop: 20 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        {!policy
          ? <Link to="/plans" className="btn btn-primary btn-full">🛡️ Get Protected Now <ArrowRight size={16} /></Link>
          : <>
            <Link to="/claims" className="btn btn-primary" style={{ flex: 1 }}>⚡ File a Claim</Link>
            <Link to="/plans" className="btn btn-secondary" style={{ flex: 1 }}>🛡️ Change Plan</Link>
          </>}
      </motion.div>

      {/* Weather & Conditions */}
      <motion.div style={{ marginTop: 28 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: 'var(--text-tertiary)', marginBottom: 12, textTransform: 'uppercase' }}>Today's Conditions</p>
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
          {weather && (
            <>
              <div className={`chip ${weather.temp > 40 ? 'chip-danger' : 'chip-primary'}`}><Thermometer size={12} /> {weather.temp}°C</div>
              <div className="chip chip-primary"><Wind size={12} /> {weather.windSpeed} km/h</div>
              {weather.rain1h > 0 && <div className="chip chip-warning"><CloudRain size={12} /> {weather.rain1h}mm/hr</div>}
            </>
          )}
          {aqi && (
            <div className={`chip ${aqi.aqi > 200 ? 'chip-danger' : aqi.aqi > 100 ? 'chip-warning' : 'chip-success'}`}>
              🌫️ AQI: {aqi.aqi}
            </div>
          )}
          <div className="chip chip-success"><CheckCircle2 size={12} /> Zone {activeUser.zone || 'A'}</div>
          <div className="chip" style={{ background: tierInfo.bg, color: tierInfo.color }}>📍 {tierInfo.label}</div>
        </div>
      </motion.div>

      {/* Recent Claims */}
      {claims.length > 0 && (
        <motion.div style={{ marginTop: 28 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: 'var(--text-tertiary)' }}>RECENT CLAIMS</p>
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
                    <div style={{ fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                      {c.triggerType?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      {c.autoTriggered && <span style={{ fontSize: 9, background: '#8B5CF6', color: 'white', padding: '1px 6px', borderRadius: 20, fontWeight: 700 }}>AUTO</span>}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>
                      {new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {c.settleTime ? `${c.settleTime}s` : 'Pending'}
                      {c.tierMultiplier && c.tierMultiplier > 1 && <span style={{ color: 'var(--primary)', marginLeft: 6 }}>+{Math.round((c.tierMultiplier - 1) * 100)}% metro</span>}
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
          { val: formatCompactInr(platformMetrics?.paidThisWeek || 0), label: 'Paid This Week', color: 'var(--primary)' },
          { val: `${platformMetrics?.claimsUnder90Pct ?? 0}%`, label: 'Claims < 90s', color: 'var(--success)' },
          { val: (platformMetrics?.workersSafe ?? healthSummary?.workers ?? 0).toLocaleString('en-IN'), label: 'Workers Safe', color: '#8B5CF6' },
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

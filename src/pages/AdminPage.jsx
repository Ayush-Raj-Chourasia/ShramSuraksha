import { useState, useEffect } from 'react';
import { BarChart3, Users, Shield, AlertTriangle, TrendingUp, Brain, FileText, Clock, Activity, Zap, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { getStats, getAllClaims, getAllWorkers, riskAssessment, getCityTierBreakdown, getMonitorStatus, getLogs, adminLogin, getClaimAnalytics } from '../api';

const TIER_COLORS = { tier1: '#4F46E5', tier2: '#0D9488', tier3: '#64748B' };
const TIER_LABELS = { tier1: 'Metro (Tier-1)', tier2: 'Tier-2 City', tier3: 'Tier-3 / Other' };

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('shram_admin_token'));
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('shram_admin_token') || '');
  const [adminEmail, setAdminEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const [stats, setStats] = useState(null);
  const [claims, setClaims] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [aiInsight, setAiInsight] = useState(null);
  const [tierBreakdown, setTierBreakdown] = useState(null);
  const [monitorStatus, setMonitorStatus] = useState(null);
  const [activityLogs, setActivityLogs] = useState([]);
  const [logSummary, setLogSummary] = useState(null);
  const [claimAnalytics, setClaimAnalytics] = useState([]);
  const [logFilter, setLogFilter] = useState('all');
  const [logQuery, setLogQuery] = useState('');
  const [logPhone, setLogPhone] = useState('');
  const [logEmail, setLogEmail] = useState('');
  const [workerQuery, setWorkerQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { 
    if (isAuthenticated) loadData(); 
  }, [isAuthenticated, adminToken]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await adminLogin(adminEmail, password);
      const token = res.data?.token;
      if (!token) throw new Error('Missing admin token');
      localStorage.setItem('shram_admin_token', token);
      setAdminToken(token);
      setIsAuthenticated(true);
      setPassword('');
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Admin login failed';
      setAuthError(msg);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('shram_admin_token');
    setAdminToken('');
    setIsAuthenticated(false);
  };

  const loadData = async () => {
    try {
      const [s, c, w, ai, tb, ms, logs, analytics] = await Promise.allSettled([
        getStats(adminToken), getAllClaims(adminToken), getAllWorkers(adminToken),
        riskAssessment({ city: 'Mumbai', zone: '4B' }),
        getCityTierBreakdown(adminToken),
        getMonitorStatus(adminToken),
        getLogs(adminToken, { limit: 50 }),
        getClaimAnalytics(adminToken),
      ]);
      if (s.status === 'fulfilled') setStats(s.value.data);
      if (c.status === 'fulfilled') setClaims(c.value.data);
      if (w.status === 'fulfilled') setWorkers(w.value.data);
      if (ai.status === 'fulfilled') setAiInsight(ai.value.data);
      if (tb.status === 'fulfilled') setTierBreakdown(tb.value.data?.breakdown);
      if (ms.status === 'fulfilled') setMonitorStatus(ms.value.data);
      if (logs.status === 'fulfilled') {
        setActivityLogs(logs.value.data?.logs || []);
        setLogSummary(logs.value.data?.summary || null);
      }
      if (analytics.status === 'fulfilled') {
        setClaimAnalytics(analytics.value.data?.days || []);
      }
    } catch (e) {
      console.error(e);
      const status = e?.response?.status;
      if (status === 401 || status === 403) {
        handleLogout();
      }
    }
    setLoading(false);
  };

  const refreshLogs = async (override = {}) => {
    try {
      const params = {
        limit: 50,
        ...(logFilter !== 'all' ? { category: logFilter } : {}),
        ...(logQuery ? { q: logQuery } : {}),
        ...(logPhone ? { phone: logPhone } : {}),
        ...(logEmail ? { email: logEmail } : {}),
        ...override,
      };
      const res = await getLogs(adminToken, params);
      setActivityLogs(res.data?.logs || []);
      setLogSummary(res.data?.summary || null);
    } catch (e) { console.error(e); }
  };

  const claimsByType = claims.reduce((acc, c) => {
    const type = c.triggerType?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Other';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});
  const chartData = Object.entries(claimsByType).map(([name, value]) => ({ name, value }));
  const COLORS = ['#4F46E5', '#059669', '#D97706', '#DC2626', '#8B5CF6', '#0D9488'];

  const autoTriggered = claims.filter(c => c.autoTriggered).length;
  const manualClaims = claims.length - autoTriggered;

  const volumeData = claimAnalytics.map(d => ({
    name: d.name,
    claims: d.manual,
    auto: d.auto,
    payouts: d.payouts,
  }));

  const tierChartData = tierBreakdown
    ? Object.entries(tierBreakdown).map(([tier, count]) => ({ name: TIER_LABELS[tier] || tier, value: count, fill: TIER_COLORS[tier] || '#94a3b8' }))
    : [];

  const fraudAlerts = claims.filter(c => c.fraudFlag);
  const workerRows = workers.filter(w => {
    if (!workerQuery.trim()) return true;
    const q = workerQuery.toLowerCase();
    return [w.name, w.phone, w.email, w.platform, w.city]
      .filter(Boolean)
      .some(v => String(v).toLowerCase().includes(q));
  });

  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: 'calc(100vh - 72px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', background: 'var(--bg-primary)' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ padding: 32, width: '100%', maxWidth: 400 }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--primary-bg)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Shield size={32} />
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 800 }}>Admin Portal</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Authorized personnel only</p>
          </div>
          <form onSubmit={handleLogin}>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">Admin Email</label>
              <input type="email" placeholder="admin@yourdomain.com" className="form-input" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} autoFocus style={{width: '100%'}}/>
            </div>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">Admin Password</label>
              <input type="password" placeholder="Enter admin password" className="form-input" value={password} onChange={e => setPassword(e.target.value)} style={{width: '100%'}}/>
            </div>
            {authError && <div style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 16, textAlign: 'center' }}>{authError}</div>}
            <button type="submit" className="btn btn-primary btn-full">Secure Login</button>
          </form>
        </motion.div>
      </div>
    );
  }

  if (loading) return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
      <div className="spinner" />
    </div>
  );

  return (
    <div className="page">
      <motion.div className="page-header" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-desc">Risk intelligence, city-tier analytics & automated monitoring</p>
        <button className="btn btn-secondary" onClick={handleLogout} style={{ marginTop: 8 }}>Logout Admin</button>
      </motion.div>

      {/* Trigger Monitor Status */}
      <motion.div className="card" style={{ padding: '16px 20px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, background: 'linear-gradient(135deg, rgba(139,92,246,0.06), rgba(79,70,229,0.06))', borderColor: 'rgba(139,92,246,0.2)' }}
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg, #8B5CF6, #4F46E5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity size={20} color="white" />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>🤖 Automated Trigger Monitor</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
              Polls weather every 15 min · {monitorStatus?.citiesMonitored || 9} cities · Auto-files claims on threshold breach
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#8B5CF6' }}>{monitorStatus?.claimsAutoFiled || autoTriggered}</div>
            <div style={{ fontSize: 10, color: 'var(--text-tertiary)', fontWeight: 600 }}>Auto-Claims</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#4F46E5' }}>{monitorStatus?.alertsGenerated || 0}</div>
            <div style={{ fontSize: 10, color: 'var(--text-tertiary)', fontWeight: 600 }}>Alerts</div>
          </div>
          <span style={{ fontSize: 11, padding: '4px 12px', borderRadius: 20, background: '#F0FDF4', color: '#059669', fontWeight: 700, border: '1px solid #BBF7D0' }}>
            ● LIVE
          </span>
        </div>
      </motion.div>

      {/* AI Insight Banner */}
      {aiInsight && (
        <motion.div className="card" style={{ padding: '16px 20px', display: 'flex', gap: 14, alignItems: 'center', marginBottom: 24, background: aiInsight.overallRisk === 'high' ? 'var(--danger-bg)' : aiInsight.overallRisk === 'medium' ? 'var(--warning-bg)' : 'var(--success-bg)', borderColor: aiInsight.overallRisk === 'high' ? 'var(--danger-border)' : aiInsight.overallRisk === 'medium' ? 'var(--warning-border)' : 'var(--success-border)' }}
          initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
          <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Brain size={20} color="var(--primary)" />
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: aiInsight.overallRisk === 'high' ? 'var(--danger)' : 'var(--warning)', letterSpacing: 0.5 }}>
              AI RISK INSIGHT · {aiInsight.cityTier || 'Mumbai Metro'}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: 2 }}>
              {aiInsight.advice} Risk Score: <strong>{aiInsight.riskScore}/100</strong>.
              Predicted claims: <strong>{aiInsight.predictedClaims}</strong>, est. payout: <strong>₹{aiInsight.predictedPayout}</strong>
              {aiInsight.tierMultiplier && <span> · Tier multiplier: <strong>{aiInsight.tierMultiplier}×</strong></span>}
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      <motion.div className="grid-3" style={{ marginBottom: 24 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        {[
          { icon: <Users size={20} />, val: stats?.totalWorkers || 0, label: 'Workers', color: 'var(--primary)', bg: 'var(--primary-bg)' },
          { icon: <Shield size={20} />, val: stats?.activePolicies || 0, label: 'Active Policies', color: 'var(--success)', bg: 'var(--success-bg)' },
          { icon: <FileText size={20} />, val: stats?.totalClaims || 0, label: 'Total Claims', color: 'var(--warning)', bg: 'var(--warning-bg)' },
          { icon: <Zap size={20} />, val: autoTriggered, label: 'Auto-Triggered', color: '#8B5CF6', bg: 'rgba(139,92,246,0.06)' },
          { icon: <AlertTriangle size={20} />, val: stats?.fraudFlags || 0, label: 'Fraud Flags', color: 'var(--danger)', bg: 'var(--danger-bg)' },
          { icon: <Clock size={20} />, val: `${stats?.avgSettleTime || 0}s`, label: 'Avg Settle', color: 'var(--teal)', bg: 'var(--teal-bg)' },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: 20, display: 'flex', gap: 14, alignItems: 'center' }}>
            <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.val}</div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 500 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Charts Row */}
      <motion.div className="grid-2" style={{ marginBottom: 24 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        {/* Claims Volume */}
        <div className="card" style={{ padding: 24 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: 'var(--text-tertiary)', marginBottom: 20 }}>WEEKLY CLAIMS (AUTO vs MANUAL)</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={volumeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }} />
              <Bar dataKey="auto" fill="#8B5CF6" radius={[4, 4, 0, 0]} name="Auto-Triggered" stackId="a" />
              <Bar dataKey="claims" fill="#4F46E5" radius={[4, 4, 0, 0]} name="Manual Claims" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-secondary)' }}><div style={{ width: 8, height: 8, borderRadius: 2, background: '#8B5CF6' }} /> Auto-Triggered</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-secondary)' }}><div style={{ width: 8, height: 8, borderRadius: 2, background: '#4F46E5' }} /> Manual Claims</div>
          </div>
        </div>

        {/* City Tier Breakdown */}
        <div className="card" style={{ padding: 24 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: 'var(--text-tertiary)', marginBottom: 20 }}>WORKERS BY CITY TIER</p>
          {tierChartData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={tierChartData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="value">
                    {tierChartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid var(--border)' }} />
                </PieChart>
              </ResponsiveContainer>
              {tierChartData.map((d, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < tierChartData.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: d.fill }} />
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{d.name}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: d.fill }}>{d.value} workers</span>
                    <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{d.name.includes('Metro') ? '1.3×' : d.name.includes('Tier-2') ? '1.1×' : '1.0×'} payout</span>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', fontSize: 14 }}>
              Register workers to see tier breakdown
            </div>
          )}
        </div>
      </motion.div>

      {/* Trigger Type Breakdown */}
      <motion.div className="grid-2" style={{ marginBottom: 24 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <div className="card" style={{ padding: 24 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: 'var(--text-tertiary)', marginBottom: 20 }}>CLAIMS BY TRIGGER TYPE</p>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={4} dataKey="value">
                  {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid var(--border)' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}>No data yet</div>
          )}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 }}>
            {chartData.map((d, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-secondary)' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i % COLORS.length] }} />
                {d.name} ({d.value})
              </div>
            ))}
          </div>
        </div>

        {/* Behavioral Risk Distribution */}
        <div className="card" style={{ padding: 24 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: 'var(--text-tertiary)', marginBottom: 16 }}>BEHAVIORAL RISK DISTRIBUTION</p>
          {(() => {
            const dist = { excellent: 0, good: 0, fair: 0, poor: 0 };
            workers.forEach(w => {
              const s = w.behavioralScore || 80;
              if (s >= 90) dist.excellent++;
              else if (s >= 75) dist.good++;
              else if (s >= 60) dist.fair++;
              else dist.poor++;
            });
            return Object.entries(dist).map(([label, count], i) => {
              const colors = { excellent: 'var(--success)', good: 'var(--primary)', fair: 'var(--warning)', poor: 'var(--danger)' };
              const pct = workers.length > 0 ? Math.round((count / workers.length) * 100) : 0;
              const bonuses = { excellent: '+20% bonus', good: '+10% bonus', fair: 'No bonus', poor: '-10% payout' };
              return (
                <div key={i} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{label} <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>({bonuses[label]})</span></span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: colors[label] }}>{count} ({pct}%)</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${pct}%`, background: colors[label] }} />
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </motion.div>

      {/* Fraud Alerts */}
      <motion.div className="card" style={{ padding: 24, marginBottom: 24 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: 'var(--text-tertiary)', marginBottom: 16 }}>🚨 FRAUD ALERTS</p>
        {fraudAlerts.length > 0 ? fraudAlerts.map((f, i) => (
          <div key={i} style={{ padding: '14px 0', borderBottom: i < fraudAlerts.length - 1 ? '1px solid var(--border)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{f.userName || `Worker ${f.userId?.slice(-4)}`} · Zone {f.location?.zone}</div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4 }}>
                {f.fraudReasons?.join(', ') || 'Anomaly detected'} · Score: {f.fraudScore}
              </div>
            </div>
            <span className="badge badge-danger">{f.fraudScore > 0.5 ? 'High' : 'Med'}</span>
          </div>
        )) : (
          <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 14 }}>
            ✅ No fraud alerts — all claims verified
          </div>
        )}
      </motion.div>

      {/* Workers Table */}
      <motion.div className="card" style={{ padding: 24, overflow: 'auto' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: 'var(--text-tertiary)', marginBottom: 0 }}>REGISTERED WORKERS · RISK PROFILE</p>
          <input className="form-input" style={{ maxWidth: 300 }} placeholder="Filter workers by phone/email/name/city" value={workerQuery} onChange={e => setWorkerQuery(e.target.value)} />
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border)' }}>
              {['Name', 'Platform', 'City', 'Tier', 'Risk', 'Behavioral', 'Daily Income', 'Est. Payout', 'Total Paid'].map(h => (
                <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--text-tertiary)', fontSize: 11, letterSpacing: 0.5, whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {workerRows.map((w, i) => {
              const tierMult = w.cityTier === 'tier1' ? 1.3 : w.cityTier === 'tier2' ? 1.1 : 1.0;
              const tierLabel = w.cityTier === 'tier1' ? 'Metro' : w.cityTier === 'tier2' ? 'Tier-2' : 'Tier-3';
              const tierColor = TIER_COLORS[w.cityTier] || '#64748B';
              const estPayout = Math.round((w.declaredIncome || 750) * 0.5 * tierMult);
              return (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px', fontWeight: 600 }}>{w.name}</td>
                  <td style={{ padding: '12px', textTransform: 'capitalize' }}>{w.platform}</td>
                  <td style={{ padding: '12px' }}>{w.city}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: `${tierColor}15`, color: tierColor, fontWeight: 600 }}>{tierLabel}</span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span className={`badge ${w.riskScore < 40 ? 'badge-success' : w.riskScore < 70 ? 'badge-warning' : 'badge-danger'}`} style={{ fontSize: 11 }}>{w.riskScore}</span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: (w.behavioralScore || 80) >= 90 ? 'var(--success)' : (w.behavioralScore || 80) >= 75 ? 'var(--primary)' : 'var(--warning)' }}>
                      {w.behavioralScore || 80}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>₹{w.declaredIncome || 750}/day</td>
                  <td style={{ padding: '12px', fontWeight: 600, color: 'var(--primary)' }}>₹{estPayout}</td>
                  <td style={{ padding: '12px', fontWeight: 600, color: 'var(--success)' }}>₹{w.totalPaidOut}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </motion.div>

      {/* ── Live Activity Log ──────────────────────────────────────────── */}
      <motion.div className="card" style={{ padding: 24, marginTop: 24 }}
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: 'var(--text-tertiary)', marginBottom: 6 }}>📋 LIVE ACTIVITY LOG</p>
            {logSummary && (
              <div style={{ display: 'flex', gap: 16 }}>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Total: <strong>{logSummary.totalLogs}</strong></span>
                <span style={{ fontSize: 12, color: 'var(--primary)' }}>Today: <strong>{logSummary.todayLogs}</strong></span>
                <span style={{ fontSize: 12, color: 'var(--danger)' }}>Errors: <strong>{logSummary.errorLogs}</strong></span>
                <span style={{ fontSize: 12, color: '#8B5CF6' }}>Active Users: <strong>{logSummary.uniqueActiveUsers}</strong></span>
              </div>
            )}
          </div>
          <button onClick={refreshLogs} className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: 12 }}>
            🔄 Refresh
          </button>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
          {['all', 'auth', 'claim', 'policy', 'weather', 'ai', 'error'].map(f => (
            <button key={f} onClick={() => { setLogFilter(f); setTimeout(() => refreshLogs({ category: f === 'all' ? undefined : f }), 0); }}
              style={{ padding: '4px 12px', borderRadius: 20, border: 'none', cursor: 'pointer',
                background: logFilter === f ? 'var(--primary)' : 'var(--bg-secondary)',
                color: logFilter === f ? 'white' : 'var(--text-secondary)',
                fontSize: 12, fontWeight: 600, fontFamily: 'inherit', transition: 'all 0.15s' }}>
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Search/filter row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, marginBottom: 14 }}>
          <input className="form-input" placeholder="Search action/user/city" value={logQuery} onChange={e => setLogQuery(e.target.value)} />
          <input className="form-input" placeholder="Filter by phone" value={logPhone} onChange={e => setLogPhone(e.target.value)} />
          <input className="form-input" placeholder="Filter by email" value={logEmail} onChange={e => setLogEmail(e.target.value)} />
          <button onClick={() => refreshLogs()} className="btn btn-secondary" style={{ padding: '8px 12px' }}>Apply Filters</button>
        </div>

        {/* Log table */}
        <div style={{ overflowX: 'auto', maxHeight: 400, overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead style={{ position: 'sticky', top: 0, background: 'white', zIndex: 1 }}>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                {['Time', 'Action', 'User', 'Category', 'Status', 'Duration', 'IP', 'City'].map(h => (
                  <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700, color: 'var(--text-tertiary)', fontSize: 10, letterSpacing: 0.5, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activityLogs.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: 24, textAlign: 'center', color: 'var(--text-tertiary)' }}>No activity logged yet — actions appear here in real-time</td></tr>
              ) : activityLogs.map((log, i) => {
                const actionColors = {
                  WORKER_REGISTERED: '#059669', WORKER_LOGIN: '#4F46E5',
                  OTP_SENT: '#8B5CF6', OTP_VERIFIED: '#0D9488',
                  CLAIM_FILED: '#D97706', POLICY_ACTIVATED: '#059669',
                  ADMIN_VIEWED_CLAIMS: '#64748B', PREMIUM_CALCULATED: '#4F46E5',
                };
                const actionColor = actionColors[log.action] || '#64748B';
                const isError = log.status === 'failure';
                return (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: isError ? 'rgba(220,38,38,0.02)' : 'transparent' }}>
                    <td style={{ padding: '8px 10px', color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>
                      {new Date(log.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>
                      <span style={{ padding: '2px 8px', borderRadius: 20, background: `${actionColor}15`, color: actionColor, fontWeight: 700, fontSize: 10 }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ padding: '8px 10px', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {log.userName || log.userId?.slice(-8) || '—'}
                    </td>
                    <td style={{ padding: '8px 10px' }}>
                      <span style={{ textTransform: 'uppercase', fontSize: 9, fontWeight: 700, color: 'var(--text-tertiary)' }}>{log.category}</span>
                    </td>
                    <td style={{ padding: '8px 10px' }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: isError ? 'var(--danger)' : 'var(--success)' }}>
                        {isError ? '✗ FAIL' : '✓ OK'}
                      </span>
                      {isError && log.errorMessage && (
                        <div style={{ fontSize: 10, color: 'var(--danger)', marginTop: 2, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {log.errorMessage}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '8px 10px', color: log.durationMs > 2000 ? 'var(--warning)' : 'var(--text-tertiary)' }}>
                      {log.durationMs}ms
                    </td>
                    <td style={{ padding: '8px 10px', color: 'var(--text-tertiary)', fontFamily: 'monospace', fontSize: 10 }}>
                      {log.ip?.slice(0, 15) || '—'}
                    </td>
                    <td style={{ padding: '8px 10px', color: 'var(--text-secondary)' }}>{log.city || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

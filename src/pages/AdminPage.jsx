import { useState, useEffect } from 'react';
import { BarChart3, Users, Shield, AlertTriangle, TrendingUp, Brain, FileText, Clock, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { getStats, getAllClaims, getAllWorkers, riskAssessment } from '../api';

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [claims, setClaims] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [aiInsight, setAiInsight] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [s, c, w, ai] = await Promise.allSettled([
        getStats(), getAllClaims(), getAllWorkers(),
        riskAssessment({ city: 'Mumbai', zone: '4B' })
      ]);
      if (s.status === 'fulfilled') setStats(s.value.data);
      if (c.status === 'fulfilled') setClaims(c.value.data);
      if (w.status === 'fulfilled') setWorkers(w.value.data);
      if (ai.status === 'fulfilled') setAiInsight(ai.value.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const claimsByType = claims.reduce((acc, c) => {
    const type = c.triggerType?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Other';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(claimsByType).map(([name, value]) => ({ name, value }));
  const COLORS = ['#4F46E5', '#059669', '#D97706', '#DC2626', '#8B5CF6', '#0D9488'];

  const volumeData = [
    { name: 'Mon', claims: 12, payouts: 8400 },
    { name: 'Tue', claims: 19, payouts: 13200 },
    { name: 'Wed', claims: 8, payouts: 5600 },
    { name: 'Thu', claims: 24, payouts: 16800 },
    { name: 'Fri', claims: 15, payouts: 10500 },
    { name: 'Sat', claims: 6, payouts: 4200 },
    { name: 'Sun', claims: 3, payouts: 2100 },
  ];

  const fraudAlerts = claims.filter(c => c.fraudFlag);

  if (loading) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="page">
      <motion.div className="page-header" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-desc">Risk intelligence & analytics for insurers</p>
      </motion.div>

      {/* AI Insight Banner */}
      {aiInsight && (
        <motion.div className="card" style={{ padding: '16px 20px', display: 'flex', gap: 14, alignItems: 'center', marginBottom: 24, background: aiInsight.overallRisk === 'high' ? 'var(--danger-bg)' : aiInsight.overallRisk === 'medium' ? 'var(--warning-bg)' : 'var(--success-bg)', borderColor: aiInsight.overallRisk === 'high' ? 'var(--danger-border)' : aiInsight.overallRisk === 'medium' ? 'var(--warning-border)' : 'var(--success-border)' }}
          initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
          <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Brain size={20} color="var(--primary)" />
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: aiInsight.overallRisk === 'high' ? 'var(--danger)' : 'var(--warning)', letterSpacing: 0.5 }}>AI RISK INSIGHT</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: 2 }}>
              {aiInsight.advice} Risk Score: <strong>{aiInsight.riskScore}/100</strong>.
              Predicted claims: <strong>{aiInsight.predictedClaims}</strong>, est. payout: <strong>₹{aiInsight.predictedPayout}</strong>
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
          { icon: <TrendingUp size={20} />, val: `${stats?.lossRatio || 0}%`, label: 'Loss Ratio', color: 'var(--teal)', bg: 'var(--teal-bg)' },
          { icon: <AlertTriangle size={20} />, val: stats?.fraudFlags || 0, label: 'Fraud Flags', color: 'var(--danger)', bg: 'var(--danger-bg)' },
          { icon: <Clock size={20} />, val: `${stats?.avgSettleTime || 0}s`, label: 'Avg Settle', color: '#8B5CF6', bg: 'rgba(139,92,246,0.06)' },
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
        {/* Claims Volume Chart */}
        <div className="card" style={{ padding: 24 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: 'var(--text-tertiary)', marginBottom: 20 }}>WEEKLY CLAIMS VOLUME</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={volumeData}>
              <defs>
                <linearGradient id="colorClaims" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }} />
              <Area type="monotone" dataKey="claims" stroke="#4F46E5" fill="url(#colorClaims)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Claims by Type Pie */}
        <div className="card" style={{ padding: 24 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: 'var(--text-tertiary)', marginBottom: 20 }}>CLAIMS BY TYPE</p>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                  {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid var(--border)' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}>No data yet</div>
          )}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 }}>
            {chartData.map((d, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-secondary)' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i % COLORS.length] }} />
                {d.name} ({d.value})
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Volume Breakdown */}
      <motion.div className="card" style={{ padding: 24, marginBottom: 24 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: 'var(--text-tertiary)', marginBottom: 20 }}>VOLUME BREAKDOWN</p>
        {[
          { l: 'Claims Processed', v: stats?.totalClaims ? Math.round((stats.settledClaims / stats.totalClaims) * 100) : 80, c: 'var(--primary)' },
          { l: 'Successfully Settled', v: stats?.totalClaims ? Math.round((stats.settledClaims / stats.totalClaims) * 100) : 68, c: 'var(--success)' },
          { l: 'Fraud Detected', v: stats?.totalClaims ? Math.round((stats.fraudFlags / stats.totalClaims) * 100) : 5, c: 'var(--danger)' },
        ].map((b, i) => (
          <div key={i} style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{b.l}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: b.c }}>{b.v}%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${b.v}%`, background: b.c }} />
            </div>
          </div>
        ))}
      </motion.div>

      {/* Fraud Alerts */}
      <motion.div className="card" style={{ padding: 24 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
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
      <motion.div className="card" style={{ padding: 24, marginTop: 24, overflow: 'auto' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: 'var(--text-tertiary)', marginBottom: 16 }}>REGISTERED WORKERS</p>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border)' }}>
              {['Name', 'Platform', 'City', 'Zone', 'Risk', 'Claims', 'Payouts'].map(h => (
                <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--text-tertiary)', fontSize: 11, letterSpacing: 0.5 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {workers.map((w, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px', fontWeight: 600 }}>{w.name}</td>
                <td style={{ padding: '12px', textTransform: 'capitalize' }}>{w.platform}</td>
                <td style={{ padding: '12px' }}>{w.city}</td>
                <td style={{ padding: '12px' }}>{w.zone}</td>
                <td style={{ padding: '12px' }}>
                  <span className={`badge ${w.riskScore < 40 ? 'badge-success' : w.riskScore < 70 ? 'badge-warning' : 'badge-danger'}`} style={{ fontSize: 11 }}>
                    {w.riskScore}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>{w.totalClaims}</td>
                <td style={{ padding: '12px', fontWeight: 600, color: 'var(--success)' }}>₹{w.totalPaidOut}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CloudRain, Wind, Thermometer, AlertTriangle, Check, X, Clock, MapPin, Zap, CheckCircle2, Wifi } from 'lucide-react';
import { motion } from 'framer-motion';
import { getUserClaims, fileClaim, getWeather, getAQI } from '../api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function ClaimsPage({ user, policy }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [view, setView] = useState('list');
  const [result, setResult] = useState(null);

  if (!user) {
    navigate('/auth');
    return null;
  }

  // React Query: Fetch Claims
  const { data: claimsData } = useQuery({
    queryKey: ['claims', user.id],
    queryFn: async () => {
      const res = await getUserClaims(user.id);
      return res.data;
    },
    enabled: !!user.id,
    refetchInterval: 15000, // Poll every 15s to simulate real-time fallbacks
  });
  const claims = claimsData || [];

  // React Query: Fetch Weather & AQI Triggers
  const { data: triggersData } = useQuery({
    queryKey: ['triggers', user.city],
    queryFn: async () => {
      const [w, a] = await Promise.allSettled([
        getWeather(user.city || 'Mumbai'),
        getAQI(user.city || 'Mumbai')
      ]);
      const triggers = [];
      if (w.status === 'fulfilled' && w.value.data.triggers) triggers.push(...w.value.data.triggers);
      if (a.status === 'fulfilled' && a.value.data.triggers) triggers.push(...a.value.data.triggers);
      return triggers;
    },
    enabled: !!user.city,
    staleTime: 5 * 60 * 1000, 
  });
  const activeTriggers = triggersData || [];

  // React Query: Optimistic Mutation for filing claims
  const fileClaimMutation = useMutation({
    mutationFn: async ({ triggerType, triggerValue }) => {
      const res = await fileClaim({
        userId: user.id,
        triggerType,
        triggerValue,
        location: { lat: user.gpsLat, lng: user.gpsLng, zone: user.zone, area: user.city },
        wasWorking: true
      });
      return res.data;
    },
    onMutate: async (newClaim) => {
      // Optimistic UI Update
      await queryClient.cancelQueries({ queryKey: ['claims', user.id] });
      const previousClaims = queryClient.getQueryData(['claims', user.id]);
      
      const optimisticClaim = {
        id: 'temp-' + Date.now(),
        triggerType: newClaim.triggerType,
        status: 'pending',
        payoutAmount: 0,
        createdAt: new Date().toISOString(),
        location: { area: user.city }
      };

      queryClient.setQueryData(['claims', user.id], old => [optimisticClaim, ...(old || [])]);
      return { previousClaims };
    },
    onError: (err, newClaim, context) => {
      queryClient.setQueryData(['claims', user.id], context.previousClaims);
      alert(err.response?.data?.error || 'Claim failed. We have reverted the UI state.');
    },
    onSuccess: (data) => {
      setResult(data);
      setView('result');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['claims', user.id] });
    }
  });

  const handleFileClaim = (triggerType, triggerValue) => {
    if (!policy) { alert('Please activate a plan first'); navigate('/plans'); return; }
    fileClaimMutation.mutate({ triggerType, triggerValue });
  };

  const triggerTypes = [
    { type: 'heavy_rainfall', icon: <CloudRain size={20} />, label: 'Heavy Rainfall', threshold: '> 30mm/hr', color: 'var(--primary)', bg: 'var(--primary-bg)' },
    { type: 'severe_aqi', icon: <AlertTriangle size={20} />, label: 'Severe AQI', threshold: '> 200 AQI', color: 'var(--warning)', bg: 'var(--warning-bg)' },
    { type: 'extreme_heat', icon: <Thermometer size={20} />, label: 'Extreme Heat', threshold: '> 42°C', color: 'var(--danger)', bg: 'var(--danger-bg)' },
    { type: 'flooding', icon: <CloudRain size={20} />, label: 'Flooding', threshold: '> 50mm/hr', color: '#0284C7', bg: 'rgba(2,132,199,0.06)' },
    { type: 'storm', icon: <Wind size={20} />, label: 'Storm', threshold: '> 80km/h', color: '#8B5CF6', bg: 'rgba(139,92,246,0.06)' },
  ];

  if (view === 'result' && result) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 150px)' }}>
        <motion.div style={{ textAlign: 'center', maxWidth: 400 }} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <div style={{ fontSize: 56, marginBottom: 24 }}>{result.claim?.fraudFlag ? '⚠️' : '⚡'}</div>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: result.claim?.fraudFlag ? 'var(--warning)' : 'var(--success)', marginBottom: 8 }}>
            {result.claim?.fraudFlag ? 'UNDER REVIEW' : 'PAYOUT SETTLED'}
          </p>
          <div style={{ fontSize: 56, fontWeight: 800, letterSpacing: -2, marginBottom: 16, color: 'var(--text-primary)' }}>
            ₹{result.claim?.payoutAmount || 0}
          </div>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 32 }}>
            {result.claim?.fraudFlag
              ? 'Flagged for manual review. We\'ll verify within 24 hours.'
              : <>Credited via UPI in <span style={{ color: 'var(--success)', fontWeight: 600 }}>{result.claim?.settleTime}s</span></>
            }
          </p>
          <button className="btn btn-primary btn-full" onClick={() => { setView('list'); setResult(null); }}>Done</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="page">
      <motion.div className="page-header" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="page-title">Claims</h1>
            <p className="page-desc">Auto-detected parametric triggers · 1-tap filing</p>
          </div>
          {!policy && <span className="badge badge-danger">No Active Policy</span>}
        </div>
      </motion.div>

      {/* Active Triggers */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: 'var(--text-tertiary)', marginBottom: 12 }}>AVAILABLE TRIGGERS</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 12 }}>
          {triggerTypes.map((t, i) => {
            const isActive = activeTriggers.some(at => at.type === t.type);
            return (
              <div key={i} className="card card-interactive card-hover" style={{ padding: 18, display: 'flex', gap: 14, alignItems: 'center', opacity: fileClaimMutation.isPending ? 0.6 : 1, cursor: fileClaimMutation.isPending ? 'not-allowed' : 'pointer' }}
                onClick={() => !fileClaimMutation.isPending && handleFileClaim(t.type, isActive ? activeTriggers.find(at => at.type === t.type)?.value : t.threshold.match(/\d+/)?.[0])}>
                <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.color, flexShrink: 0 }}>
                  {t.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                    {t.label}
                    {isActive && <span className="badge badge-danger" style={{ fontSize: 9, padding: '2px 8px' }}>TRIGGERED</span>}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>Threshold: {t.threshold}</div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Offline Notice - PWA Ready */}
      <motion.div className="card" style={{ padding: '14px 18px', display: 'flex', gap: 12, alignItems: 'center', marginTop: 20, background: 'var(--warning-bg)', borderColor: 'var(--warning-border)' }}
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Wifi size={18} color="var(--warning)" />
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--warning)' }}>Offline mode ready</div>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Claims auto-submit when network returns</div>
        </div>
      </motion.div>

      {/* Claim History */}
      {claims.length > 0 && (
        <motion.div style={{ marginTop: 32 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: 'var(--text-tertiary)', marginBottom: 16 }}>CLAIM HISTORY</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {claims.map((c, i) => (
              <div key={c.id || i} className={`card ${c.id?.startsWith('temp') ? 'opacity-80' : ''}`} style={{ padding: 18, display: 'flex', gap: 16, alignItems: 'center' }}>
                <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: c.status === 'settled' ? 'var(--success-bg)' : c.fraudFlag ? 'var(--danger-bg)' : 'var(--warning-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {c.status === 'settled' ? <CheckCircle2 size={20} color="var(--success)" /> : c.fraudFlag ? <AlertTriangle size={20} color="var(--danger)" /> : <Clock size={20} color="var(--warning)" />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{c.triggerType?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{c.location?.area} · {c.settleTime ? `${c.settleTime}s` : 'Pending'}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 16, fontWeight: 700, color: c.status === 'settled' ? 'var(--success)' : 'var(--text-secondary)' }}>₹{c.payoutAmount}</span>
                      <span className={`badge ${c.status === 'settled' ? 'badge-success' : c.fraudFlag ? 'badge-danger' : 'badge-warning'}`} style={{ fontSize: 10 }}>
                        {c.status === 'settled' ? '✓ Paid' : c.fraudFlag ? '🚨 Review' : '⏳ Pending'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

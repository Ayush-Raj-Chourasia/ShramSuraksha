import { useState, useEffect } from 'react';
import { CloudRain, Thermometer, Wind, AlertTriangle, Bell, CheckCircle2, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { getAlerts, getWeather, getAQI } from '../api';

export default function AlertsPage({ user }) {
  const [alerts, setAlerts] = useState([]);
  const [weather, setWeather] = useState(null);
  const [aqi, setAqi] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [a, w, q] = await Promise.allSettled([
        getAlerts(),
        getWeather(user?.city || 'Mumbai'),
        getAQI(user?.city || 'Mumbai')
      ]);
      if (a.status === 'fulfilled') setAlerts(a.value.data);
      if (w.status === 'fulfilled') setWeather(w.value.data);
      if (q.status === 'fulfilled') setAqi(q.value.data);
    } catch (e) { console.error(e); }
  };

  const iconMap = {
    heavy_rainfall: <CloudRain size={20} />,
    severe_aqi: <AlertTriangle size={20} />,
    extreme_heat: <Thermometer size={20} />,
    flooding: <CloudRain size={20} />,
    storm: <Wind size={20} />,
  };

  const colorMap = {
    heavy_rainfall: { color: 'var(--primary)', bg: 'var(--primary-bg)' },
    severe_aqi: { color: 'var(--warning)', bg: 'var(--warning-bg)' },
    extreme_heat: { color: 'var(--danger)', bg: 'var(--danger-bg)' },
    flooding: { color: '#0284C7', bg: 'rgba(2,132,199,0.06)' },
    storm: { color: '#8B5CF6', bg: 'rgba(139,92,246,0.06)' },
  };

  const timeAgo = (date) => {
    const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
    return `${Math.floor(mins / 1440)}d ago`;
  };

  const activeCount = alerts.filter(a => a.payoutTriggered).length;

  return (
    <div className="page">
      <motion.div className="page-header" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="page-title">Alerts</h1>
            <p className="page-desc">Real-time parametric triggers & weather monitoring</p>
          </div>
          {activeCount > 0 && (
            <span className="badge badge-danger">
              <span className="badge-dot" style={{ background: 'var(--danger)' }} /> {activeCount} Active
            </span>
          )}
        </div>
      </motion.div>

      {/* Live Weather Card */}
      {weather && (
        <motion.div className="card" style={{ padding: 24, marginBottom: 24, background: 'linear-gradient(135deg, rgba(79,70,229,0.03), rgba(13,148,136,0.03))' }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: 'var(--text-tertiary)', marginBottom: 16 }}>
            LIVE CONDITIONS — {weather.city?.toUpperCase() || 'MUMBAI'}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 16 }}>
            <div style={{ textAlign: 'center', padding: 16, borderRadius: 'var(--radius-md)', background: 'var(--white)', border: '1px solid var(--border)' }}>
              <Thermometer size={20} color={weather.temp > 40 ? 'var(--danger)' : 'var(--primary)'} style={{ marginBottom: 8 }} />
              <div style={{ fontSize: 24, fontWeight: 800, color: weather.temp > 40 ? 'var(--danger)' : 'var(--text-primary)' }}>{weather.temp}°C</div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>Temperature</div>
            </div>
            <div style={{ textAlign: 'center', padding: 16, borderRadius: 'var(--radius-md)', background: 'var(--white)', border: '1px solid var(--border)' }}>
              <Wind size={20} color="var(--primary)" style={{ marginBottom: 8 }} />
              <div style={{ fontSize: 24, fontWeight: 800 }}>{weather.windSpeed}</div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>Wind km/h</div>
            </div>
            <div style={{ textAlign: 'center', padding: 16, borderRadius: 'var(--radius-md)', background: 'var(--white)', border: '1px solid var(--border)' }}>
              <CloudRain size={20} color={weather.rain1h > 30 ? 'var(--danger)' : 'var(--primary)'} style={{ marginBottom: 8 }} />
              <div style={{ fontSize: 24, fontWeight: 800, color: weather.rain1h > 30 ? 'var(--danger)' : 'var(--text-primary)' }}>{weather.rain1h}</div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>Rain mm/hr</div>
            </div>
            {aqi && (
              <div style={{ textAlign: 'center', padding: 16, borderRadius: 'var(--radius-md)', background: 'var(--white)', border: '1px solid var(--border)' }}>
                <AlertTriangle size={20} color={aqi.aqi > 200 ? 'var(--danger)' : aqi.aqi > 100 ? 'var(--warning)' : 'var(--success)'} style={{ marginBottom: 8 }} />
                <div style={{ fontSize: 24, fontWeight: 800, color: aqi.aqi > 200 ? 'var(--danger)' : aqi.aqi > 100 ? 'var(--warning)' : 'var(--success)' }}>{aqi.aqi}</div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>AQI</div>
              </div>
            )}
          </div>
          {aqi?.healthAdvice && (
            <div style={{ marginTop: 16, padding: '10px 14px', borderRadius: 'var(--radius-md)', background: aqi.aqi > 200 ? 'var(--danger-bg)' : 'var(--success-bg)', fontSize: 13, color: aqi.aqi > 200 ? 'var(--danger)' : 'var(--success)', fontWeight: 500 }}>
              {aqi.healthAdvice}
            </div>
          )}
        </motion.div>
      )}

      {/* Alert List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {alerts.map((a, i) => {
          const colors = colorMap[a.type] || { color: 'var(--text-secondary)', bg: 'var(--bg-secondary)' };
          return (
            <motion.div key={i} className="card" style={{ padding: 20, display: 'flex', gap: 16 }}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}>
              <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.color, flexShrink: 0 }}>
                {iconMap[a.type] || <Bell size={20} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 15, fontWeight: 600 }}>{a.title}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{timeAgo(a.createdAt)}</span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 10, lineHeight: 1.5 }}>{a.description}</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {a.payoutTriggered && (
                    <span className="chip chip-success" style={{ fontSize: 11 }}>
                      <CheckCircle2 size={12} /> ₹{a.payoutAmount} triggered
                    </span>
                  )}
                  <span className="chip" style={{ fontSize: 11 }}>Zone {a.zone}</span>
                  <span className="chip" style={{ fontSize: 11 }}>{a.city}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {alerts.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-tertiary)' }}>
          <Bell size={40} style={{ marginBottom: 16, opacity: 0.3 }} />
          <p style={{ fontSize: 16, fontWeight: 600 }}>No alerts yet</p>
          <p style={{ fontSize: 14, marginTop: 4 }}>Alerts will appear when parametric triggers are detected</p>
        </div>
      )}
    </div>
  );
}

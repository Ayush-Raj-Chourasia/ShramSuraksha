import { Link } from 'react-router-dom';
import { Shield, Zap, CloudRain, BarChart3, Clock, Smartphone, ArrowRight, CheckCircle2, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const fadeUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 } };
const stagger = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } };

export default function LandingPage({ user }) {
  const features = [
    { icon: <CloudRain size={24} />, title: 'Parametric Triggers', desc: 'Auto-detects extreme weather, AQI spikes, and disruptions using real-time IMD & CPCB data feeds.', color: 'var(--primary)', bg: 'var(--primary-bg)' },
    { icon: <Zap size={24} />, title: 'Instant Payouts', desc: 'Claims settled in under 90 seconds. Money credited directly to UPI — zero paperwork, zero waiting.', color: 'var(--warning)', bg: 'var(--warning-bg)' },
    { icon: <Shield size={24} />, title: 'AI-Powered Pricing', desc: 'Gemini AI calculates personalized weekly premiums based on zone risk, weather forecasts & claim history.', color: 'var(--success)', bg: 'var(--success-bg)' },
    { icon: <BarChart3 size={24} />, title: 'Fraud Detection', desc: 'Multi-layer AI fraud engine with GPS validation, duplicate detection, and pattern anomaly analysis.', color: 'var(--danger)', bg: 'var(--danger-bg)' },
    { icon: <Clock size={24} />, title: 'Weekly Coverage', desc: 'Plans from ₹29/week matching gig worker payout cycles. Cancel anytime, auto-renew for convenience.', color: 'var(--teal)', bg: 'var(--teal-bg)' },
    { icon: <Smartphone size={24} />, title: 'Offline Ready', desc: 'Works in low-connectivity areas. Claims queue offline and auto-submit when network returns.', color: '#8B5CF6', bg: 'rgba(139,92,246,0.06)' },
  ];

  const stats = [
    { value: '₹12.4L', label: 'Paid This Week', color: 'var(--primary)' },
    { value: '<90s', label: 'Avg. Settlement', color: 'var(--success)' },
    { value: '98%', label: 'Claims Approved', color: 'var(--teal)' },
    { value: '4,821', label: 'Workers Protected', color: '#8B5CF6' },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="landing-hero">
        <div className="hero-bg-orb" style={{ width: 600, height: 600, top: -200, right: -100, background: 'rgba(79,70,229,0.12)' }} />
        <div className="hero-bg-orb" style={{ width: 400, height: 400, bottom: -100, left: -100, background: 'rgba(13,148,136,0.1)' }} />
        
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 800, margin: '0 auto' }}>
          <motion.div className="hero-badge" {...fadeUp}>
            <Shield size={14} /> AI-Powered Parametric Insurance
          </motion.div>

          <motion.h1 className="hero-title" {...fadeUp} transition={{ delay: 0.1, duration: 0.7 }}>
            Protect Every Delivery.{' '}
            <span className="gradient-text">Every Worker.</span>{' '}
            Every Day.
          </motion.h1>

          <motion.p className="hero-sub" {...fadeUp} transition={{ delay: 0.2, duration: 0.7 }}>
            India's first AI-powered income protection for gig delivery workers.
            Automated weather triggers, instant UPI payouts, and weekly plans
            starting at just <strong>₹29/week</strong>.
          </motion.p>

          <motion.div className="hero-ctas" {...fadeUp} transition={{ delay: 0.3, duration: 0.7 }}>
            <Link to={user ? "/dashboard" : "/auth"} className="btn btn-primary btn-lg">
              {user ? 'Go to Dashboard' : 'Get Protected Now'} <ArrowRight size={18} />
            </Link>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 48, flexWrap: 'wrap' }}
            {...fadeUp} transition={{ delay: 0.5 }}
          >
            {['IMD Verified Data', 'UPI Instant Payout', 'Gemini AI Engine', 'Zero Paperwork'].map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
                <CheckCircle2 size={14} color="var(--success)" /> {t}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: '0 32px' }}>
        <div style={{ maxWidth: 1000, margin: '-40px auto 0', position: 'relative', zIndex: 2 }}>
          <motion.div className="card stats-row" style={{ padding: '8px' }} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            {stats.map((s, i) => (
              <div key={i} className="stat-card" style={{ borderRight: i < stats.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="section">
        <motion.div style={{ textAlign: 'center' }} {...fadeUp}>
          <div className="section-label">HOW IT WORKS</div>
          <h2 className="section-title" style={{ maxWidth: 500, margin: '0 auto 8px' }}>
            Insurance That <span className="gradient-text">Thinks</span> For You
          </h2>
          <p className="section-desc" style={{ margin: '0 auto' }}>
            Our AI continuously monitors weather, AQI, and disruption data. When conditions cross
            parametric thresholds, your claim is auto-triggered and payout is instant.
          </p>
        </motion.div>

        <div className="features-grid">
          {features.map((f, i) => (
            <motion.div key={i} className="card card-hover feature-card" {...stagger} transition={{ delay: i * 0.1, duration: 0.5 }}>
              <div className="feature-icon" style={{ background: f.bg, color: f.color }}>
                {f.icon}
              </div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works steps */}
      <section style={{ padding: '40px 32px 80px', background: 'var(--white)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <motion.div {...fadeUp}>
            <div className="section-label">THE FLOW</div>
            <h2 className="section-title">3 Steps to Protection</h2>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 32, marginTop: 48 }}>
            {[
              { step: '01', title: 'Sign Up', desc: 'Enter your details and delivery platform. Takes 30 seconds.', emoji: '📱' },
              { step: '02', title: 'Choose Plan', desc: 'AI recommends the best weekly plan for your zone & risk profile.', emoji: '🛡️' },
              { step: '03', title: 'Stay Protected', desc: 'Automatic triggers detect disruptions and payout is instant via UPI.', emoji: '⚡' },
            ].map((s, i) => (
              <motion.div key={i} style={{ textAlign: 'center' }} {...stagger} transition={{ delay: i * 0.15 }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>{s.emoji}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', letterSpacing: 1, marginBottom: 8 }}>STEP {s.step}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 32px', textAlign: 'center' }}>
        <motion.div style={{ maxWidth: 600, margin: '0 auto' }} {...fadeUp}>
          <div style={{ fontSize: 48, marginBottom: 24 }}>🛡️</div>
          <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: -1, marginBottom: 16 }}>
            Ready to Protect Your Earnings?
          </h2>
          <p style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 32, lineHeight: 1.6 }}>
            Join thousands of delivery workers who never worry about lost income from weather disruptions.
          </p>
          <Link to={user ? "/dashboard" : "/auth"} className="btn btn-primary btn-lg">
            {user ? 'Go to Dashboard' : 'Start Free — Activate in 30s'} <ArrowRight size={18} />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p className="footer-text">
          © 2026 ShramSuraksha · Built for Guidewire DEVTrails 2026 · Team Era
        </p>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
          AI-Powered Parametric Insurance for India's Gig Economy
        </p>
      </footer>
    </div>
  );
}

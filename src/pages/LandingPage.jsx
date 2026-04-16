import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Zap, TrendingUp, CloudRain, Clock, MapPin, CheckCircle2, ArrowRight, Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

const fadeUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 } };
const stagger = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } };

export default function LandingPage({ user }) {
  const [theme, setTheme] = useState('light');
  const [lang, setLang] = useState('en');

  const t = {
    en: {
      heroTitle: 'Protect Every Delivery.', heroGradient: 'Every Worker.', heroEnd: 'Every Day.',
      heroSub: "India's first AI-powered income protection for gig delivery workers. Automated weather triggers, instant UPI payouts, and weekly plans starting at just ₹29/week.",
      cta: user ? 'Go to Dashboard' : 'Check My Daily Coverage',
      ctaMicro: 'Takes 60 seconds • No paperwork needed',
      actionTitle: 'Insurance That Thinks For You',
      actionBadge: 'Payout Trigger: Active • ₹150 Claim Available Today',
      feat1: 'Automated Weather Triggers', feat1D: 'Background processes monitor AQI & rainfall hourly—no apps to open.',
      feat2: 'Dynamic Income Multipliers', feat2D: 'Payouts scale based on your exact working hours and city tier.',
      feat3: 'Predictive Fraud Engine', feat3D: 'Ensures genuine claims by matching GPS trails to weather telemetry.',
      trustTag: 'Trusted by 2,000+ delivery partners across Mumbai & Delhi.'
    },
    hi: {
      heroTitle: 'हर डिलीवरी सुरक्षित।', heroGradient: 'हर वर्कर सुरक्षित।', heroEnd: 'हर दिन।',
      heroSub: "गिग वर्कर्स के लिए भारत का पहला AI-संचालित इनकम प्रोटेक्शन। ऑटोमैटिक वेदर ट्रिगर, तुरंत UPI भुगतान, और मात्र ₹29/सप्ताह से शुरू होने वाले प्लान।",
      cta: user ? 'डैशबोर्ड पर जाएं' : 'मेरी डेली कवरेज जांचें',
      ctaMicro: 'केवल 60 सेकंड लगते हैं • कोई कागजी कार्रवाई नहीं',
      actionTitle: 'वह बीमा जो आपके लिए सोचता है',
      actionBadge: 'पेआउट ट्रिगर: एक्टिव • आज ₹150 क्लेम उपलब्ध',
      feat1: 'ऑटोमैटिक वेदर ट्रिगर', feat1D: 'बैकग्राउंड प्रोसेस हर घंटे AQI और बारिश की निगरानी करती है—कोई ऐप खोलने की जरूरत नहीं।',
      feat2: 'डायनामिक इनकम मल्टीप्लायर', feat2D: 'भुगतान आपके सटीक कार्य घंटों और शहर के टियर के आधार पर बढ़ता है।',
      feat3: 'भविष्य कहनेवाला धोखाधड़ी इंजन', feat3D: 'जीपीएस ट्रेल्स को मौसम टेलीमेट्री से मिलाकर असली दावों को सुनिश्चित करता है।',
      trustTag: 'मुंबई और दिल्ली में 2,000+ डिलीवरी पार्टनर्स द्वारा भरोसेमंद।'
    }
  }[lang];

  return (
    <div style={{ background: theme === 'light' ? '#FFFFFF' : '#0F172A', color: theme === 'light' ? '#111827' : '#F8FAFC', minHeight: '100vh', transition: 'background 0.3s' }}>
      {/* Top Navbar specifically for Landing Page Controls */}
      <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'flex-end', gap: 12, borderBottom: `1px solid ${theme === 'light' ? '#F1F5F9' : '#1E293B'}` }}>
        <button onClick={() => setLang(lang === 'en' ? 'hi' : 'en')} style={{ background: theme === 'light' ? '#F1F5F9' : '#1E293B', color: theme === 'light' ? '#111827' : '#F8FAFC', padding: '6px 12px', borderRadius: 20, border: 'none', fontWeight: 600, cursor: 'pointer' }}>
          {lang === 'en' ? 'A / अ (Hindi)' : 'A / अ (English)'}
        </button>
        <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} style={{ background: theme === 'light' ? '#F1F5F9' : '#1E293B', color: theme === 'light' ? '#111827' : '#F8FAFC', padding: '6px 12px', borderRadius: 20, border: 'none', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />} {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
        </button>
      </div>

      <section style={{ padding: '100px 24px 60px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* Only show gradients if dark, or very faint if light to keep it crisp */}
        <div style={{ position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, background: theme === 'dark' ? 'rgba(79,70,229,0.15)' : 'rgba(79,70,229,0.03)', filter: 'blur(80px)', borderRadius: '50%', zIndex: 0 }} />
        
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 800, margin: '0 auto' }}>
          <motion.div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', background: 'var(--success-bg)', color: 'var(--success)', borderRadius: 20, fontSize: 13, fontWeight: 600, marginBottom: 24, border: '1px solid var(--success-border)' }} {...fadeUp}>
            <TrendingUp size={14} /> AI-Powered Income Protection
          </motion.div>

          <motion.h1 style={{ fontSize: 'clamp(40px, 6vw, 64px)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 24 }} {...fadeUp} transition={{ delay: 0.1 }}>
            {t.heroTitle} <span style={{ color: 'var(--primary)' }}>{t.heroGradient}</span> {t.heroEnd}
          </motion.h1>

          <motion.p style={{ fontSize: 18, color: theme === 'light' ? '#4B5563' : '#94A3B8', maxWidth: 640, margin: '0 auto 40px', lineHeight: 1.6 }} {...fadeUp} transition={{ delay: 0.2 }}>
            {t.heroSub}
          </motion.p>

          <motion.div {...fadeUp} transition={{ delay: 0.3 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <Link to={user ? "/dashboard" : "/auth"} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'var(--primary)', color: '#fff', padding: '16px 32px', borderRadius: 12, fontSize: 18, fontWeight: 700, textDecoration: 'none', boxShadow: '0 8px 24px rgba(79,70,229,0.25)', transition: 'transform 0.2s' }}>
              {t.cta} <ArrowRight size={20} />
            </Link>
            <div style={{ fontSize: 13, color: theme === 'light' ? '#6B7280' : '#94A3B8', fontWeight: 500 }}>
              {t.ctaMicro}
            </div>
          </motion.div>

          {/* Social Proof */}
          <motion.div style={{ marginTop: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }} {...fadeUp} transition={{ delay: 0.5 }}>
            <div style={{ display: 'flex' }}>
              {['https://i.pravatar.cc/100?img=11', 'https://i.pravatar.cc/100?img=12', 'https://i.pravatar.cc/100?img=33', 'https://i.pravatar.cc/100?img=44'].map((url, i) => (
                <img key={i} src={url} alt="driver" style={{ width: 44, height: 44, borderRadius: '50%', border: `3px solid ${theme === 'light' ? '#FFF' : '#0F172A'}`, marginLeft: i > 0 ? -12 : 0 }} />
              ))}
              <div style={{ width: 44, height: 44, borderRadius: '50%', border: `3px solid ${theme === 'light' ? '#FFF' : '#0F172A'}`, marginLeft: -12, background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>+2k</div>
            </div>
            <div style={{ fontSize: 14, fontWeight: 500, color: theme === 'light' ? '#4B5563' : '#94A3B8' }}>{t.trustTag}</div>
          </motion.div>
        </div>
      </section>

      {/* Actionable Insights Board */}
      <section style={{ padding: '0 24px 60px' }}>
        <motion.div style={{ maxWidth: 900, margin: '0 auto', background: theme === 'light' ? '#FFF' : '#1E293B', borderRadius: 24, padding: 32, boxShadow: theme === 'light' ? '0 20px 40px rgba(0,0,0,0.08)' : '0 20px 40px rgba(0,0,0,0.3)', border: `1px solid ${theme === 'light' ? '#E2E8F0' : '#334155'}` }} {...fadeUp}>
           <div style={{ textAlign: 'center', marginBottom: 32 }}>
             <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>{t.actionTitle}</h2>
             
             {/* Actionable Badge */}
             <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: 12, fontWeight: 700, border: '1px solid var(--danger-border)' }}>
                <Zap size={18} fill="currentColor" /> {t.actionBadge}
             </div>
           </div>

           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24 }}>
              {[
                { i: <CloudRain size={24} />, title: t.feat1, desc: t.feat1D, c: '#4F46E5' },
                { i: <Clock size={24} />, title: t.feat2, desc: t.feat2D, c: '#059669' },
                { i: <MapPin size={24} />, title: t.feat3, desc: t.feat3D, c: '#D97706' },
              ].map((f, idx) => (
                <div key={idx} style={{ padding: 20, background: theme === 'light' ? '#F8FAFC' : '#0F172A', borderRadius: 16 }}>
                  <div style={{ color: f.c, marginBottom: 16 }}>{f.i}</div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
                  <p style={{ fontSize: 14, color: theme === 'light' ? '#4B5563' : '#94A3B8', lineHeight: 1.5 }}>{f.desc}</p>
                </div>
              ))}
           </div>
        </motion.div>
      </section>
      
      {/* Footer */}
      <footer style={{ padding: '40px', textAlign: 'center', borderTop: `1px solid ${theme === 'light' ? '#E2E8F0' : '#1E293B'}`, color: theme === 'light' ? '#64748B' : '#94A3B8' }}>
        <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 8 }}>© 2026 ShramSuraksha · Income Protection for the Gig Economy</p>
        <p style={{ fontSize: 12 }}>Built for Guidewire DEVTrails 2026</p>
      </footer>
    </div>
  );
}

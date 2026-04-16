import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Zap, TrendingUp, CloudRain, Clock, MapPin, CheckCircle2, ArrowRight, Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

const fadeUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 } };
const stagger = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } };

export default function LandingPage({ user }) {
  const [lang, setLang] = useState('en');

  const dict = {
    en: {
      heroBadge: 'AI-Powered Parametric Insurance',
      heroTitle: 'Protect Every Delivery.', heroGradient: 'Every Worker.', heroEnd: 'Every Day.',
      heroSub: "India's first AI-powered income protection for gig delivery workers. Automated weather triggers, instant UPI payouts, and weekly plans starting at just ₹29/week.",
      cta: user ? 'Go to Dashboard' : 'Check My Daily Coverage',
      ctaMicro: 'Takes 60 seconds • No paperwork needed',
      trustTags: ['IMD Verified Data', 'UPI Instant Payout', 'Gemini AI Engine', 'Zero Paperwork'],
      trustTagProof: 'Trusted by 2,000+ delivery partners across Mumbai & Delhi.',
      statsLabelWeek: 'Paid This Week', statsLabelAvg: 'Avg. Settlement', statsLabelApprv: 'Claims Approved', statsLabelSafe: 'Workers Protected',
      hwLabel: 'HOW IT WORKS', hwTitle: 'Insurance That ', hwTitleG: 'Thinks', hwTitleEnd: ' For You',
      hwDesc: 'Our AI continuously monitors weather, AQI, and disruption data. When conditions cross parametric thresholds, your claim is auto-triggered and payout is instant.',
      actionBadge: 'Payout Trigger: Active • ₹150 Claim Available Today',
      features: [
        { icon: <CloudRain size={24} />, title: 'Automated Weather Triggers', desc: 'Background processes monitor AQI & rainfall hourly—no apps to open.', color: 'var(--primary)', bg: 'var(--primary-bg)' },
        { icon: <Zap size={24} />, title: 'Instant Payouts', desc: 'Claims settled in under 90 seconds. Money credited directly to UPI — zero paperwork.', color: 'var(--warning)', bg: 'var(--warning-bg)' },
        { icon: <Shield size={24} />, title: 'Dynamic Income Multipliers', desc: 'Payouts scale based on your exact working hours and city tier.', color: 'var(--success)', bg: 'var(--success-bg)' },
        { icon: <MapPin size={24} />, title: 'Predictive Fraud Engine', desc: 'Ensures genuine claims by matching GPS trails to weather telemetry.', color: 'var(--danger)', bg: 'var(--danger-bg)' },
        { icon: <Clock size={24} />, title: 'Weekly Coverage', desc: 'Plans from ₹29/week matching gig worker payout cycles. Cancel anytime.', color: 'var(--teal)', bg: 'var(--teal-bg)' }
      ],
      flowLabel: 'THE FLOW', flowTitle: '3 Steps to Protection',
      steps: [
        { step: '01', title: 'Sign Up', desc: 'Enter your details and delivery platform. Takes 30 seconds.', emoji: '📱' },
        { step: '02', title: 'Choose Plan', desc: 'AI recommends the best weekly plan for your zone & risk profile.', emoji: '🛡️' },
        { step: '03', title: 'Stay Protected', desc: 'Automatic triggers detect disruptions and payout is instant via UPI.', emoji: '⚡' },
      ],
      bottomTitle: 'Ready to Protect Your Earnings?',
      bottomDesc: 'Join thousands of delivery workers who never worry about lost income from weather disruptions.',
      bottomCta: user ? 'Go to Dashboard' : 'Start Free — Activate in 30s',
      copy: '© 2026 ShramSuraksha · Built for Guidewire DEVTrails 2026 · Team Era',
      subCopy: "AI-Powered Parametric Income Protection"
    },
    hi: {
      heroBadge: 'AI-संचालित पैरामीट्रिक बीमा',
      heroTitle: 'हर डिलीवरी सुरक्षित।', heroGradient: 'हर वर्कर सुरक्षित।', heroEnd: 'हर दिन।',
      heroSub: "गिग वर्कर्स के लिए भारत का पहला AI-संचालित इनकम प्रोटेक्शन। ऑटोमैटिक वेदर ट्रिगर, तुरंत UPI भुगतान, और मात्र ₹29/सप्ताह से शुरू होने वाले प्लान।",
      cta: user ? 'डैशबोर्ड पर जाएं' : 'मेरी डेली कवरेज जांचें',
      ctaMicro: 'केवल 60 सेकंड लगते हैं • कोई कागजी कार्रवाई नहीं',
      trustTags: ['IMD सत्यापित डेटा', 'UPI तुरंत भुगतान', 'Gemini AI इंजन', 'जीरो कागजी कार्रवाई'],
      trustTagProof: 'मुंबई और दिल्ली में 2,000+ डिलीवरी पार्टनर्स द्वारा भरोसेमंद।',
      statsLabelWeek: 'इस सप्ताह भुगतान किया गया', statsLabelAvg: 'औसत निपटान (Avg. Settlement)', statsLabelApprv: 'दावे स्वीकृत (Approved)', statsLabelSafe: 'वर्कर सुरक्षित',
      hwLabel: 'यह कैसे काम करता है', hwTitle: 'बीमा जो आपके लिए ', hwTitleG: 'सोचता', hwTitleEnd: ' है',
      hwDesc: 'हमारा AI मौसम, AQI और अन्य डेटा की निगरानी करता है। जब सीमा पार होती है, तो दावा अपने आप ट्रिगर हो जाता है।',
      actionBadge: 'पेआउट ट्रिगर: एक्टिव • आज ₹150 क्लेम उपलब्ध',
      features: [
        { icon: <CloudRain size={24} />, title: 'ऑटोमैटिक वेदर ट्रिगर', desc: 'बैकग्राउंड प्रोसेस हर घंटे AQI और बारिश की निगरानी करती है—कोई ऐप खोलने की जरूरत नहीं।', color: 'var(--primary)', bg: 'var(--primary-bg)' },
        { icon: <Zap size={24} />, title: 'तुरंत भुगतान', desc: 'दावे 90 सेकंड में निपटाए जाते हैं। पैसा सीधे UPI में—कोई कागजी कार्रवाई नहीं।', color: 'var(--warning)', bg: 'var(--warning-bg)' },
        { icon: <Shield size={24} />, title: 'डायनामिक इनकम मल्टीप्लायर', desc: 'भुगतान आपके सटीक कार्य घंटों और शहर के टियर के आधार पर बढ़ता है।', color: 'var(--success)', bg: 'var(--success-bg)' },
        { icon: <MapPin size={24} />, title: 'धोखाधड़ी पहचान इंजन (Fraud Check)', desc: 'जीपीएस ट्रेल्स को मौसम डेटा से मिलाकर असली दावों को सुनिश्चित करता है।', color: 'var(--danger)', bg: 'var(--danger-bg)' },
        { icon: <Clock size={24} />, title: 'साप्ताहिक कवरेज', desc: '₹29/हफ्ते से शुरू प्लान, जो आपके पेआउट साइकिल से मेल खाते हैं।', color: 'var(--teal)', bg: 'var(--teal-bg)' }
      ],
      flowLabel: 'प्रक्रिया (THE FLOW)', flowTitle: 'सुरक्षा के 3 कदम',
      steps: [
        { step: '01', title: 'साइन अप करें', desc: 'अपना विवरण और डेलीवरी प्लेटफ़ॉर्म दर्ज करें। 30 सेकंड लगते हैं।', emoji: '📱' },
        { step: '02', title: 'प्लान चुनें', desc: 'AI आपके ज़ोन और रिस्क प्रोफ़ाइल के लिए सबसे अच्छा साप्ताहिक प्लान सुझाता है।', emoji: '🛡️' },
        { step: '03', title: 'सुरक्षित रहें', desc: 'ऑटोमैटिक ट्रिगर व्यवधानों का पता लगाते हैं और UPI के जरिए तुरंत भुगतान होता है।', emoji: '⚡' },
      ],
      bottomTitle: 'अपनी कमाई सुरक्षित करने के लिए तैयार हैं?',
      bottomDesc: 'उन हजारों डिलीवरी वर्कर्स से जुड़ें जो मौसम की वजह से कमाई के नुकसान की चिंता कभी नहीं करते।',
      bottomCta: user ? 'डैशबोर्ड पर जाएं' : 'मुफ़्त शुरू करें — 30 सेकंड में एक्टिव',
      copy: '© 2026 ShramSuraksha · Guidewire DEVTrails 2026 के लिए निर्मित · टीम एरा',
      subCopy: "गिग इकॉनमी के लिए AI-संचालित इनकम प्रोटेक्शन"
    }
  };

  const t = dict[lang];

  const stats = [
    { value: '₹12.4L', label: t.statsLabelWeek, color: 'var(--primary)' },
    { value: '<90s', label: t.statsLabelAvg, color: 'var(--success)' },
    { value: '98%', label: t.statsLabelApprv, color: 'var(--teal)' },
    { value: '4,821', label: t.statsLabelSafe, color: '#8B5CF6' },
  ];

  return (
    <div>
      {/* Settings navbar purely for Landing page demonstration */}
      <div style={{ position: 'absolute', top: 16, right: 24, zIndex: 10 }}>
        <button onClick={() => setLang(lang === 'en' ? 'hi' : 'en')} style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', padding: '6px 16px', borderRadius: 20, border: '1px solid var(--border)', fontWeight: 600, cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}>
          {lang === 'en' ? 'A / अ (Hindi)' : 'A / अ (English)'}
        </button>
      </div>

      {/* Hero */}
      <section className="landing-hero">
        <div className="hero-bg-orb" style={{ width: 600, height: 600, top: -200, right: -100, background: 'rgba(79,70,229,0.12)' }} />
        <div className="hero-bg-orb" style={{ width: 400, height: 400, bottom: -100, left: -100, background: 'rgba(13,148,136,0.1)' }} />
        
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 800, margin: '0 auto' }}>
          <motion.div className="hero-badge" {...fadeUp}>
            <TrendingUp size={14} /> {t.heroBadge}
          </motion.div>

          <motion.h1 className="hero-title" {...fadeUp} transition={{ delay: 0.1, duration: 0.7 }}>
            {t.heroTitle}{' '}
            <span className="gradient-text">{t.heroGradient}</span>{' '}
            {t.heroEnd}
          </motion.h1>

          <motion.p className="hero-sub" {...fadeUp} transition={{ delay: 0.2, duration: 0.7 }}>
            {t.heroSub}
          </motion.p>

          <motion.div className="hero-ctas" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }} {...fadeUp} transition={{ delay: 0.3, duration: 0.7 }}>
            <Link to={user ? "/dashboard" : "/auth"} className="btn btn-primary btn-lg" style={{ width: '100%', maxWidth: 300, display: 'flex', justifyContent: 'center' }}>
              {t.cta} <ArrowRight size={18} />
            </Link>
            <div style={{ fontSize: 13, color: 'var(--text-tertiary)', fontWeight: 500 }}>
              {t.ctaMicro}
            </div>
          </motion.div>

          {/* Social Proof */}
          <motion.div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }} {...fadeUp} transition={{ delay: 0.4 }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              {['https://i.pravatar.cc/100?img=11', 'https://i.pravatar.cc/100?img=12', 'https://i.pravatar.cc/100?img=33', 'https://i.pravatar.cc/100?img=44'].map((url, i) => (
                <img key={i} src={url} alt="driver" style={{ width: 40, height: 40, borderRadius: '50%', border: `2px solid var(--bg-primary)`, marginLeft: i > 0 ? -12 : 0 }} />
              ))}
              <div style={{ width: 40, height: 40, borderRadius: '50%', border: `2px solid var(--bg-primary)`, marginLeft: -12, background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>+2k</div>
            </div>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>{t.trustTagProof}</div>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 32, flexWrap: 'wrap' }}
            {...fadeUp} transition={{ delay: 0.5 }}
          >
            {t.trustTags.map((tag, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
                <CheckCircle2 size={14} color="var(--success)" /> {tag}
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
      <section id="features" className="section">
        <motion.div style={{ textAlign: 'center' }} {...fadeUp}>
          <div className="section-label">{t.hwLabel}</div>
          <h2 className="section-title" style={{ maxWidth: 500, margin: '0 auto 8px' }}>
            {t.hwTitle} <span className="gradient-text">{t.hwTitleG}</span> {t.hwTitleEnd}
          </h2>
          <p className="section-desc" style={{ margin: '0 auto', marginBottom: 24 }}>
            {t.hwDesc}
          </p>

          {/* Actionable Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: 12, fontWeight: 700, border: '1px solid var(--danger-border)', margin: '0 auto 40px' }}>
            <Zap size={18} fill="currentColor" /> {t.actionBadge}
          </div>
        </motion.div>

        <div className="features-grid">
          {t.features.map((f, i) => (
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
      <section id="how-it-works" style={{ padding: '40px 32px 80px', background: 'var(--white)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <motion.div {...fadeUp}>
            <div className="section-label">{t.flowLabel}</div>
            <h2 className="section-title">{t.flowTitle}</h2>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 32, marginTop: 48 }}>
            {t.steps.map((s, i) => (
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
            {t.bottomTitle}
          </h2>
          <p style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 32, lineHeight: 1.6 }}>
            {t.bottomDesc}
          </p>
          <Link to={user ? "/dashboard" : "/auth"} className="btn btn-primary btn-lg">
            {t.bottomCta} <ArrowRight size={18} />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p className="footer-text">
          {t.copy}
        </p>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
          {t.subCopy}
        </p>
      </footer>
    </div>
  );
}

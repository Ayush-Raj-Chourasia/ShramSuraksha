import { useState, useEffect } from "react";

// ═══════════════════════════════════════════════════════════════
// GLOBAL STYLES (Refactored to Dark Mode Standard)
// ═══════════════════════════════════════════════════════════════
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --blue:    #5C84FF;
    --indigo:  #8B5CF6;
    --purple:  #A855F7;
    --green:   #10B981;
    --red:     #EF4444;
    --amber:   #F59E0B;
    --bg0:     #0D111A;
    --bg-gradient: radial-gradient(circle at 50% 20%, rgba(92, 132, 255, 0.15), transparent 60%), #0D111A;
    --bg1:     #121620;
    --card:    #151923;
    --card-inner: #1C212D;
    --border:  rgba(255, 255, 255, 0.08);
    --text-dim: #8B94A3;
    --text-faint: #5C6575;
    --text-main: #FFFFFF;
    --nav-bg:  rgba(13, 17, 26, 0.9);
  }

  html, body {
    font-family: 'Inter', -apple-system, sans-serif;
    background: var(--bg0);
    color: var(--text-main);
    height: 100%;
    -webkit-font-smoothing: antialiased;
  }

  /* ── Layout ── */
  .app {
    max-width: 430px;
    margin: 0 auto;
    min-height: 100vh;
    background: var(--bg-gradient);
    color: var(--text-main);
    position: relative;
    overflow-x: hidden;
    overflow-y: auto;
  }

  .screen {
    min-height: 100vh;
    padding: 48px 24px 100px;
    display: flex;
    flex-direction: column;
    gap: 32px;
    animation: fadeUp 0.3s ease-out both;
  }

  /* ── Keyframes ── */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes countIn {
    from { opacity: 0; transform: scale(0.9) translateY(4px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
  }

  /* ── Components ── */
  .gc {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 20px;
    box-shadow: 0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05);
  }
  .gc-interactive {
    cursor: pointer;
    transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease;
  }
  .gc-interactive:hover {
    transform: translateY(-2px);
    border-color: rgba(255,255,255,0.15);
    background: var(--card-inner);
  }

  /* Badges */
  .badge {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 6px 12px; border-radius: 100px;
    font-size: 11px; font-weight: 700; letter-spacing: 0.3px;
    border: 1px solid transparent;
  }
  .badge-active { background: rgba(16, 185, 129, 0.1); color: var(--green); border-color: rgba(16, 185, 129, 0.3); }
  .badge-alert { background: rgba(239, 68, 68, 0.1); color: var(--red); border-color: rgba(239, 68, 68, 0.3); }
  .dot { width: 6px; height: 6px; border-radius: 50%; }
  .dot-green { background: var(--green); }
  .dot-red { background: var(--red); }

  /* Buttons */
  .btn-primary {
    background: linear-gradient(90deg, #6085FF, #8B5CF6);
    border: none; border-radius: 16px;
    color: #fff; font-weight: 700; font-size: 15px;
    cursor: pointer; width: 100%; padding: 18px;
    transition: transform 0.1s ease;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    font-family: inherit;
    box-shadow: 0 8px 16px rgba(96, 133, 255, 0.25);
  }
  .btn-primary:active { transform: scale(0.98); }

  .btn-secondary {
    background: var(--card-inner);
    border: 1px solid var(--border);
    border-radius: 16px;
    color: var(--text-main); font-weight: 600; font-size: 15px;
    cursor: pointer; width: 100%; padding: 16px;
    transition: all 0.2s ease; font-family: inherit;
  }
  .btn-secondary:active { transform: scale(0.98); }

  /* Chip */
  .chip {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 14px; border-radius: 100px;
    background: transparent; border: 1px solid var(--border);
    font-size: 12px; font-weight: 600;
    white-space: nowrap;
  }
  .chip-amber { border-color: rgba(245, 158, 11, 0.4); color: #FCD34D; }
  .chip-red { border-color: rgba(239, 68, 68, 0.4); color: #FCA5A5; }
  .chip-green { border-color: rgba(16, 185, 129, 0.4); color: #86EFAC; }

  /* Utilities */
  .text-h1 { font-size: 32px; font-weight: 800; letter-spacing: -1px; line-height: 1.1; color: var(--text-main); }
  .text-h2 { font-size: 20px; font-weight: 700; letter-spacing: -0.3px; }
  .text-label { font-size: 11px; color: var(--text-dim); letter-spacing: 1px; font-weight: 700; text-transform: uppercase; }
  
  .risk-track { height: 6px; border-radius: 6px; background: rgba(255,255,255,0.05); width: 100%; overflow: hidden; margin-top: 8px; }
  .risk-fill { height: 100%; border-radius: 6px; transition: width 0.5s ease; }

  /* Bottom Nav */
  .bottom-nav {
    position: fixed; bottom: 0; left: 50%; transform: translateX(-50%);
    width: 100%; max-width: 430px;
    background: var(--nav-bg);
    backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
    border-top: 1px solid var(--border);
    padding: 12px 16px 24px; z-index: 100;
    display: flex; justify-content: space-between;
  }
  .nav-item {
    flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px;
    cursor: pointer; opacity: 0.5; transition: opacity 0.2s;
  }
  .nav-item.active { opacity: 1; }
  .nav-emoji { font-size: 18px; filter: grayscale(100%); }
  .nav-item.active .nav-emoji { filter: none; }
  .nav-label { font-size: 10px; font-weight: 500; }

  ::-webkit-scrollbar { display: none; }
`;

// ═══════════════════════════════════════════════════════════════
// PRIMITIVE COMPONENTS
// ═══════════════════════════════════════════════════════════════

const RiskGauge = ({ level = "low" }) => {
  const cfg = {
    low:    { color: "var(--green)",  label: "Low Risk",    pct: "28%" },
    medium: { color: "var(--amber)",  label: "Medium Risk", pct: "62%" },
    high:   { color: "var(--red)",    label: "High Risk",   pct: "88%" },
  }[level];
  return (
    <div style={{ width: "100%", marginTop: 24, marginBottom: 24 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
        <span style={{ fontSize:13, color:"var(--text-dim)", fontWeight:600 }}>Risk Level</span>
        <span style={{ fontSize:13, fontWeight:700, color:cfg.color }}>{cfg.label}</span>
      </div>
      <div className="risk-track">
        <div className="risk-fill" style={{ width:cfg.pct, background:cfg.color }} />
      </div>
    </div>
  );
};

const StatBox = ({ val, label, color }) => (
  <div style={{ flex:1, padding:"16px 8px", textAlign:"center", borderRadius:12, background:"var(--card-inner)", border:"1px solid var(--border)" }}>
    <div style={{ fontSize:18, fontWeight:800, color:color }}>{val}</div>
    <div style={{ fontSize:10, color:"var(--text-faint)", marginTop:4, fontWeight:700 }}>{label}</div>
  </div>
);

const StatCompact = ({ val, label }) => (
  <div className="gc" style={{ flex:1, padding:"16px 12px", textAlign:"center", borderRadius: 12 }}>
    <div style={{ fontSize:18, fontWeight:700, color:"var(--text-main)" }}>{val}</div>
    <div style={{ fontSize:11, color:"var(--text-faint)", marginTop:4 }}>{label}</div>
  </div>
);

const TrustItem = ({ val, label, color }) => (
  <div style={{ textAlign:"center", flex: 1 }}>
    <div style={{ fontSize:18, fontWeight:800, color:color }}>{val}</div>
    <div style={{ fontSize:10, color:"var(--text-faint)", marginTop:4, fontWeight:700 }}>{label}</div>
  </div>
);

const ChipRow = ({ chips }) => (
  <div style={{ display:"flex", gap:10, overflowX:"auto", paddingBottom:4, marginLeft: -4, paddingLeft: 4 }}>
    {chips.map((c, i) => (
      <div key={i} className={`chip chip-${c.type || ""}`}>{c.icon} {c.label}</div>
    ))}
  </div>
);

const Toggle = ({ value, onChange }) => (
  <div
    style={{
      width:44, height:24, borderRadius:100, position:"relative", cursor:"pointer", flexShrink:0,
      background: value ? "var(--blue)" : "var(--border)"
    }}
    onClick={() => onChange(!value)}
  >
    <div style={{
      position:"absolute", top:2, width:20, height:20, borderRadius:"50%",
      background:"#fff", transition:"left .2s ease",
      left: value ? 22 : 2
    }} />
  </div>
);

// ═══════════════════════════════════════════════════════════════
// SCREEN 1 — DASHBOARD
// ═══════════════════════════════════════════════════════════════
const DashboardScreen = ({ goTo }) => {
  return (
    <div className="screen" style={{ gap: 24 }}>
      
      {/* ── Header ── */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <p className="text-label" style={{ marginBottom:8, color:"var(--text-faint)", letterSpacing:"1px" }}>GOOD MORNING, RAHUL 🌞</p>
          <h1 className="text-h1">
            You're Protected<br/>
            <span style={{ color: "var(--blue)" }}>Today ✦</span>
          </h1>
        </div>
        <div style={{ textAlign:"right", display:"flex", flexDirection:"column", alignItems:"flex-end", gap:6 }}>
          <span className="badge badge-active"><span className="dot dot-green" /> Active</span>
          <span style={{ fontSize:11, color:"var(--text-faint)" }}>Zone 4B · Mumbai</span>
        </div>
      </div>

      {/* ── Big Hero Card ── */}
      <div className="gc" style={{ padding: "24px" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p className="text-label" style={{ marginBottom:12 }}>TODAY'S COVERAGE</p>
            <div style={{ display:"flex", alignItems:"flex-end", animation: "countIn 0.4s ease-out both" }}>
              <span style={{ fontSize:20, color:"var(--blue)", fontWeight:700, marginBottom:8, marginRight:4 }}>₹</span>
              <span style={{ fontSize:64, fontWeight:800, letterSpacing:"-2px", lineHeight:1, color:"var(--text-main)" }}>850</span>
              <span style={{ fontSize:14, color:"var(--text-faint)", fontWeight:600, marginBottom:8, marginLeft:4 }}>/day</span>
            </div>
          </div>

          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
            <div style={{ width:48, height:48, borderRadius:16, background:"rgba(16,185,129,0.1)", border:"1px solid rgba(16,185,129,0.2)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <span style={{ fontSize:24 }}>🛡️</span>
            </div>
            <span style={{ fontSize:10, color:"var(--green)", fontWeight:800, letterSpacing:"0.5px" }}>ACTIVE</span>
          </div>
        </div>

        <RiskGauge level="low" />

        {/* ── Compact Stats Row inside Hero ── */}
        <div style={{ display:"flex", gap:10 }}>
          <StatBox val="12" label="Days Protected" color="var(--blue)" />
          <StatBox val="₹480" label="Last Payout" color="var(--green)" />
          <StatBox val="87s" label="Avg Settle" color="var(--purple)" />
        </div>

      </div>

      {/* ── Primary CTAs ── */}
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        <button className="btn-primary" onClick={() => goTo("claims")}>
          ⚡ Check My Protection
        </button>
        <button className="btn-secondary" onClick={() => goTo("claims")}>
          📄 View Claim Status
        </button>
      </div>

      {/* ── Condition Chips ── */}
      <div>
        <p className="text-label" style={{ marginBottom:12 }}>TODAY'S CONDITIONS</p>
        <ChipRow chips={[
          { icon:"🌧️", label:"Rain Alert",    type:"amber" },
          { icon:"🌫️", label:"AQI: 158",      type:"red"   },
          { icon:"📍", label:"Zone 4B: Low",  type:"green" },
          { icon:"🌡️", label:"38°C",          type:"red"   },
        ]} />
      </div>

      {/* ── Trust Metrics ── */}
      <div className="gc" style={{ padding:"24px 20px", display:"flex", justifyContent:"space-between", alignItems:"center", marginTop: 8 }}>
        <TrustItem val="₹12.4L" label="Paid This Week" color="var(--blue)" />
        <div style={{ width:1, height: 40, background:"var(--border)" }} />
        <TrustItem val="98%" label="Claims < 90s" color="var(--green)" />
        <div style={{ width:1, height: 40, background:"var(--border)" }} />
        <TrustItem val="4,821" label="Workers Safe" color="var(--purple)" />
      </div>

    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// SCREEN 2 — CLAIMS / PAYOUT
// ═══════════════════════════════════════════════════════════════
const ClaimsScreen = () => {
  const [view, setView] = useState("flow"); 

  if (view === "flow") return (
    <div className="screen">
      <div>
        <h2 className="text-h2" style={{ marginBottom:6 }}>File a Claim</h2>
        <p style={{ fontSize:13, color:"var(--text-dim)" }}>Auto-detected · 1-tap fast submit</p>
      </div>

      <div className="gc" style={{ padding: 24 }}>
        <p className="text-label" style={{ color:"var(--blue)", marginBottom:8 }}>STEP 1 — AUTO DETECTED</p>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <div>
            <div style={{ fontSize:16, fontWeight:700 }}>Heavy Rainfall</div>
            <div style={{ fontSize:12, color:"var(--text-dim)", marginTop:4 }}>Andheri · 10:42 AM</div>
          </div>
          <span className="badge badge-active"><span className="dot dot-green"/> Verified</span>
        </div>
        
        <div style={{ padding:"16px", background:"rgba(92,132,255,0.05)", borderRadius:12, display:"flex", justifyContent:"space-between" }}>
          <div>
            <div style={{ fontSize:11, color:"var(--text-dim)", marginBottom:4 }}>Rainfall</div>
            <div style={{ fontSize:15, fontWeight:700, color:"var(--blue)" }}>34.2 mm/hr</div>
          </div>
          <div style={{ width:1, background:"var(--border)" }} />
          <div>
            <div style={{ fontSize:11, color:"var(--text-dim)", marginBottom:4 }}>Payout</div>
            <div style={{ fontSize:15, fontWeight:700, color:"var(--green)" }}>₹480</div>
          </div>
        </div>
      </div>

      <div className="gc" style={{ padding: 24 }}>
        <p className="text-label" style={{ marginBottom:12 }}>STEP 2 — CONFIRMATION</p>
        <div style={{ fontSize:16, fontWeight:700, marginBottom:8 }}>Were you working today?</div>
        <div style={{ fontSize:13, color:"var(--text-dim)", marginBottom:20 }}>GPS confirms you were active.</div>
        <div style={{ display:"flex", gap:12 }}>
          <button
            onClick={() => setView("confirm")}
            style={{ flex:1, padding:"14px", background:"rgba(16,185,129,0.1)", border:"1px solid rgba(16,185,129,0.2)", borderRadius:12, color:"var(--green)", fontWeight:600, fontSize:14, cursor:"pointer" }}
          >✓ Yes, I was</button>
          <button style={{ flex:1, padding:"14px", background:"var(--card)", border:"1px solid var(--border)", borderRadius:12, color:"var(--text-dim)", fontWeight:500, fontSize:14, cursor:"pointer" }}>✗ No</button>
        </div>
      </div>

      <div style={{ padding:"16px", background:"rgba(245,158,11,0.05)", border:"1px solid rgba(245,158,11,0.1)", borderRadius:12, display:"flex", gap:12, alignItems:"center" }}>
        <span style={{ fontSize:18 }}>📵</span>
        <div>
          <div style={{ fontSize:13, fontWeight:600, color:"var(--amber)" }}>Offline mode ready</div>
          <div style={{ fontSize:12, color:"var(--text-dim)", marginTop:2 }}>Will auto-submit when network returns</div>
        </div>
      </div>
    </div>
  );

  if (view === "confirm") return (
    <div className="screen" style={{ justifyContent: "center" }}>
      <div style={{ textAlign:"center", padding:"40px 0" }}>
        <div style={{ fontSize:40, marginBottom:24 }}>⚡</div>
        <div style={{ fontSize:14, color:"var(--text-dim)", marginBottom:8 }}>CONFIRM PAYOUT</div>
        <div style={{ fontSize:64, fontWeight:800, color:"var(--text-main)", lineHeight:1, marginBottom:16 }}>₹480</div>
        <div style={{ fontSize:13, color:"var(--text-dim)", marginBottom:32 }}>To be credited instantly via UPI.</div>
        
        <button className="btn-primary" style={{ marginBottom:12 }} onClick={() => setView("payout")}>
          Submit Claim
        </button>
        <button className="btn-secondary" onClick={() => setView("flow")}>Cancel</button>
      </div>
    </div>
  );

  return (
    <div className="screen">
      <div style={{ textAlign:"center", padding:"40px 0 20px" }}>
        <p className="text-label" style={{ marginBottom:8 }}>PAYOUT SETTLED</p>
        <div style={{ fontSize:64, fontWeight:800, color:"var(--text-main)", lineHeight:1, marginBottom:16 }}>₹480</div>
        <div style={{ fontSize:14, color:"var(--text-dim)" }}>
          Credited to UPI in <span style={{ color:"var(--green)", fontWeight:600 }}>87s</span>
        </div>
      </div>

      <div className="gc" style={{ padding:"24px" }}>
        {[ 
          { label:"Trigger Detected", desc:"IMD Verified 34.2mm/hr", time:"10:42 AM" },
          { label:"Claim Verified",   desc:"GPS checked", time:"10:43 AM" },
          { label:"Paid",             desc:"Credited successfully", time:"10:45 AM" },
        ].map((s, i, arr) => (
          <div key={i} style={{ display:"flex", gap:16, position:"relative", paddingBottom: i < arr.length-1 ? 24 : 0 }}>
            {i < arr.length-1 && <div style={{ position:"absolute", left:12, top:30, bottom:0, width:1, background:"var(--border)" }} />}
            <div style={{ width:24, height:24, borderRadius:"50%", background:"var(--blue)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, zIndex:1 }}>✓</div>
            <div style={{ flex:1, transform:"translateY(-2px)" }}>
              <div style={{ display:"flex", justifyContent:"space-between" }}>
                <span style={{ fontSize:14, fontWeight:600 }}>{s.label}</span>
                <span style={{ fontSize:11, color:"var(--text-faint)" }}>{s.time}</span>
              </div>
              <div style={{ fontSize:12, color:"var(--text-dim)", marginTop:4 }}>{s.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <button className="btn-primary" onClick={() => setView("flow")}>Done</button>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// SCREEN 3 — PLANS
// ═══════════════════════════════════════════════════════════════
const PlansScreen = () => {
  const [sel, setSel] = useState(1);
  const plans = [
    { id:0, price:29,  cov:300,  label:"Basic" },
    { id:1, price:59,  cov:850,  label:"Standard", badge:"POPULAR" },
    { id:2, price:119, cov:1800, label:"Premium" },
  ];

  return (
    <div className="screen">
      <div>
        <h2 className="text-h2" style={{ marginBottom:6 }}>Protection Plans</h2>
        <p style={{ fontSize:13, color:"var(--text-dim)" }}>Weekly subscription · Cancel anytime</p>
      </div>

      <div style={{ display:"flex", gap:12 }}>
        {plans.map(p => (
          <div
            key={p.id}
            className="gc gc-interactive"
            style={{
              flex:1, padding:"20px 12px", textAlign:"center", position:"relative",
              borderColor: sel===p.id ? "var(--blue)" : "var(--border)",
              background:  sel===p.id ? "rgba(92,132,255,0.05)" : "var(--card)"
            }}
            onClick={() => setSel(p.id)}
          >
            {p.badge && (
              <div style={{ position:"absolute", top:-8, left:"50%", transform:"translateX(-50%)", background:"var(--blue)", borderRadius:100, padding:"2px 8px", fontSize:9, fontWeight:700 }}>{p.badge}</div>
            )}
            <div style={{ fontSize:11, color:"var(--text-faint)", fontWeight:600, marginBottom:8 }}>{p.label.toUpperCase()}</div>
            <div style={{ fontSize:24, fontWeight:700, color:"var(--text-main)" }}>₹{p.price}</div>
            <div style={{ fontSize:11, color:"var(--text-dim)", marginTop:2 }}>/week</div>
            <div style={{ width:"100%", height:1, background:"var(--border)", margin:"16px 0" }} />
            <div style={{ fontSize:13, fontWeight:600 }}>₹{p.cov}</div>
            <div style={{ fontSize:10, color:"var(--text-faint)", marginTop:2 }}>coverage</div>
          </div>
        ))}
      </div>

      <div className="gc" style={{ padding:"20px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <div style={{ fontSize:14, fontWeight:600 }}>AutoPay</div>
          <div style={{ fontSize:12, color:"var(--text-dim)", marginTop:4 }}>Never miss a coverage week</div>
        </div>
        <Toggle value={true} onChange={()=>{}} />
      </div>

      <div className="gc" style={{ padding:"24px", flex:1 }}>
        <p className="text-label" style={{ marginBottom:16 }}>ALL PLANS INCLUDE</p>
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {["Parametric — no paperwork", "IMD + AQI data sourced", "UPI payout < 90 seconds", "Cancel anytime"].map((p, i) => (
            <div key={i} style={{ display:"flex", gap:12, alignItems:"center" }}>
              <div style={{ width:16, height:16, borderRadius:"50%", background:"rgba(16,185,129,0.1)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, color:"var(--green)" }}>✓</div>
              <span style={{ fontSize:13, color:"var(--text-dim)" }}>{p}</span>
            </div>
          ))}
        </div>
      </div>

      <button className="btn-primary">
        Activate ₹{plans[sel].price}/week Plan
      </button>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// SCREEN 4 — ALERTS
// ═══════════════════════════════════════════════════════════════
const AlertsScreen = () => {
  const alerts = [
    { icon:"🌧️", title:"Heavy Rainfall", desc:"34mm/hr expected 2–5 PM.", time:"10m ago", tag:"₹480 triggered", type:"red" },
    { icon:"🌫️", title:"AQI Severe", desc:"Mask advisory issued.", time:"1h ago", tag:"₹200 active", type:"amber" },
    { icon:"⚡", title:"Payout Processed", desc:"Claim was settled.", time:"2h ago", tag:"Credited ✅", type:"green" },
    { icon:"📍", title:"Zone Risk Updated", desc:"Downgraded to Low.", time:"1d ago", tag:"Maintained", type:"green" },
  ];

  return (
    <div className="screen">
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
        <div>
          <h2 className="text-h2" style={{ marginBottom:6 }}>Alerts</h2>
          <p style={{ fontSize:13, color:"var(--text-dim)" }}>Real-time parametric triggers</p>
        </div>
        <span className="badge badge-alert"><span className="dot dot-red" /> 2 Active</span>
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:16, marginTop:8 }}>
        {alerts.map((a, i) => (
          <div key={i} className="gc" style={{ padding:20, display:"flex", gap:16 }}>
            <div style={{ fontSize:24 }}>{a.icon}</div>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                <span style={{ fontSize:14, fontWeight:600 }}>{a.title}</span>
                <span style={{ fontSize:11, color:"var(--text-faint)" }}>{a.time}</span>
              </div>
              <div style={{ fontSize:13, color:"var(--text-dim)", marginBottom:10 }}>{a.desc}</div>
              <span className={`chip chip-${a.type}`} style={{ fontSize:10 }}>{a.tag}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// SCREEN 5 — ADMIN
// ═══════════════════════════════════════════════════════════════
const AdminScreen = () => {
  return (
    <div className="screen">
      <div>
        <h2 className="text-h2" style={{ marginBottom:6 }}>Admin</h2>
        <p style={{ fontSize:13, color:"var(--text-dim)" }}>Risk intelligence dashboard</p>
      </div>

      <div style={{ padding:"16px 20px", background:"rgba(239,68,68,0.05)", border:"1px solid rgba(239,68,68,0.1)", borderRadius:16, display:"flex", gap:16, alignItems:"center" }}>
        <div style={{ fontSize:20 }}>🤖</div>
        <div>
          <div style={{ fontSize:11, color:"var(--red)", fontWeight:700, marginBottom:4, letterSpacing:"0.5px" }}>AI INSIGHT</div>
          <div style={{ fontSize:13, color:"var(--text-dim)", lineHeight:1.4 }}>High fraud risk in <strong>Zone 2B</strong>. 3 manual flags.</div>
        </div>
      </div>

      <div style={{ display:"flex", gap:12 }}>
        {[ { l:"Workers", v:"4.8k" }, { l:"Loss Ratio", v:"68%" }, { l:"Flags", v:"3" } ].map((k, i) => (
          <StatCompact key={i} label={k.l} val={k.v} />
        ))}
      </div>

      <div className="gc" style={{ padding:24 }}>
        <p className="text-label" style={{ marginBottom:16 }}>VOLUME BREAKDOWN</p>
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          {[ { l:"Claims", v:80, c:"var(--blue)" }, { l:"Settled", v:68, c:"var(--green)" }, { l:"Fraud", v:12, c:"var(--red)" } ].map(b => (
            <div key={b.l}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                <span style={{ fontSize:12, color:"var(--text-dim)" }}>{b.l}</span>
                <span style={{ fontSize:12, fontWeight:600, color:b.c }}>{b.v}%</span>
              </div>
              <div className="risk-track">
                <div className="risk-fill" style={{ width:`${b.v}%`, background:b.c }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="gc" style={{ padding:24 }}>
        <p className="text-label" style={{ marginBottom:16 }}>🚨 FRAUD ALERTS</p>
        {[ { w:"W#4821", z:"Zone 2B", r:"GPS anomaly", risk:"High" }, { w:"W#3204", z:"Zone 3A", r:"Duplicate", risk:"Med" } ].map((row, i) => (
          <div key={i} style={{ padding: i===0 ? "0 0 12px 0" : "12px 0 0 0", borderBottom: i===0 ? "1px solid var(--border)" : "none" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ fontSize:13, fontWeight:600 }}>{row.w} · {row.z}</div>
                <div style={{ fontSize:12, color:"var(--text-dim)", marginTop:4 }}>{row.r}</div>
              </div>
              <span className={`badge ${row.risk==="High" ? "badge-alert" : ""}`} style={{ background: row.risk==="Med" ? "rgba(245,158,11,0.1)" : "", color: row.risk==="Med" ? "var(--amber)" : "" }}>{row.risk}</span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// BOTTOM NAVIGATION
// ═══════════════════════════════════════════════════════════════
const BottomNav = ({ active, setActive }) => {
  const items = [
    { id:"home",   emoji:"⌂", label:"Home" },
    { id:"claims", emoji:"⚡", label:"Claims" },
    { id:"plans",  emoji:"🛡️", label:"Plans" },
    { id:"alerts", emoji:"🔔", label:"Alerts" },
    { id:"admin",  emoji:"📊", label:"Admin" },
  ];
  return (
    <nav className="bottom-nav">
      {items.map(item => (
        <div key={item.id} className={`nav-item ${active === item.id ? "active" : ""}`} onClick={() => setActive(item.id)}>
          <span className="nav-emoji">{item.emoji}</span>
          <span className="nav-label">{item.label}</span>
        </div>
      ))}
    </nav>
  );
};

// ═══════════════════════════════════════════════════════════════
// ROOT APP
// ═══════════════════════════════════════════════════════════════
export default function App() {
  const [screen, setScreen] = useState("home");
  const screenMap = { home: <DashboardScreen goTo={setScreen} />, claims: <ClaimsScreen />, plans: <PlansScreen />, alerts: <AlertsScreen />, admin: <AdminScreen /> };

  return (
    <>
      <style>{STYLES}</style>
      <div className="app">
        <div style={{ position:"relative", zIndex:1 }}>
          {screenMap[screen]}
        </div>
        <BottomNav active={screen} setActive={setScreen} />
      </div>
    </>
  );
}

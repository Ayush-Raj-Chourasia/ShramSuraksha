# 🛡️ ShramSuraksha — श्रम सुरक्षा
### *Parametric Income Protection for India's Invisible Workforce*

> **"Every raindrop that falls on Mumbai costs Ravi ₹80. He never asked for the rain. He shouldn't bear the loss."**

[![Phase](https://img.shields.io/badge/Phase-1%20Seed-blue)]()
[![Hackathon](https://img.shields.io/badge/Guidewire-DEVTrails%202026-orange)]()
[![Status](https://img.shields.io/badge/Status-Active-green)]()

---

## 🧭 Table of Contents

1. [The Real Problem — Beyond the Brief](#1-the-real-problem--beyond-the-brief)
2. [Who Is Ravi? — Hyper-Specific Persona](#2-who-is-ravi--hyper-specific-persona)
3. [Why Q-Commerce, Why Now](#3-why-q-commerce-why-now)
4. [ShramSuraksha — What We Actually Built](#4-shramsuraksha--what-we-actually-built)
5. [Parametric Triggers — Our 6-Signal Engine](#5-parametric-triggers--our-6-signal-engine)
6. [Weekly Premium Model — The Math That Works](#6-weekly-premium-model--the-math-that-works)
7. [AI/ML Architecture — How the Brain Works](#7-aiml-architecture--how-the-brain-works)
8. [Adversarial Defense & Anti-Spoofing Strategy](#8-adversarial-defense--anti-spoofing-strategy-)
9. [System Architecture & Tech Stack](#9-system-architecture--tech-stack)
10. [6-Week Roadmap](#10-6-week-roadmap)
11. [Business Viability](#11-business-viability)
12. [Team](#12-team)

---

## 1. The Real Problem — Beyond the Brief

India has **11.3 million gig delivery workers** as of 2025. The Q-Commerce segment alone — Zepto, Blinkit, Swiggy Instamart — employs over **800,000 active riders** across 40+ cities.

These workers operate under a brutal paradox:

| The Platform Promise | The Worker's Reality |
|---|---|
| Deliver in 10 minutes | No work = no pay. Zero fixed salary. |
| Be available 24/7 | Rain for 3 hours = ₹240 gone. No appeal. |
| Maintain rating above 4.2 | Being late due to floods drops your rating |
| Platform pauses your zone | You still owe your daily expenses |

**The 20-30% income loss figure from the problem statement is conservative.** During Mumbai's July 2024 flooding, Blinkit and Zepto suspended operations in 18 pincodes for 14+ hours. Workers in those zones lost an average of **₹680-900 in a single day** — with zero recourse.

No insurance product in India today covers this. Health insurance doesn't. Motor insurance doesn't. There is a **₹4,200 crore annual income gap** that evaporates from gig worker pockets due to uncontrollable disruptions.

**ShramSuraksha closes this gap. Automatically. In under 90 seconds.**

---

## 2. Who Is Ravi? — Hyper-Specific Persona

> Most teams will say "gig worker." We studied Ravi.

**Primary Persona: Ravi Shankar Yadav**

```
Age:          26
City:         Govandi, Mumbai (flood-prone zone, near Mankhurd)
Platform:     Zepto (primary), Blinkit (backup when Zepto is slow)
Vehicle:      Honda Activa (2019, not insured beyond third-party)
Work Hours:   7 AM – 1 PM and 5 PM – 10 PM (peak slots)
Avg Deliveries/Day: 22–28 orders
Avg Daily Earning:  ₹720–940
Monthly Earning:    ₹17,000–21,000
Monthly Fixed Cost: ₹9,200 (rent ₹5,500, fuel ₹2,100, food ₹1,600)
Safety Margin:      ₹7,800–11,800 (razor thin)
Phone:        Redmi 10C (Android 12, 4G)
UPI App:      PhonePe (primary payment tool)
Savings:      Less than ₹3,000 (less than 3 days of expenses)
```

**What Ravi's week looks like when disruption hits:**

```
Monday:     Normal day → ₹880 earned
Tuesday:    Heavy rain, 4 hours lost → ₹320 earned (₹560 lost)
Wednesday:  AQI 380, Zepto suspends zone → ₹0 earned
Thursday:   Normal → ₹790 earned
Friday:     Normal → ₹850 earned

Week Total: ₹2,840 instead of ₹4,400
Loss:       ₹1,560 (35% of weekly earnings gone)
```

**What ShramSuraksha does:**
- Tuesday: Detects rainfall > 60mm/hr in Govandi → Auto-pays Ravi ₹480 by 2 PM
- Wednesday: AQI breach detected → Auto-pays Ravi ₹600 for the missed shift

**Ravi's actual weekly loss: ₹480 instead of ₹1,560.**

---

**Secondary Persona: Priya Menon**

```
Age:          31
City:         Whitefield, Bengaluru
Platform:     Blinkit (primary)
Unique Context: Single mother, 2 kids. 
               Works morning shift only (6 AM – 12 PM).
               Maximum vulnerable to morning disruptions.
               Extreme heat in April-May kills her earnings.
```

---

## 3. Why Q-Commerce, Why Now

We chose **Grocery/Q-Commerce delivery (Zepto/Blinkit)** as our persona focus. Here's why this is the highest-impact, most defensible choice:

### The 10-Minute Problem Creates a Unique Insurance Case

Q-Commerce workers face a fundamentally different risk profile than food delivery:

| Factor | Food Delivery (Zomato/Swiggy) | Q-Commerce (Zepto/Blinkit) |
|---|---|---|
| Delivery window | 30-45 mins | **8-12 mins** |
| Rain tolerance | Can wait at restaurant | **Cannot. Dark store to door. No shelter stop.** |
| Income model | Per order + surge | Per order, **no surge in bad weather** |
| Platform behavior during disruption | Reduce orders gradually | **Hard-pause entire pincodes** |
| Worker income loss | Gradual decline | **Binary: full earnings or zero** |
| Avg disruption loss per event | ₹200–350 | **₹480–900** |

The binary nature of Q-Commerce disruptions (platform pauses entire zones, not individual orders) makes parametric insurance **perfectly suited** — there's a clear trigger and a clear, calculable loss. No ambiguity, no adjustment needed.

### Market Timing
- January 2026: Blinkit and Zepto dropped the "10-minute promise" after government pressure and worker protests
- Worker welfare is actively debated in Parliament (Gig Worker Welfare Bill, 2025)
- First company to offer this product owns a **massive first-mover advantage**

---

## 4. ShramSuraksha — What We Actually Built

ShramSuraksha is a **parametric income protection platform** — not a traditional insurance product. The distinction matters:

```
Traditional Insurance:
  Worker files claim → Adjuster investigates → 
  Documents requested → 15-30 day review → 
  Payout (if approved) → Worker already in debt

ShramSuraksha Parametric:
  External trigger detected → AI validates worker was active → 
  Fraud engine clears claim → Payout in 90 seconds → 
  Worker has money before the rain stops
```

### Core Value Proposition

> **No forms. No calls. No waiting. If the trigger fires and you were working, you get paid.**

### Platform Scope (What We Cover)

✅ **Covered — Income Loss from:**
- Extreme rainfall (> 50mm/hr, IMD Red Alert issued)
- Severe AQI breach (> 300, platform-verified suspension)
- Heatwave (> 44°C sustained for 2+ hours during work shift)
- Flash floods (IMD/NDMA alert issued for worker's zone)
- Curfew/local unrest (state government notification)
- Platform-mandated zone suspension (verified via platform data)

❌ **Explicitly Excluded:**
- Health, life, accident, or medical claims
- Vehicle repair or damage
- Self-reported disruptions without parametric verification
- Income loss due to worker's own low rating or account suspension

---

## 5. Parametric Triggers — Our 6-Signal Engine

Unlike generic weather APIs, ShramSuraksha uses a **multi-source corroboration model**. A payout only fires when **2+ independent signals** confirm the same disruption event.

### Trigger Architecture

```
                    ┌─────────────────────────────┐
                    │    TRIGGER CORROBORATION     │
                    │    REQUIRES ≥ 2 SIGNALS      │
                    └─────────────────────────────┘
                              │
     ┌────────────────────────┼─────────────────────────┐
     ↓                        ↓                         ↓
SIGNAL 1               SIGNAL 2                   SIGNAL 3
OpenWeatherMap API     CPCB/OpenAQ API             IMD RSS Feed
(Rainfall, Temp,       (AQI by pincode)            (Alerts, Warnings)
 Wind speed)                                        
     │                        │                         │
SIGNAL 4               SIGNAL 5                   SIGNAL 6
Platform Shadow        Crowd-Signal               Cell Network
Demand Proxy           Aggregator                 Congestion
(Zepto/Blinkit         (Twitter/X local           (Unusual drop in
 order velocity        hashtags + news            active sessions
 drops in zone)        API corroboration)         in a pincode)
```

### Trigger Table

| Trigger | Primary Signal | Corroborating Signal | Threshold | Coverage |
|---|---|---|---|---|
| Heavy Rain | OpenWeather: rainfall > 50mm/hr | IMD Red Alert for district | Both required | ₹80/hour lost |
| Severe Pollution | OpenAQ: AQI > 300 | CPCB advisory issued | Both required | ₹70/hour lost |
| Extreme Heat | OpenWeather: temp > 44°C | IMD Heat Alert | Both required | ₹60/hour lost |
| Flash Flood | IMD Flood Warning | Platform demand proxy drop > 70% in zone | Both required | Full shift coverage |
| Zone Curfew | State Gov API / News | Platform zone suspension confirmed | Both required | Full shift coverage |
| Platform Suspension | Platform order velocity = 0 | OpenWeather corroboration | Both required | Full shift coverage |

### Why Multi-Signal Matters
A single API can be wrong, delayed, or manipulated. Two independent signals from different systems being simultaneously wrong in the same way is statistically near-impossible. This isn't just better fraud prevention — it's also better accuracy for genuine workers.

---

## 6. Weekly Premium Model — The Math That Works

### Pricing Philosophy
Ravi earns ₹720-940/day. He cannot afford a premium that feels like a big number. Our pricing is designed around **one principle: the premium must feel like rounding error.**

### Base Premium: ₹35/week

This is less than one cup of chai per day. For Ravi, it's **0.4% of weekly earnings.**

### AI-Adjusted Premium by Zone Risk Score

```
Zone Risk Score (0–100) = Weighted average of:
  • Historical rainfall frequency in pincode (30%)
  • Historical AQI breach frequency (20%)
  • Historical platform suspension events (25%)
  • Flood/waterlogging history (25%)

Score 0–30  (Low Risk)    → ₹29/week  
Score 31–55 (Medium Risk) → ₹39/week
Score 56–75 (High Risk)   → ₹49/week
Score 76–100 (Very High)  → ₹59/week
```

**Example: Govandi, Mumbai (Ravi's zone)**
- High flood history → score: 74
- Premium: ₹49/week
- Maximum weekly payout: ₹600/day × 6 working days = ₹3,600 weekly coverage
- **Premium-to-coverage ratio: 1:73**

### Plan Tiers

| Plan | Weekly Premium | Max Daily Payout | Max Weekly Coverage |
|---|---|---|---|
| Basic Suraksha | ₹29–59 (zone-adjusted) | ₹400 | ₹2,400 |
| Full Suraksha | ₹49–89 (zone-adjusted) | ₹700 | ₹4,200 |
| Suraksha+ | ₹79–119 (zone-adjusted) | ₹1,000 | ₹6,000 |

### Premium Payment Flow
- Deducted automatically every Monday via UPI AutoPay
- Worker can pause for any week (no penalty, just no coverage that week)
- No annual lock-in, no cancellation fee
- Works on Ravi's PhonePe — no new app needed for payment

---

## 7. AI/ML Architecture — How the Brain Works

ShramSuraksha has three distinct AI/ML systems. Each does a specific job.

### Model 1: ZoneRisk Scorer (Risk Profiling)

```
TYPE: Gradient Boosted Tree (XGBoost)

INPUTS:
  • Pincode-level 5-year historical weather data
  • IMD historical flood records by district
  • CPCB historical AQI data by city zone
  • Historical platform disruption frequency (mock data Phase 1, 
    real data Phase 2 via platform API)
  • Month of year (monsoon weighting)

OUTPUT:
  • Risk Score 0–100 per pincode
  • Recalculated monthly as seasonal patterns shift
  • Updated in real-time during active disruption events

WHY XGBoost:
  Handles mixed data types (categorical city data + continuous 
  weather metrics) extremely well. Proven in actuarial risk 
  modeling. Fast inference — calculates risk score in < 50ms.
```

### Model 2: WorkerActivity Classifier (Genuine Worker Verification)

```
TYPE: Ensemble (Random Forest + Rule Engine)

INPUTS:
  • Platform login timestamp
  • Last GPS ping before disruption event (from app)
  • Order history in last 2 hours before trigger
  • Device accelerometer pattern (motion signature)
  • Battery drain rate (active delivery = higher drain)
  • Network session continuity

OUTPUT:
  • Activity Confidence Score (0–100)
  • Score > 65 → Worker was genuinely active, claim proceeds
  • Score 40–65 → Manual review queue
  • Score < 40 → Claim rejected with explanation

NOTE:
  This model does NOT require real-time platform API in Phase 1.
  We use app-collected signals as primary source.
```

### Model 3: FraudSense Engine (Anomaly Detection)

```
TYPE: Isolation Forest + Graph Neural Network (GNN)

INPUTS:
  See full Section 8 for adversarial architecture

OUTPUT:
  • FraudScore 0–100
  • Network Graph Flag (is this worker connected to a fraud ring?)
  • Claim approved / held / rejected
```

### ML Development Stack
- **Training**: Python, scikit-learn, XGBoost, PyTorch (GNN)
- **Serving**: FastAPI inference endpoint, response < 200ms
- **Data**: Synthetic training data (Phase 1), real API data (Phase 2+)
- **Monitoring**: Model drift detection via Evidently AI

---

## 8. Adversarial Defense & Anti-Spoofing Strategy 🛡️

> **"500 delivery workers. Fake GPS. Real payouts. A coordinated fraud ring just drained a platform's liquidity pool."**
> *— DEVTrails 2026 Market Crash Event*

This section addresses the Market Crash directly and completely. Simple GPS verification is dead. Here is ShramSuraksha's multi-layered adversarial defense.

---

### 8.1 The Differentiation — Genuine Worker vs. Bad Actor

The fundamental insight: **You cannot fake physics. You can only fake coordinates.**

A genuine delivery worker caught in a rainstorm has a completely different *device behavioral signature* than someone sitting at home spoofing GPS coordinates. We exploit this at 7 levels:

#### Layer 1 — Sensor Fusion (The Physics Test)

```
GPS coordinates can be spoofed.
Accelerometer data cannot.
Gyroscope data cannot.
Barometric pressure cannot.
Cell tower handoff patterns cannot.

GENUINE WORKER IN RAIN:
  • Accelerometer shows irregular motion (avoiding puddles, 
    sudden braking, vehicle vibration profile)
  • Gyroscope shows frequent orientation changes 
    (navigation, looking around)
  • Barometric pressure drops measurably during rainfall
    (a real phone in real rain detects this)
  • Cell tower switches every 30-90 seconds 
    (physical movement through network cells)
  • Battery drains 15-25% faster (screen on, GPS active, 
    motor running = hotspot interference)

GPS SPOOFER AT HOME:
  • Accelerometer: near-zero variance (person sitting still)
  • Gyroscope: minimal rotation (phone on a desk)
  • Barometric pressure: stable (indoors, no weather change)
  • Cell tower: static single tower (not moving)
  • Battery: normal drain rate (no motor, no rain interference)

DECISION: If GPS says "Govandi, Red Alert Zone" but 
accelerometer says "sitting still indoors" → FRAUD FLAG
```

#### Layer 2 — Network Behavior Analysis (The Connectivity Paradox)

```
GENUINE INSIGHT:
Heavy rain degrades mobile network quality measurably.
A worker physically present in a rain zone will show:
  • Increased packet loss in API calls
  • Higher ping latency
  • Intermittent connection drops
  • Signal strength fluctuation (RSSI variance)

A spoofer at home will show:
  • Stable WiFi or 4G connection
  • Low latency
  • No packet loss
  • Consistent RSSI

We log network quality metrics from the app during the 
claim window. Network quality MUST match the claimed 
environment. WiFi-stable connection during a "Red Alert 
monsoon event" is a primary fraud signal.
```

#### Layer 3 — The Telegram Syndicate Graph (The Coordination Detector)

> **The problem statement tells us exactly how fraudsters coordinate: Telegram groups. We built a detector for this.**

```
INSIGHT:
500 workers don't independently decide to commit fraud 
simultaneously. They coordinate. And coordination leaves 
network traces.

OUR APPROACH — Claim Temporal-Spatial Graph Analysis:

When a cluster of claims arrives:
  1. Map claimants by their registered phone numbers
  2. Check: Do any of these numbers share common 
     "referred by" chains in our onboarding?
  3. Check: Claim submission timestamps — 
     genuine organic claims arrive with natural variance 
     (±40 minutes). Coordinated fraud claims arrive in 
     tight bursts (all within ±8 minutes of each other)
  4. Check: Did all these claims come from the same 
     pincode at the same time? 
     Real disruptions create claims across a RADIUS,
     not a single point.
  5. Graph analysis: Build a social graph from referral 
     data. If a fraud ring of 50 people is connected, 
     their claims will cluster into a tight network graph.
     Isolated genuine workers will show as 
     disconnected nodes.

FRAUD RING SIGNATURE:
  • > 15 claims from same pincode in < 10 minutes
  • Claim burst arriving ≤ 8 minutes of each other
  • Network graph clustering coefficient > 0.7
  • All claimants registered within same 2-week window

→ AUTO-HOLD entire cluster for manual review
→ NO individual penalized until review complete
```

#### Layer 4 — Platform Shadow Demand Proxy

```
INSIGHT:
If Zepto/Blinkit truly suspended operations in a zone,
their own order system shows it.

WE DON'T NEED PLATFORM API ACCESS to detect this.

Proxy Signal:
  When a genuine platform disruption occurs in a zone,
  our app's "active workers" count in that zone drops 
  because the platform stops assigning orders.
  Workers stop opening the platform app. 
  Platform app session data visible to our app 
  (with permission) shows platform foreground time 
  drops to near-zero.

If a worker claims Zepto was suspended in their zone,
but their Zepto app shows active foreground usage 
(they're browsing available orders), 
that is a direct contradiction → FRAUD FLAG.
```

#### Layer 5 — Earnings Velocity Cross-Check

```
A genuine delivery worker has a 30-90 day earnings history.
We know:
  • Their typical daily earnings on normal days
  • Their typical work start/end time
  • Their order completion rate pattern

A fraudster who recently created an account to exploit 
a weather event will show:
  • Account age < 14 days
  • Zero or minimal earnings history before the claim
  • First-ever claim coincides with first major weather event

RULE: Accounts with < 14 days history or < ₹2,000 
earned on platform before first claim → MANUAL REVIEW
(Not auto-rejected — new workers deserve protection too,
but with enhanced verification)
```

---

### 8.2 The Data — Beyond GPS

Our FraudSense engine analyzes **23 data points** per claim, not just GPS:

```
DEVICE SIGNALS (from app, user-consented):
  1. GPS coordinates (standard)
  2. GPS accuracy radius (spoofers have perfect "0m" accuracy)
  3. Accelerometer variance (motion signature)
  4. Gyroscope variance (orientation changes)
  5. Barometric pressure reading
  6. Cell tower ID sequence (handoff pattern)
  7. RSSI/signal strength variance
  8. Network type (WiFi vs cellular) — WiFi = suspicious
  9. Battery drain rate in last 2 hours
  10. Screen on/off frequency

CLAIM BEHAVIOR SIGNALS:
  11. Time from trigger to claim submission 
      (< 3 min is suspicious — too fast to be genuine reaction)
  12. Claim submission timestamp vs disruption window
  13. Historical claim frequency (anomaly detection)
  14. Platform app foreground time during claimed disruption
  15. App-to-claim workflow path 
      (genuine users browse, fraudsters go straight to claim)

NETWORK/SOCIAL SIGNALS:
  16. Claim burst count in pincode (last 15 minutes)
  17. Referral chain depth to other claimants
  18. Account age at time of claim
  19. Earnings history completeness score
  20. Registration-to-claim velocity 
      (new accounts claiming immediately)

ENVIRONMENTAL CORROBORATION:
  21. Independent API corroboration score (our dual-signal system)
  22. IMD alert active for claimed district: Yes/No
  23. Historical disruption frequency for this pincode 
      (is this even a plausible disruption zone?)
```

**FraudScore Calculation:**
```
FraudScore = Weighted sum of 23 signals
  → 0–30:  AUTO APPROVE  (instant payout)
  → 31–60: SOFT REVIEW   (pay 50% immediately, 50% after 24hr review)
  → 61–80: HOLD          (human review, 4-hour SLA)
  → 81–100: AUTO REJECT  (with full explanation to worker)
```

---

### 8.3 The UX Balance — Protecting Honest Workers

> **The hardest problem: A genuine worker in bad weather gets a network drop. Our system shouldn't punish them.**

This is where most fraud systems fail — they protect the platform but harm honest users. ShramSuraksha takes a fundamentally different approach:

#### The "Benefit of Doubt" Protocol

```
SCENARIO:
Priya (genuine Blinkit worker) is in Whitefield.
Heavy rain. Her phone signal drops.
GPS becomes erratic. Accelerometer normal.
Cell tower data: intermittent (expected in rain).
FraudScore: 45 (SOFT REVIEW range).

STANDARD FRAUD SYSTEM RESPONSE:
→ Claim rejected. Priya gets nothing. She's angry. She leaves.

SHRAMSURAKSHA RESPONSE:
→ 50% payout issued IMMEDIATELY (₹300 of ₹600 due)
→ Message to Priya: 
  "We've confirmed the weather event. We're verifying 
   your location data which showed some gaps — common 
   in heavy rain! Your remaining ₹300 will be credited 
   within 4 hours after a quick check. You're protected."
→ Human reviewer checks within 4 hours
→ If genuine (which network drop cases almost always are):
  Full remaining ₹300 paid immediately
```

#### The Network Drop Exception

```
SPECIFIC RULE:
If FraudScore is in 31–60 range AND:
  - Network quality signals show genuine degradation
  - Barometric pressure matches rainfall
  - Cell tower shows physical movement (even if GPS erratic)
  
→ RECLASSIFY to SOFT REVIEW (not HOLD)
→ Immediate 50% payout
→ 4-hour resolution SLA
→ Priya never waits more than 4 hours for full payout
```

#### The Fraud Ring Isolation Rule

```
CRITICAL DESIGN DECISION:
When a cluster is flagged as a potential fraud ring,
we do NOT auto-reject every member.

Instead:
  1. Cluster is HELD for 4 hours (not rejected)
  2. Each worker is individually analyzed
  3. Workers who pass individual analysis → paid 
     (even if their social network looks suspicious)
  4. Only workers with BOTH ring-level AND 
     individual-level fraud signals → rejected

REASON:
A genuine worker can coincidentally be in 
the same Telegram group as a fraudster. 
That doesn't make them guilty.
Guilt by association is never our policy.
```

#### Worker Appeal System

```
Every rejected claim shows:
  • Specific reason for rejection (plain Hindi/English)
  • What data caused the flag
  • One-click appeal button
  • 24-hour human review for appeals
  • If appeal succeeds: Full payout + ₹50 credit for the inconvenience

This is not charity — it's trust building.
One honest worker wrongly rejected and made whole 
is worth more than 10 fraudsters caught.
```

---

## 9. System Architecture & Tech Stack

### Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    WORKER INTERFACE                      │
│              React.js (PWA — works offline)              │
│         WhatsApp Bot (for feature phones / Ravi)         │
└─────────────────────┬───────────────────────────────────┘
                      │ HTTPS / WebSocket
┌─────────────────────▼───────────────────────────────────┐
│                   API GATEWAY                            │
│                 (Node.js / FastAPI)                       │
│    Auth (OTP via MSG91) │ Rate Limiting │ Logging        │
└──────┬──────────────────┬──────────────┬────────────────┘
       │                  │              │
┌──────▼──────┐  ┌────────▼──────┐  ┌───▼──────────────┐
│  TRIGGER    │  │  ML INFERENCE  │  │  FRAUD ENGINE    │
│  ENGINE     │  │  SERVICE       │  │  (FraudSense)    │
│             │  │                │  │                  │
│ OpenWeather │  │ ZoneRisk Model │  │ Isolation Forest │
│ OpenAQ API  │  │ ActivityModel  │  │ Graph Neural Net │
│ IMD RSS     │  │ (FastAPI)      │  │ 23-signal check  │
│ News API    │  └────────────────┘  └──────────────────┘
└──────┬──────┘           │                    │
       └──────────────────┴────────────────────┘
                          │
              ┌───────────▼──────────┐
              │      PostgreSQL      │
              │  (Workers, Policies, │
              │   Claims, Events)    │
              │     + Redis Cache    │
              │  (Real-time alerts)  │
              └───────────┬──────────┘
                          │
              ┌───────────▼──────────┐
              │   PAYOUT ENGINE      │
              │  Razorpay Sandbox    │
              │  (Phase 1: Mock)     │
              │  (Phase 2: Live UPI) │
              └──────────────────────┘
```

### Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | React.js (PWA) | Works offline — Ravi's 4G drops in rain |
| Alternate UI | WhatsApp Business API | 80% of gig workers use WhatsApp daily |
| Backend | Python FastAPI | Fast async for real-time triggers + ML serving |
| ML Training | Python, XGBoost, PyTorch | Best-in-class for tabular + GNN models |
| Database | PostgreSQL + TimescaleDB | Time-series data for weather events + claims |
| Cache | Redis | Real-time trigger alerts across zones |
| Weather | OpenWeatherMap API (free tier) | Most reliable free weather data in India |
| AQI | OpenAQ + CPCB API | India-specific pollution data |
| Payments | Razorpay Test Mode | Standard in India, UPI native |
| Hosting | AWS Free Tier (EC2 + RDS) | Scalable from Phase 1 |
| Auth | OTP via MSG91 | No email needed — just phone number |
| DevOps | GitHub Actions CI/CD | Auto deploy on commit |

### Why WhatsApp Bot Matters

> Ravi doesn't have time to open an app during a storm. He's trying to shelter his Activa.

A WhatsApp message arrives: *"🌧️ Red Alert in Govandi. ShramSuraksha is watching. Reply YES to activate coverage check."*

He replies YES. That's all. The payout happens in the background. **No app opens required during a disaster.**

---

## 10. Six-Week Roadmap

### Phase 1 — Seed [March 4–20]: Ideate & Foundation ✅

| Deliverable | Status |
|---|---|
| Persona research (Ravi, Priya) | ✅ Complete |
| README with full architecture | ✅ This document |
| Parametric trigger design | ✅ 6-signal corroboration model |
| Weekly premium model | ✅ Zone-adjusted ₹29–119/week |
| AI/ML architecture plan | ✅ 3 models defined |
| Anti-spoofing strategy | ✅ 23-signal FraudSense engine |
| GitHub repository setup | ✅ Folder structure initialized |
| 2-minute strategy video | 🔄 Recording in progress |

---

### Phase 2 — Scale [March 21–April 4]: Build & Protect

**Theme: "Protect Your Worker" — Working software.**

**Week 3 Focus:**
- [ ] Worker onboarding flow (phone OTP → zone detection → risk score → plan selection → UPI AutoPay setup)
- [ ] ZoneRisk ML model training (synthetic data, pincode-level)
- [ ] OpenWeatherMap + OpenAQ API integration
- [ ] Trigger detection engine (dual-signal corroboration live)
- [ ] Basic claim flow (trigger fires → worker notified → claim created)

**Week 4 Focus:**
- [ ] FraudSense engine v1 (rule-based + Isolation Forest)
- [ ] Dynamic premium calculator live
- [ ] Razorpay sandbox payout integration
- [ ] Worker dashboard (active policy, payout history)
- [ ] WhatsApp notification integration (Twilio/Meta sandbox)
- [ ] Admin dashboard v1 (claims overview, fraud flags)

**Phase 2 Submission:**
- 2-minute demo video showing: Registration → Policy → Trigger → Claim → Payout
- Full executable source code
- Live demo URL

---

### Phase 3 — Soar [April 5–17]: Scale & Perfect

**Theme: "Perfect for Your Worker" — Production-grade.**

**Week 5 Focus:**
- [ ] FraudSense v2: Graph Neural Network for syndicate detection
- [ ] Telegram coordination detection logic
- [ ] Sensor fusion anti-spoofing (accelerometer + barometric)
- [ ] Network quality analysis during claim validation
- [ ] "Benefit of Doubt" 50% immediate payout logic
- [ ] Appeal workflow (rejected → appeal → human review)
- [ ] Instant payout < 90 seconds (benchmark and prove it)

**Week 6 Focus:**
- [ ] Intelligent Dashboard:
  - Worker view: Protected earnings, active coverage badge
  - Admin view: Loss ratio, zone-wise claim heatmap, syndicate alerts, predictive next-week disruption forecast
- [ ] Performance optimization (< 200ms ML inference)
- [ ] Security hardening
- [ ] Final pitch deck (PDF)
- [ ] 5-minute demo video (simulate rainstorm → auto-trigger → fraud check → 90-second payout)

**Final Submission Package:**
- 5-minute demo video (public link)
- Pitch deck PDF
- Full GitHub repository with deployment guide
- Live demo URL

---

## 11. Business Viability

### Unit Economics (Per Worker, Per Week)

```
Average Premium Collected:        ₹44/week (blended)
Average Expected Claim Payout:    ₹31/week (based on historical 
                                   disruption frequency in metro zones)
Gross Margin per Worker/Week:     ₹13 (30% gross margin)
Target Active Workers (6 months): 10,000
Monthly Revenue at target:        ₹17.6 lakh
Monthly Claim Payout:             ₹12.4 lakh
Operating Margin:                 29.5%
```

### Why This Is Actuarially Sound

Parametric insurance is inherently more efficient than traditional insurance because:
- No adjusters (fully automated → 0 claim processing cost)
- No fraud investigation cost (FraudSense engine does it instantly)
- No document verification cost
- Clear trigger = no ambiguous claims

Our **Loss Ratio target: 65-70%** (industry standard for parametric is 55-75%)

### Market Size
- **TAM**: 11.3M gig delivery workers × ₹44/week = ₹257 crore/week addressable market
- **SAM**: Q-Commerce workers in top 10 metros = ~800,000 × ₹44 = ₹18.2 crore/week
- **SOM (Year 1)**: 50,000 workers = ₹1.14 crore/week revenue

### Acquisition Strategy
- Partner with Zepto/Blinkit dark store managers (they tell their riders)
- WhatsApp-first onboarding = zero friction
- First 4 weeks free trial → convert to paid (projected 40% conversion)

---

## 12. Team

| Name | Role |
|---|---|
| **Ayush Raj Chourasia** | Team Leader |
| **Tribhuwan Singh** | Member |
| **Satyajit Sethy** | Member |
| **Surajit Sahoo** | Member |
| **E Sailaja** | Member |

---

## Repository Structure

```
ShramSuraksha/
├── README.md                    ← You are here
├── /frontend                    ← React.js PWA
│   ├── /worker-app              ← Ravi's interface
│   └── /admin-dashboard         ← Insurer interface
├── /backend                     ← FastAPI services
│   ├── /trigger-engine          ← Weather/AQI monitoring
│   ├── /claim-service           ← Claim lifecycle
│   ├── /payout-service          ← Razorpay integration
│   └── /auth-service            ← OTP auth
├── /ml-models                   ← Python ML
│   ├── /zone-risk-scorer        ← XGBoost risk model
│   ├── /activity-classifier     ← Worker activity model
│   └── /fraud-sense             ← FraudSense engine
├── /docs                        ← Architecture diagrams
│   ├── system-architecture.png
│   ├── fraud-detection-flow.png
│   └── trigger-flow.png
└── /data                        ← Synthetic training data
    ├── synthetic-workers.csv
    ├── historical-weather-mock.csv
    └── claim-patterns-mock.csv
```

---

## Our Promise

> India's gig workers built our food delivery economy. They delivered through every monsoon, every wave of heat, every bout of smog. They never got a safety net. 
>
> **ShramSuraksha is that safety net. Automatic. Instant. Dignified.**

---

*Built with purpose at Guidewire DEVTrails 2026 — Unicorn Chase*
*"Shram" (श्रम) = Labor. "Suraksha" (सुरक्षा) = Protection.*
*Every rupee we pay out is a delivery worker's dignity restored.*

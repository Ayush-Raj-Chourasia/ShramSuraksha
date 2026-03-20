# 🛡️ GigShield — AI-Powered Parametric Income Insurance for India's Food Delivery Partners

> **Guidewire DEVTrails 2026 | Unicorn Chase**
> **Phase 1 Submission | Team: Era | National Insurance Academy (NIA)**

---

## 📌 Table of Contents

1. [Problem Statement](#-problem-statement)
2. [Our Solution — GigShield](#-our-solution--gigshield)
3. [Persona & Scenario Analysis](#-persona--scenario-analysis)
4. [Application Workflow](#-application-workflow)
5. [Weekly Premium Model](#-weekly-premium-model)
6. [Parametric Triggers](#-parametric-triggers)
7. [Platform Choice: Web vs Mobile](#-platform-choice-web-vs-mobile)
8. [AI/ML Integration Plan](#-aiml-integration-plan)
9. [Fraud Detection Architecture](#-fraud-detection-architecture)
10. [Tech Stack](#-tech-stack)
11. [Development Roadmap (6 Weeks)](#-development-roadmap-6-weeks)
12. [Business Viability](#-business-viability)
13. [Repository Structure](#-repository-structure)

---

## 🚨 Problem Statement

India has over **12 million platform-based delivery workers** operating across Zomato, Swiggy, Amazon, Flipkart, Zepto, and Blinkit. These workers operate entirely without a financial safety net. When external disruptions hit — a sudden cloudburst in Mumbai, a three-day flood in Bengaluru, a civic curfew in Delhi — their income drops to zero, often for 1–4 days straight.

Our research and secondary data analysis reveals:
- Delivery partners lose an estimated **₹1,500–₹3,500 per disruption event** depending on severity and city
- **72% of food delivery workers** have no savings buffer exceeding 7 days
- Weather-related disruptions affect delivery operations in Indian metros **40–60 days per year** on average
- There is **zero formal income protection product** in the market today tailored for this segment

The existing insurance products (health, term life, vehicle insurance) do not address **income loss during uncontrollable parametric events**. GigShield fills this exact gap.

---

## 💡 Our Solution — GigShield

**GigShield** is an AI-enabled parametric income insurance platform exclusively for **food delivery partners** (Zomato/Swiggy) in Tier-1 and Tier-2 Indian cities.

**Core Value Proposition:**
> _"Your rain should not be your loss. Get paid when the weather stops you from working."_

### What Makes GigShield Different

| Feature | Traditional Insurance | GigShield |
|---|---|---|
| Claims process | Manual, 7–30 days | Fully automated, under 2 hours |
| Triggers | Human-assessed | Parametric (objective data APIs) |
| Pricing | Annual/monthly | **Weekly**, aligned with gig income cycles |
| Coverage | Health, vehicle, life | **Income loss only** during disruption events |
| Fraud verification | Adjuster-driven | AI anomaly detection + GPS validation |
| Payout channel | Cheque/NEFT | Direct UPI to worker's linked account |

---

## 👤 Persona & Scenario Analysis

### Chosen Persona: Food Delivery Partner (Zomato / Swiggy)

We have deliberately narrowed our focus to **food delivery workers** for the following reasons:
1. Highest exposure to weather disruption (outdoor, two-wheeler, peak hours are lunch/dinner)
2. Largest addressable segment (~4 million active workers on Zomato + Swiggy combined)
3. Most predictable income baseline (order earnings + per-km incentive per platform)
4. Clear, verifiable GPS-based activity data available for fraud prevention

---

### 🎭 Scenario 1 — Rajan, Bengaluru (Monsoon Flooding)

**Profile:** Rajan, 28, delivers for Swiggy in the Koramangala–HSR Layout corridor. He earns an average of **₹700–₹900/day** on weekdays and **₹1,000–₹1,200 on weekends**. He is enrolled on GigShield's **Standard Plan (₹99/week)**.

**Event:** IMD issues a **Red Alert** for Bengaluru on August 14. Rainfall exceeds 115mm in 24 hours. The Outer Ring Road is flooded. Swiggy suspends operations for the affected zone for **18 hours**.

**GigShield Flow:**
1. 🌧️ OpenWeatherMap API detects rainfall > 100mm threshold for Rajan's registered zone
2. ✅ System cross-validates with IMD alert feed and Swiggy's zone-level suspension signal (mock API)
3. 📲 Rajan receives a push notification: *"Disruption event detected. Your claim is being processed."*
4. 🤖 AI Fraud Engine validates: Rajan's GPS was in the coverage zone, no deliveries logged = legitimate
5. 💸 **₹420 payout** (calculated as 60% of his daily average for 18 hours of downtime) is transferred via UPI within **90 minutes**. Zero manual action required.

---

### 🎭 Scenario 2 — Priya, Delhi (Severe Pollution + Odd-Even Restriction)

**Profile:** Priya, 25, delivers for Zomato in South Delhi. She owns a two-wheeler and earns ~₹650/day. Enrolled on GigShield's **Basic Plan (₹59/week)**.

**Event:** AQI in Delhi crosses **450 (Severe+)** on November 3rd. Delhi government invokes GRAP Stage IV restrictions. Two-wheelers are banned from operating in select zones from 8 AM – 8 PM.

**GigShield Flow:**
1. 💨 CPCB AQI feed registers Severe+ level in Priya's registered zone (South Delhi)
2. 📋 Government-issued GRAP restriction API / web scrape confirms operational ban
3. 🤖 System calculates 12-hour income loss based on Priya's historical daily earnings
4. 💸 **₹325 payout** transferred to Priya's UPI handle by 10 AM, before she even realizes she can't work

---

### 🎭 Scenario 3 — Mohammed, Mumbai (Cyclone Pre-Warning / Curfew)

**Profile:** Mohammed, 32, earns ₹800–₹950/day delivering for Swiggy in the Andheri–Bandra zone.

**Event:** IMD issues a **Cyclone Warning** for coastal Maharashtra on June 9. BMC issues a curfew advisory. Swiggy halts all deliveries in the zone.

**GigShield Flow:**
1. 🌀 IMD cyclone warning API triggers a **pre-emptive coverage extension** (GigShield's proactive feature)
2. Mohammed's policy is automatically extended for 48-hour coverage at no extra premium
3. System locks in his income baseline 12 hours before the disruption begins (anti-fraud measure)
4. Upon event confirmation, **₹1,700 payout** (2 days × 85% daily average) is processed

---

## 🔄 Application Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                        GIGSHIELD PLATFORM                        │
│                                                                   │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────────────┐ │
│  │  ONBOARDING  │──▶│  POLICY MGT  │──▶│  TRIGGER MONITORING  │ │
│  └──────────────┘   └──────────────┘   └──────────────────────┘ │
│         │                  │                      │              │
│         ▼                  ▼                      ▼              │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────────────┐ │
│  │ Worker KYC + │   │ Weekly Plan  │   │  Weather / AQI / Gov │ │
│  │ Income Verify│   │ Selection &  │   │  Alert API Polling   │ │
│  │ (Aadhaar+    │   │ Auto-Renewal │   │  Every 30 Minutes    │ │
│  │  Platform ID)│   └──────────────┘   └──────────────────────┘ │
│  └──────────────┘                                 │              │
│                                                   ▼              │
│                                    ┌──────────────────────────┐  │
│                                    │   AI FRAUD ENGINE        │  │
│                                    │  - GPS Zone Validation   │  │
│                                    │  - Activity Cross-Check  │  │
│                                    │  - Anomaly Detection     │  │
│                                    └──────────────────────────┘  │
│                                                   │              │
│                                                   ▼              │
│                                    ┌──────────────────────────┐  │
│                                    │   PAYOUT PROCESSOR       │  │
│                                    │  - Income Loss Calc      │  │
│                                    │  - UPI Transfer          │  │
│                                    │  - Notification Push     │  │
│                                    └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Step-by-Step User Flow

**1. Onboarding (5 minutes, one-time)**
- Worker registers using mobile number + Aadhaar OTP
- Links their Swiggy/Zomato Partner ID for income verification
- Selects home city and primary delivery zone(s) — up to 3 zones
- Sets UPI handle for payouts
- AI Risk Engine generates their **initial risk score** based on zone, city, historical disruption frequency

**2. Policy Activation**
- Worker picks a weekly plan (Basic / Standard / Premium — see pricing below)
- ₹ premium deducted via UPI AutoPay every Monday at 6 AM
- Policy is active from Monday 00:00 to Sunday 23:59
- Workers can pause or cancel policy mid-week (no pro-rata refund in V1)

**3. Trigger Monitoring (Fully Automated)**
- GigShield's backend polls 4 external data feeds every 30 minutes
- When a threshold is crossed in a worker's registered zone, the claim pipeline is triggered automatically
- No worker action needed — purely **parametric and zero-touch**

**4. Fraud Validation**
- AI engine cross-checks GPS last-known location, platform activity logs (via simulated API), and historical claim patterns
- Flags suspicious claims for manual review (estimated <2% of claims)
- Clean claims auto-approved and pushed to payout in **under 90 minutes**

**5. Payout**
- UPI transfer to worker's registered handle
- In-app notification with claim breakdown
- Monthly summary sent via WhatsApp (planned for Phase 2)

---

## 💰 Weekly Premium Model

### Why Weekly?

Food delivery workers are paid on a **weekly settlement cycle** by platforms (Zomato pays every Thursday, Swiggy every Friday). A monthly or annual insurance premium model creates a cash-flow mismatch. Workers simply won't maintain a policy that drafts money the week before a payout.

Our weekly premium aligns insurance cost directly with income arrival — a **fundamentally different mental model** for the gig worker.

### Pricing Tiers

| Plan | Weekly Premium | Max Weekly Payout | Coverage Hours/Day | Disruptions Covered |
|---|---|---|---|---|
| **Basic** | ₹49 | ₹500 | Up to 6 hours/day | Weather (Rain, Heat) only |
| **Standard** | ₹99 | ₹1,200 | Up to 10 hours/day | Weather + AQI + Curfew |
| **Premium** | ₹149 | ₹2,000 | Up to 12 hours/day | All triggers + Proactive alerts |

### Dynamic Premium Calculation (AI-Adjusted)

The **base premium** is adjusted weekly by our ML Risk Engine based on:

```
Adjusted Premium = Base Premium × Zone Risk Multiplier × Weather Forecast Factor × Claim History Modifier

Where:
  Zone Risk Multiplier   = 0.85 (low-flood-risk zone) to 1.30 (high-risk zone)
  Weather Forecast Factor = IMD forecast severity index for the coming week (0.90 – 1.25)
  Claim History Modifier  = 0.95 (no claims in 4 weeks) to 1.10 (multiple claims)
```

**Example:** A Standard Plan worker in a low-risk zone with no recent claims during a clear-forecast week:
`₹99 × 0.85 × 0.92 × 0.95 = ₹73.5 effective premium`

This dynamic pricing ensures **affordability for workers in safer zones** while maintaining actuarial soundness.

### Payout Calculation

```
Payout = (Worker's 4-Week Rolling Daily Average Earnings) × Disruption Hour Fraction × Coverage Multiplier

Where:
  4-Week Rolling Average = Mean daily earnings from platform data over last 28 days
  Disruption Hour Fraction = Hours unable to work ÷ Typical working hours per day (10h)
  Coverage Multiplier = Per plan: Basic=0.6, Standard=0.8, Premium=1.0
```

---

## ⚡ Parametric Triggers

All triggers are **objective, data-driven, and automatically verifiable**. No claim form. No assessor visit. No human discretion.

| # | Trigger | Data Source | Threshold | Payout Condition |
|---|---|---|---|---|
| 1 | **Heavy Rainfall** | OpenWeatherMap API + IMD RSS | > 64.5 mm/24h in registered zone | Deliveries logistically halted |
| 2 | **Severe Heat Wave** | IMD Heat Alert API | Temperature > 45°C + Heat Alert Level 3+ | Unsafe outdoor working conditions |
| 3 | **Air Quality (AQI)** | CPCB AQI API (api.cpcbccr.gov.in) | AQI > 401 (Severe) + GRAP Stage IV | Two-wheeler ban / outdoor work restriction |
| 4 | **Civic Curfew / Strike** | Government advisory scraper (PIB/State Govt feeds) | Confirmed zone-level curfew issued | Access to pickup/drop zones blocked |
| 5 | **Platform Outage** *(Premium only)* | Swiggy/Zomato status mock API | Platform down > 2 hours during peak (12–2 PM or 7–10 PM) | Worker logged in but zero orders dispatched |

**Important:** GigShield only covers **income loss** caused by these parametric triggers. Vehicle damage, health issues, and personal accidents are explicitly excluded from all plans.

---

## 📱 Platform Choice: Web vs Mobile

### Decision: **Progressive Web App (PWA) — Mobile-First**

**Rationale:**
- Over 94% of delivery workers access the internet exclusively via Android smartphones
- A native app requires Play Store approval (2–5 day delay, unsuitable for 6-week hackathon)
- A PWA delivers **native app experience** (home screen install, push notifications, offline mode) with zero installation friction
- Aadhaar OTP-based KYC works seamlessly in mobile browser environments
- UPI deep-links work natively on Android browsers without a native wrapper

**Technology:** React (Vite) PWA — renders as a full-screen app on Android with service workers for push notifications and offline policy-status caching.

---

## 🤖 AI/ML Integration Plan

### 1. Dynamic Risk Scoring & Premium Engine

**Model:** Gradient Boosted Trees (XGBoost) — chosen for tabular data performance and interpretability (SHAP explainability for regulatory audits)

**Features:**
- Worker's registered zone(s) historical disruption frequency (past 3 years)
- IMD 7-day weather forecast severity index
- City-level monsoon onset calendar
- Worker's own claim history (frequency, severity)
- Seasonal risk calendar (pre-encoded: Oct–Dec = Delhi pollution season, Jun–Sep = Mumbai monsoon)

**Training Data:** Synthesized using IMD historical weather records, CPCB AQI archives, and news-scraped civic disruption events (2018–2024).

**Output:** Per-worker adjusted weekly premium + explainable breakdown sent to worker ("Your premium this week is lower because no rain is forecast and your zone has low flood history")

---

### 2. Income Baseline Estimation

**Problem:** Workers won't always have verifiable income records. New workers with <4 weeks of history need a baseline.

**Solution:** A **Zone × Tenure × Platform regression model** trained on synthetic platform earnings data:
```
Estimated Daily Income = β₀ + β₁(Zone_Tier) + β₂(Tenure_Weeks) + β₃(Platform) + β₄(Day_of_Week) + ε
```

For workers with 4+ weeks of history, the actual rolling 28-day average overrides the model estimate.

---

### 3. Fraud Detection Engine

**Architecture:** Isolation Forest (unsupervised anomaly detection) as the first pass, followed by a rule-based decision tree for explainability.

**Feature Signals Used:**

| Signal | Fraud Pattern Detected |
|---|---|
| GPS last known location | Worker claims disruption but GPS shows them in a different zone |
| Platform activity log (mock) | Worker logged deliveries during claimed downtime |
| Claim frequency | Unusual spike — worker claims every week for 6+ consecutive weeks |
| Weather event magnitude vs payout request | AQI was 250 (Moderate), but worker claims Severe event payout |
| Historical co-claimant analysis | 10+ workers from the same tiny zone claiming simultaneously (zone farming) |

**Output:** Fraud Risk Score (0–100). Score > 70 → held for manual review. Score > 90 → auto-rejected with explanation.

---

## 🛠️ Tech Stack

### Frontend
| Component | Technology | Reason |
|---|---|---|
| Framework | React 18 (Vite) | Fast build, PWA support |
| Styling | Tailwind CSS | Rapid UI development |
| State Management | Zustand | Lightweight, no boilerplate |
| PWA | Vite PWA Plugin | Service workers, offline cache |
| Charts/Dashboard | Recharts | Lightweight, React-native |

### Backend
| Component | Technology | Reason |
|---|---|---|
| Runtime | Node.js (Express) | Rapid API development |
| Database | PostgreSQL (Supabase) | Relational + real-time subscriptions |
| Auth | Supabase Auth (OTP) | Mobile OTP login, no extra service |
| Task Queue | BullMQ (Redis) | Trigger polling jobs every 30 min |
| ML Inference | Python FastAPI (separate microservice) | XGBoost model serving |

### External APIs & Data Sources
| Data | API/Source | Usage |
|---|---|---|
| Weather | OpenWeatherMap (free tier) | Rainfall, temperature, alerts |
| AQI | CPCB AQI API | Pollution level monitoring |
| Weather Alerts | IMD RSS Feed | Official Indian alerts |
| Payment | Razorpay (test mode) | UPI AutoPay simulation |
| Maps/GPS Zone | Google Maps API (free tier) | Zone boundary validation |

### Infrastructure
| Component | Service |
|---|---|
| Hosting | Vercel (frontend) + Railway (backend) |
| ML Service | Render (free tier Python service) |
| Database | Supabase (free tier, 500MB) |
| Monitoring | Uptime Robot (free) |

---

## 🗓️ Development Roadmap (6 Weeks)

### ✅ Phase 1 — Weeks 1–2: Ideation & Foundation (March 4 – March 20)

- [x] Problem research and persona definition
- [x] Parametric trigger selection and threshold research
- [x] Weekly premium model design (actuarial logic)
- [x] AI/ML architecture planning (XGBoost + Isolation Forest)
- [x] Tech stack selection and justification
- [x] README documentation (this document)
- [x] Repository scaffolding — monorepo structure initialized
- [x] UI wireframes — onboarding, dashboard, claim notification flows
- [x] Figma prototype (low-fidelity) — 5 core screens
- [x] API research — OpenWeatherMap, CPCB, Razorpay test mode verified

**Prototype Scope (Phase 1):**
- Static UI mockup of onboarding screen with plan selection
- Mock trigger: rainfall API call → console log of triggered event
- Readme + architecture documentation (this submission)

---

### 🔧 Phase 2 — Weeks 3–4: Automation & Protection (March 21 – April 4)

**Goal:** Working end-to-end flow — from registration to automated claim

- [ ] Worker registration flow with Supabase Auth (OTP)
- [ ] Platform ID linking (mock Swiggy Partner API)
- [ ] Policy creation with dynamic premium calculation (XGBoost model integrated)
- [ ] 4 automated parametric triggers implemented (weather, AQI, curfew, heat)
- [ ] Fraud Engine v1 — GPS zone check + activity log cross-reference
- [ ] Razorpay AutoPay integration (test mode) for weekly premium deduction
- [ ] UPI payout simulation (Razorpay payout API test mode)
- [ ] Push notification system (PWA + Firebase Cloud Messaging)
- [ ] Worker dashboard — active coverage status, earnings protected, claim history

---

### 🚀 Phase 3 — Weeks 5–6: Scale & Optimise (April 5 – April 17)

**Goal:** Production-hardened, fully demo-able platform

- [ ] Advanced fraud detection — Isolation Forest model trained on synthetic dataset
- [ ] GPS spoofing detection module
- [ ] Fake weather claim detection (AQI/rain magnitude vs payout amount validation)
- [ ] Admin/Insurer Dashboard — loss ratios, predictive disruption analytics, zone heatmaps
- [ ] WhatsApp notification integration (Twilio sandbox)
- [ ] Multi-city support (Mumbai, Delhi, Bengaluru, Hyderabad, Chennai)
- [ ] Proactive cyclone/extreme event coverage extension feature
- [ ] Full demo video with simulated disruption walkthrough
- [ ] Final pitch deck (PDF) preparation

---

## 📊 Business Viability

### Market Sizing
- **Serviceable Addressable Market (SAM):** ~4 million food delivery workers on Zomato + Swiggy
- **Target Initial Segment:** Workers in top 6 metro cities — est. 1.8 million
- **Assumed 5% penetration in Year 1:** 90,000 policyholders
- **Average Revenue (Standard Plan, adjusted):** ₹85/week × 52 weeks = ₹4,420/worker/year
- **Projected ARR (Year 1):** ~₹39.8 crore

### Loss Ratio Estimate
- Historical average disruption days in Indian metros: ~45 days/year (weather + civic)
- Average payout per event per worker (Standard Plan): ₹480
- Expected annual payout per worker: ~₹2,160 (~48% loss ratio on Standard Plan)
- **Gross margin at scale:** ~52% before operational costs — commercially viable

### Why Guidewire / Insurtech Integration Makes Sense
- Guidewire ClaimCenter can manage the parametric claims pipeline at enterprise scale
- PolicyCenter can handle the weekly policy issuance/renewal lifecycle
- BillingCenter integrates with UPI AutoPay for the weekly debit cycle
- GigShield is architected as a **Guidewire-compatible insurance product** from Day 1

---

## 📁 Repository Structure

```
gigshield/
├── README.md                    ← This document
├── frontend/                    ← React PWA
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Onboarding.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ClaimStatus.jsx
│   │   │   └── PolicyManager.jsx
│   │   ├── components/
│   │   └── store/               ← Zustand stores
│   └── public/
│       └── manifest.json        ← PWA manifest
├── backend/                     ← Node.js Express API
│   ├── routes/
│   │   ├── auth.js
│   │   ├── policy.js
│   │   ├── claims.js
│   │   └── triggers.js
│   ├── workers/
│   │   └── triggerPoller.js     ← BullMQ job: polls APIs every 30min
│   └── db/
│       └── schema.sql
├── ml-service/                  ← Python FastAPI
│   ├── models/
│   │   ├── premium_engine.py    ← XGBoost premium calculator
│   │   └── fraud_detector.py   ← Isolation Forest fraud model
│   ├── data/
│   │   └── synthetic_dataset/  ← Training data
│   └── main.py
├── docs/
│   ├── wireframes/              ← Figma export PNGs
│   ├── architecture.png         ← System architecture diagram
│   └── api-spec.yaml           ← OpenAPI 3.0 spec
└── .github/
    └── workflows/
        └── ci.yml               ← GitHub Actions CI pipeline
```

---

## 👥 Team

| Name | Role |
|---|---|
| Ayush Raj Chourasia | Full-Stack Lead / Backend |
| Tribhuwan Singh | ML / AI Engineer |
| Satyajit Sethy | Frontend / UI-UX |
| Surajit Sahoo | Product / Research |
| E Sailaja | DevOps / Infrastructure |

---

## 📎 Submission Links

- **GitHub Repository:** [Link to be updated]
- **Demo Video (2 min):** [Link to be updated — uploaded before March 20 EOD]
- **Figma Prototype:** [Link to be updated]

---

> *GigShield is built for the 4 AM rider who has nowhere to go when the city floods. This is not a product. It's a safety net.*

---

**Guidewire DEVTrails 2026 | Phase 1 | March 20, 2026**
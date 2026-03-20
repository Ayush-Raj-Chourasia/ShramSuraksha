<div align="center">

# 🛡️ ShramSuraksha

### *Suraksha for every Shramik. Protection for every shift.*

**AI-Powered Parametric Income Insurance for India's Gig Economy**

---

[![Guidewire DEVTrails 2026](https://img.shields.io/badge/Guidewire-DEVTrails%202026-orange?style=for-the-badge)](https://guidewiredevtrails.com/)
[![Team Era](https://img.shields.io/badge/Team-Era-blue?style=for-the-badge)](#team)
[![Phase](https://img.shields.io/badge/Phase-Seed%20(Phase%201)-green?style=for-the-badge)](#timeline)
[![Prize Pool](https://img.shields.io/badge/Prize%20Pool-%E2%82%B96%2C00%2C000-gold?style=for-the-badge)](#hackathon-context)

</div>

---

## 📌 Table of Contents

- [The Problem](#the-problem)
- [Our Solution](#our-solution)
- [Key Features](#key-features)
- [Target Persona](#target-persona)
- [Core Disruptions Covered](#core-disruptions-covered)
- [How Parametric Insurance Works](#how-parametric-insurance-works)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Team](#team)
- [Hackathon Context](#hackathon-context)
- [Timeline & Phases](#timeline--phases)

---

## The Problem

India's platform-based gig delivery workers — riding for **Zomato, Swiggy, Zepto, Amazon, Dunzo**, and more — are the backbone of our fast-paced digital economy. Yet they remain completely exposed to forces beyond their control.

> **External disruptions such as extreme weather, severe pollution, floods, curfews, and local strikes can reduce a gig worker's monthly income by 20–30%.**

When these disruptions hit:
- Deliveries halt. Workers cannot go outdoors.
- Pickup and drop locations become inaccessible.
- The platform pays nothing. The worker absorbs 100% of the loss.
- No insurance product exists that protects their **income** during these events.

**India has 15+ million gig delivery workers. None of them have a safety net.**

---

## Our Solution

**ShramSuraksha** is an AI-enabled **parametric income insurance platform** built specifically for India's gig delivery workers.

Unlike traditional insurance that requires claims, investigations, and paperwork — ShramSuraksha uses **real-world data triggers** (weather APIs, AQI feeds, disaster alerts) to automatically detect a qualifying disruption and instantly release a payout to the worker — **no claim filed, no delay, no hassle**.

> *"ShramSuraksha" = Shram (श्रम, Labour) + Suraksha (सुरक्षा, Protection)*

### What Makes It Parametric?

| Traditional Insurance | ShramSuraksha (Parametric) |
|---|---|
| File a claim after the event | Payout triggers automatically on verified data |
| Wait weeks for investigation | Payout released within hours |
| Prove individual loss | If the event happened, you get paid |
| Complex paperwork | Zero paperwork |

---

## Key Features

- **🤖 AI-Driven Disruption Detection** — Real-time integration with weather, AQI, disaster, and civic alert APIs to auto-detect qualifying income-loss events
- **⚡ Automated Payouts** — Parametric triggers release instant payments without claims processing
- **🔍 Intelligent Fraud Detection** — AI layer to detect anomalous claim patterns and prevent abuse
- **📅 Weekly Pricing Model** — Premiums aligned with gig workers' weekly earning cycles, not annual
- **📱 Mobile-First** — Designed for smartphone-native, low-bandwidth usage
- **🌐 Multi-Platform** — Coverage extends across Zomato, Swiggy, Zepto, Amazon, Dunzo, and other platforms

---

## Target Persona

> **Persona selection is in progress — to be finalized and updated here.**

ShramSuraksha is designed for a specific gig delivery segment. The persona defines:
- The type of delivery worker (2-wheeler, bicycle, on-foot, etc.)
- Primary platforms they work on
- Geographic focus (metro, tier-2 cities, etc.)
- Most relevant disruption types for their daily work

*This section will be updated once the persona is finalized.*

---

## Core Disruptions Covered

> **Critical Constraint:** ShramSuraksha covers **income lost** during disruptions only.  
> ❌ No health coverage | ❌ No life insurance | ❌ No accident coverage | ❌ No vehicle repairs

### Environmental Disruptions
| Disruption | Trigger Condition | Income Impact |
|---|---|---|
| Extreme Heat | Temperature > threshold | Cannot work outdoors safely |
| Heavy Rain / Floods | Rainfall > threshold / flood alert | Deliveries halted |
| Severe Air Pollution | AQI > hazardous level | Unsafe outdoor work conditions |
| Cyclone / Storm | Official weather alert | Full operational shutdown |

### Social / Civic Disruptions
| Disruption | Trigger Condition | Income Impact |
|---|---|---|
| Unplanned Curfew | Government-issued curfew | Cannot access pickup/drop zones |
| Local Strikes / Bandhs | Verified civic disruption alerts | Market/zone closures |
| Sudden Zone Closures | Authority-mandated closures | Delivery radius blocked |

*Specific trigger thresholds and parameters are determined per persona based on the most relevant disruptions for that delivery segment.*

---

## How Parametric Insurance Works

```
Worker subscribes → Pays weekly premium → Disruption occurs →
External data API confirms event → Payout auto-triggered →
Money reaches worker's wallet within hours
```

### Weekly Pricing Model
- Premiums are structured **weekly** to align with gig workers' typical payout cycle
- Workers can subscribe, pause, or resume weekly — no annual lock-in
- Affordable micro-premium tiers based on coverage level

### Fraud Detection Layer
- AI model monitors payout patterns vs. verified external event data
- Cross-references worker's active platform status during claimed disruption window
- Flags anomalies for review without blocking legitimate payouts

---

## Adversarial Defense & Anti-Spoofing Strategy

### The Threat: GPS Spoofing Fraud Rings

**Market Crash Scenario:**  
500+ organized delivery workers exploit GPS vulnerabilities. Using spoofing apps (₹500–2,000 cost), they fake locations in red-alert weather zones, trigger parametric payouts, and drain the liquidity pool in minutes. Coordination via Telegram. No individual claim looks suspicious. Collectively, they're a syndicate.

**Why Basic GPS Fails:**
- GPS spoofing is commodity technology
- Single spoofed claim is indistinguishable from legitimate claim in isolation
- Real weather provides perfect cover for fake claims

### ShramSuraksha's 7-Layer Defense Architecture

#### Layer 1: Behavioral Pattern Profiling
**The Logic:** Each delivery worker has a unique movement signature. Fraud is deviation from that signature.

- **Normal Patterns (ML Model):**
  - Typical delivery routes per worker (cluster analysis on 30-day history)
  - Velocity patterns (average speed between pickups = ~12-18 km/h for 2-wheeler)
  - Active hours (most workers cluster orders 11 AM–9 PM)
  - Zone favorites (workers repeat zones, rarely work new zones)

- **Spoofing Red Flags:**
  - Location jump > 500m between consecutive deliveries (physically impossible in <2 minutes)
  - Stationary at claimed "disruption zone" for > 20 minutes (active delivery requires movement)
  - Completed 3+ deliveries same day, then claims "stranded" (contradictory)
  - Claim filed < 5 minutes after "disruption" (honest workers typically wait 30+ min to see if conditions improve)
  - No prior delivery history in claimed zone but suddenly "stranded" there

#### Layer 2: Platform Integration Verification
**The Logic:** Cross-validate with actual delivery platform backend.

- **Query Zomato/Swiggy/Zepto APIs:**
  - Is worker actually logged into app during claimed disruption window?
  - Order acceptance/rejection logs (if orders were offered, were they accepted or declined?)
  - Real delivery completion timestamps vs. claimed disruption start time
  - If worker completed delivery at 2:47 PM and claims disruption started at 2:30 PM, it's fraud
  - Active app engagement (is location being updated in real-time or static spoofed coord?)

- **The Catch:**  
  If a worker claims "stranded and cannot work" but the app shows they accepted 2 orders in that window, instant fraud flag.

#### Layer 3: Multi-Source Environmental Validation
**The Logic:** Verify the weather actually happened at the EXACT location claimed.

- **Hyper-Local Weather Fusion:**
  - Google Weather API + OpenWeather API + IQAir (real-time AQI) + Government meteorological dept alerts
  - Claimed "40°C heat wave" location vs. actual recorded temperature at lat/long (margin of error: ±2°C)
  - Rainfall data from NOAA/IMD: "Heavy rain" claim vs. actual rainfall in mm at that grid point
  - Wind speed data: "Cyclone-force winds" vs. actual anemometer readings from nearest weather station
  - AQI spike: Claimed "hazardous pollution" vs. actual PM2.5 readings from closest sensor

- **Geo-Fence Logic:**  
  Divide city into 500m × 500m weather grid. Check: did ACTUAL severe weather occur in claimed grid cell within ±15 min of claim timestamp?

- **The Catch:**  
  Weather happened 5 km away but worker claims stranded at specific location? Probable fraud.

#### Layer 4: Network-Level Fraud Ring Detection (Graph Analysis)
**The Logic:** Fraud rings are signatures of coordinated behavior. Isolate them via graph clustering.

- **Coordinated Submission Patterns:**
  - Claims filed within 2–5 minute windows from multiple workers = ring signal
  - Example: Workers A, B, C, D all file same-disruption claims at 2:31 PM, 2:33 PM, 2:35 PM, 2:37 PM → Coordinated ring
  
- **Device Fingerprinting:**
  - Same phone model, OS version, app version across "different" workers = likely ring members
  - MAC address spoofing detection (device manufacturer validation)
  - Same network ISP/telecom provider for geographically scattered workers

- **Claim Similarity Clustering:**
  - Claimed disruption zone (all members claim same 1km radius)
  - Claim amounts (all claim exact same DC amount for same duration)
  - Telegram group membership signals (same claim timestamps across members)

- **Build a Fraud Ring Graph:**
  ```
  Node = Worker Account
  Edge = Similarity Score (8 dimensions: timing, location, amount, device, ISP, claim pattern, weather match, platform activity)
  If similarity_score > 0.75 between two accounts, they're likely ring members.
  If Account A connects to B, B to C, C to D → Ring of 4 detected.
  Freeze all 4 until review complete.
  ```

#### Layer 5: AI Probabilistic Scoring (Bayesian Confidence Model)
**The Logic:** Combine all signals into a single fraud likelihood score.

```
P(Genuine Claim | GPS, Platform Activity, Weather, Behavior, Ring, Device) = ?

Using Naive Bayes:
  P(Genuine) = 
    P(GPS plausible | history) × 
    P(Platform activity shows disruption) × 
    P(Weather actually occurred) × 
    P(Behavior matches baseline) × 
    P(No ring co-conspirators) × 
    P(Device not spoofed)
  
Three Outcome Buckets:
  - Score > 0.85: INSTANT APPROVAL (auto-payout in 1 hour)
  - Score 0.50–0.85: PROVISIONAL APPROVAL + REVIEW (payout in 24 hours, clawback window 48 hours)
  - Score < 0.50: FLAGGED FOR MANUAL REVIEW (no payout until verified)
```

#### Layer 6: Honest Worker UX & Appeals
**The Logic:** Don't penalize legitimate workers experiencing network drops during real disruptions.

- **Smart Flagging (Not Auto-Denial):**
  - Flagged claim ≠ Denied claim. Worker gets provisional payout while being verified.
  - First-time claimants get automatic trust bonus (+0.15 to confidence score)
  - Claims during ACTUAL severe weather events get higher confidence threshold (more lenient)

- **Appeal Mechanism for False Negatives:**
  - Worker can submit video/photo evidence of disruption (rain/wind/flooding from phone camera)
  - Geolocation metadata from submitted media compared to claimed location (±50m accuracy)
  - Voice call with worker: confirm story matches claim (verbal consistency check)
  - Historical context: if worker has 50+ on-time deliveries, trust score increases

- **Transparent Scoring:**
  - Worker can see WHY they were flagged (not a black box)
  - Example: "Your claim matched the weather data, but your device model appears identical to 3 other accounts claiming same disruption. Please submit proof."

#### Layer 7: Real-Time Intervention & Fund Recovery
**The Logic:** Detect and stop rings while fraud is in-flight, recover funds immediately.

- **Ring Alert Threshold:**
  - When 5+ coordinated accounts flagged simultaneously → instant ring alert
  - Freeze all accounts in detected ring (no further payouts)
  - Notify compliance + law enforcement immediately

- **Clawback Authority:**
  - For confirmed fraud (post-review), recover payout via wallet debit
  - If worker's wallet balance insufficient, mark account for debt recovery
  - Repeat offenders: permanent blacklist across all partner platforms

- **Device Blacklisting:**
  - Blacklist phone IMEI/MAC of confirmed fraudsters
  - Prevent same device from creating new accounts
  - Cross-platform sharing: notify Zomato/Swiggy/Zepto to flag same IMEI

### Why This Strategy Wins Against the Fraud Ring

| Fraud Ring Tactic | ShramSuraksha Defense | Why It Works |
|---|---|---|
| GPS spoofing | Behavioral + platform verification | No single spoofed GPS stands alone |
| Coordinated Telegram timing | Ring detection via graph clustering | Catches coordinated behavior automatically |
| Fake weather claims | Multi-source environmental validation | Real weather must match location ± 15 min |
| Distributed across 500 accounts | Device fingerprinting + ISP tracking | Ring members leak identifying signals |
| Same claim amounts | Similarity clustering | Flags repetitive patterns instantly |
| Network drop excuses | Honest worker UX + appeals | Legitimate workers don't get punished |

### Feasibility & Build Timeline

| Phase | Weeks | Focus |
|---|---|---|
| Seed (Phase 1) | 1–2 | Layer 1 + Layer 2 (behavioral modeling + platform APIs) |
| Scale (Phase 2) | 3–4 | Layer 3 + Layer 4 (weather fusion + ring detection) |
| Soar (Phase 3) | 5–6 | Layer 5 + Layer 6 + Layer 7 (ML scoring + UX + intervention) |

---

## Tech Stack

> *To be finalized as the build progresses across phases.*

| Layer | Technology |
|---|---|
| Frontend | TBD |
| Backend | TBD |
| Behavioral ML | Python (scikit-learn / XGBoost for pattern detection) |
| Ring Detection | NetworkX / Graph-tool (fraud ring clustering) |
| Bayesian Scoring | PyMC / Stan (probabilistic modeling) |
| Weather APIs | Google Weather + OpenWeather + IQAir + IMD API |
| Device Fingerprinting | TBD |
| Platform APIs | Zomato / Swiggy / Zepto Backend Integration (TBD) |
| Database | TBD |
| Cloud | TBD |

---

## Architecture

> *Architecture diagram will be added in the Scale phase.*

---

## Team

**Team Name:** Era  
**Institution:** National Insurance Academy (NIA) × Guidewire DEVTrails 2026

| Name | Role |
|---|---|
| Ayush Raj Chourasia | Team Leader |
| Tribhuwan Singh | Member |
| Satyajit Sethy | Member |
| Surajit Sahoo | Member |
| E Sailaja | Member |

---

## Hackathon Context

**Competition:** [Guidewire DEVTrails 2026: Unicorn Chase](https://guidewiredevtrails.com/)  
**Organized by:** Guidewire Software × National Insurance Academy (NIA)  
**Format:** 45-day virtual startup simulation — build a company, not just code

### The Startup Game
- Starting Capital: **DC 1,00,000** (DEVTrails Coins)
- Weekly Burn: DC 5,000 (Seed) → DC 12,000 (Scale) → DC 18,000/week (Soar)
- Total Mandatory Burn: **DC 75,000** over 6 weeks
- Bottom 25% of teams eliminated each phase
- Balance hitting DC 0 = Bankruptcy = Elimination

### Prize Pool: ₹6,00,000
| Rank | Prize |
|---|---|
| 🥇 1st Place | ₹2,50,000 |
| 🥈 2nd Place | ₹1,50,000 |
| 🥉 3rd Place | ₹1,00,000 |
| 🏆 Recognition Award for Excellence | ₹1,00,000 |
| All Participants | Certificate |

Top 5 teams present live at **DevSummit Bangalore (May 13–16, 2026)** to 40+ tech giants, InsurTech product heads, and 3,000+ industry professionals.

---

## Timeline & Phases

| Phase | Dates | Submission Deadline | Weekly Burn |
|---|---|---|---|
| 🌱 **Seed** (Phase 1) | March 4 – March 20 | **March 20** | DC 5,000/week |
| 📈 **Scale** (Phase 2) | March 21 – April 4 | **April 4** | DC 12,000/week |
| 🚀 **Soar** (Phase 3) | April 5 – April 17 | **April 17** | DC 18,000/week |
| 🏆 **Grand Finale** | May 13 – 16 | — | DevSummit Bangalore |

### Late Penalty Warning
| Delay | Seed | Scale | Soar |
|---|---|---|---|
| On Time | DC 0 | DC 0 | DC 0 |
| 1 Day Late | DC 12,000 | DC 20,000 | DC 40,000 |
| 2 Days Late | DC 15,000 | DC 26,000 | DC 52,000 |
| 3 Days Late | DC 18,000 | DC 30,000 | DC 60,000 |
| 3+ Days Late | ❌ ELIMINATED | ❌ ELIMINATED | ❌ ELIMINATED |

> *"Submit broken code on time. Fix it later. Being late is always more expensive than being imperfect."*

---

<div align="center">

**Built with purpose for India's 15 million gig workers.**  
*Guidewire DEVTrails 2026 | Team Era*

</div>
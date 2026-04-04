# 🛡️ ShramSuraksha — AI-Powered Parametric Insurance for India's Gig Economy

> **Team Era** | Guidewire DEVTrails 2026 | Phase 2 Submission

## 📋 Problem Statement

India's **platform-based delivery partners** (Zomato, Swiggy, Zepto, Amazon, Blinkit) are the backbone of our digital economy. However, external disruptions like **extreme weather, pollution, and curfews** cause them to lose **20–30% of monthly earnings** with **zero income protection**.

**ShramSuraksha** is an AI-enabled **parametric insurance platform** that provides automated coverage and instant payouts to gig workers when external disruptions impact their ability to work.

## 🎯 Our Persona: Food & Quick-Commerce Delivery Workers

We focus on delivery partners from **Zomato, Swiggy, Zepto, Blinkit** — workers who operate outdoors and are most vulnerable to weather and environmental disruptions.

## 🏗️ Architecture

```
┌──────────────────┐        ┌──────────────────────────┐
│   React + Vite   │──API──▶│   Express.js Backend     │
│   (Vercel)       │        │   (Railway)              │
└──────────────────┘        │                          │
                            │  ┌──────────────────┐    │
                            │  │  Gemini AI Engine │    │
                            │  │  - Premium Calc   │    │
                            │  │  - Fraud Detection│    │
                            │  │  - Risk Assessment│    │
                            │  └──────────────────┘    │
                            │                          │
                            │  ┌──────────────────┐    │
                            │  │  OpenWeatherMap   │    │
                            │  │  - Real-time Wx   │    │
                            │  │  - AQI Data       │    │
                            │  │  - Forecasts      │    │
                            │  └──────────────────┘    │
                            └──────────────────────────┘
```

## ⚡ Key Features

### 1. AI-Powered Dynamic Premium Calculation
- **Gemini AI** calculates personalized weekly premiums based on:
  - Zone-specific risk factors (flood zones, heat islands)
  - Historical weather data & forecasts
  - Worker's claims history & platform type
  - Real-time AQI and temperature data
- Premiums range from **₹29–₹119/week** matching gig worker payout cycles

### 2. Parametric Trigger System
Automated, zero-paperwork claim triggers using real-time data:

| Trigger | Threshold | Data Source | Payout Range |
|---------|-----------|-------------|--------------|
| Heavy Rainfall | > 30mm/hr | IMD | ₹290–₹720 |
| Severe AQI | > 200 AQI | CPCB | ₹120–₹300 |
| Extreme Heat | > 42°C | IMD | ₹210–₹525 |
| Flooding | > 50mm/hr | IMD | ₹390–₹975 |
| Storm | > 80km/h | IMD | ₹330–₹825 |

### 3. Intelligent Fraud Detection
Multi-layer AI fraud engine:
- **GPS validation** — Location verification against registered zone
- **Duplicate detection** — Same trigger type blocked within 6-hour window
- **Pattern analysis** — Historical claim frequency anomalies
- **Gemini AI scoring** — Contextual fraud probability assessment

### 4. Instant Payout Processing
- Claims settled in **< 90 seconds** average
- Mock UPI payment integration
- Offline-capable — claims queue and auto-submit on reconnect

### 5. Dual Dashboards
- **Worker Dashboard**: Coverage status, weather alerts, claim history, earnings protected
- **Admin Dashboard**: Loss ratios, fraud alerts, predictive analytics, worker management, interactive charts

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 8, Framer Motion, Recharts, Lucide Icons |
| Backend | Express.js, Node.js |
| AI Engine | Google Gemini 2.0 Flash |
| Weather Data | OpenWeatherMap API (real-time, AQI, forecasts) |
| Styling | Vanilla CSS with design system tokens |
| Deployment | Vercel (frontend) + Railway (backend) |

## 📱 Weekly Premium Model

| Plan | Weekly Premium | Daily Coverage | Weekly Coverage | Triggers |
|------|---------------|----------------|-----------------|----------|
| Basic | ₹29/week | ₹300/day | ₹2,100/week | Weather |
| Standard | ₹59/week | ₹850/day | ₹5,950/week | Weather + AQI + Heat |
| Premium | ₹119/week | ₹1,800/day | ₹12,600/week | All triggers |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
# Clone the repo
git clone https://github.com/Ayush-Raj-Chourasia/ShramSuraksha.git
cd ShramSuraksha

# Install frontend dependencies
npm install

# Install backend dependencies
cd server && npm install && cd ..
```

### Environment Variables

Create a `.env` file in the root:

```env
PORT=3001
WEATHER_API_KEY=your_openweathermap_key
GEMINI_API_KEY=your_gemini_api_key
```

### Running Locally

```bash
# Terminal 1: Start backend
cd server && node index.js

# Terminal 2: Start frontend
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001/api/health

### Production Build

```bash
npm run build
```

## 📊 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new worker |
| POST | /api/auth/login | Login with phone |
| GET | /api/policies/plans | Get available plans |
| POST | /api/policies/activate | Activate a policy |
| POST | /api/claims/file | File a parametric claim |
| GET | /api/weather/current/:city | Real-time weather |
| GET | /api/weather/aqi/:city | Air quality index |
| POST | /api/ai/calculate-premium | AI premium calculation |
| POST | /api/ai/fraud-check | AI fraud detection |
| POST | /api/ai/risk-assessment | Zone risk assessment |
| GET | /api/stats | Platform statistics |

## 👥 Team Era

- **Ayush Raj Chourasia** — Team Leader
- **Tribhuwan Singh** — Member
- **Satyajit Sethy** — Member
- **Surajit Sahoo** — Member
- **E Sailaja** — Member

## 📄 License

MIT License — See [LICENSE](LICENSE) for details.

---

*Built with ❤️ for Guidewire DEVTrails 2026 — Protecting India's Gig Workers*

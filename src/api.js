import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'https://shramsuraksha-api-production.up.railway.app';

const api = axios.create({
  baseURL: API_BASE + '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
});

// ── Auth & OTP ──────────────────────────────────────────────────────────
export const sendOTP = (data) => api.post('/auth/send-otp', data);
export const verifyOTP = (data) => api.post('/auth/verify-otp', data);
export const registerWorker = (data) => api.post('/auth/register', data);
export const loginWorker = (phone, email) => api.post('/auth/login', { phone, email });
export const getProfile = (userId) => api.get(`/auth/profile/${userId}`);
export const getAllWorkers = () => api.get('/auth/workers');

// ── Policies ────────────────────────────────────────────────────────────
export const getPlans = () => api.get('/policies/plans');
export const getUserPolicies = (userId) => api.get(`/policies/user/${userId}`);
export const activatePolicy = (data) => api.post('/policies/activate', data);
export const getAllPolicies = () => api.get('/policies/all');

// ── Claims ──────────────────────────────────────────────────────────────
export const getUserClaims = (userId) => api.get(`/claims/user/${userId}`);
export const fileClaim = (data) => api.post('/claims/file', data);
export const getAllClaims = () => api.get('/claims/all');
export const getAlerts = () => api.get('/claims/alerts');
export const getTriggers = () => api.get('/claims/triggers');

// ── Weather ─────────────────────────────────────────────────────────────
export const getWeather = (city) => api.get(`/weather/current/${city}`);
export const getAQI = (city) => api.get(`/weather/aqi/${city}`);
export const getForecast = (city) => api.get(`/weather/forecast/${city}`);

// ── AI & Analytics ──────────────────────────────────────────────────────
export const calculatePremium = (data) => api.post('/ai/calculate-premium', data);
export const fraudCheck = (data) => api.post('/ai/fraud-check', data);
export const riskAssessment = (data) => api.post('/ai/risk-assessment', data);
export const getBehavioralScore = (userId) => api.get(`/ai/behavioral-score/${userId}`);
export const getCityTierBreakdown = () => api.get('/ai/city-tiers');
export const getMonitorStatus = () => api.get('/ai/monitor-status');

// ── Stats ────────────────────────────────────────────────────────────────
export const getStats = () => api.get('/stats');
export const getHealth = () => api.get('/health');
export const getLogs = (params = {}) => api.get('/logs', { params });

export default api;

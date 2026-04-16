import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'https://shramsuraksha-api-production.up.railway.app';

const api = axios.create({
  baseURL: API_BASE + '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
});

const withAdminAuth = (adminToken) => ({
  headers: { Authorization: `Bearer ${adminToken}` }
});

// ── Auth & OTP ──────────────────────────────────────────────────────────
export const sendOTP = (data) => api.post('/auth/send-otp', data);
export const verifyOTP = (data) => api.post('/auth/verify-otp', data);
export const googleAuth = (credential) => api.post('/auth/google', { credential });
export const adminLogin = (email, password) => api.post('/auth/admin/login', { email, password });
export const registerWorker = (data) => api.post('/auth/register', data);
export const loginWorker = (phone, email) => api.post('/auth/login', { phone, email });
export const getProfile = (userId) => api.get(`/auth/profile/${userId}`);
export const getAllWorkers = (adminToken) => api.get('/auth/workers-secure', withAdminAuth(adminToken));

// ── Policies ────────────────────────────────────────────────────────────
export const getPlans = () => api.get('/policies/plans');
export const getUserPolicies = (userId) => api.get(`/policies/user/${userId}`);
export const activatePolicy = (data) => api.post('/policies/activate', data);
export const getAllPolicies = () => api.get('/policies/all');

// ── Claims ──────────────────────────────────────────────────────────────
export const getUserClaims = (userId) => api.get(`/claims/user/${userId}`);
export const fileClaim = (data) => api.post('/claims/file', data);
export const getAllClaims = (adminToken) => api.get('/claims/all', withAdminAuth(adminToken));
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
export const getCityTierBreakdown = (adminToken) => api.get('/ai/city-tiers', withAdminAuth(adminToken));
export const getMonitorStatus = (adminToken) => api.get('/ai/monitor-status', withAdminAuth(adminToken));

// ── Stats ────────────────────────────────────────────────────────────────
export const getStats = (adminToken) => api.get('/stats', withAdminAuth(adminToken));
export const getHealth = () => api.get('/health');
export const getLogs = (adminToken, params = {}) => api.get('/logs', { ...withAdminAuth(adminToken), params });

export default api;

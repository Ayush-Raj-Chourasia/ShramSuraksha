import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import PlansPage from './pages/PlansPage';
import ClaimsPage from './pages/ClaimsPage';
import AlertsPage from './pages/AlertsPage';
import AdminPage from './pages/AdminPage';
import './App.css';

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('shram_user');
      return saved ? JSON.parse(saved) : null;
    } catch(e) { return null; }
  });
  const [policy, setPolicy] = useState(() => {
    try {
      const saved = localStorage.getItem('shram_policy');
      return saved ? JSON.parse(saved) : null;
    } catch(e) { return null; }
  });

  useEffect(() => {
    if (user) localStorage.setItem('shram_user', JSON.stringify(user));
    else localStorage.removeItem('shram_user');
  }, [user]);

  useEffect(() => {
    if (policy) localStorage.setItem('shram_policy', JSON.stringify(policy));
    else localStorage.removeItem('shram_policy');
  }, [policy]);

  return (
    <div className="app-root">
      <Navbar user={user} setUser={setUser} />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<LandingPage user={user} />} />
          <Route path="/auth" element={<AuthPage setUser={setUser} setPolicy={setPolicy} />} />
          <Route path="/dashboard" element={<Dashboard user={user} policy={policy} setPolicy={setPolicy} />} />
          <Route path="/plans" element={<PlansPage user={user} policy={policy} setPolicy={setPolicy} />} />
          <Route path="/claims" element={<ClaimsPage user={user} policy={policy} />} />
          <Route path="/alerts" element={<AlertsPage user={user} />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </main>
    </div>
  );
}

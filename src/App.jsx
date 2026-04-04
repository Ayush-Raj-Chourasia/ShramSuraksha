import { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
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
  const [user, setUser] = useState(null);
  const [policy, setPolicy] = useState(null);

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

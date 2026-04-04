import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import PlansPage from './pages/PlansPage';
import ClaimsPage from './pages/ClaimsPage';
import AlertsPage from './pages/AlertsPage';
import AdminPage from './pages/AdminPage';
import './App.css';

// Initialize Supabase Client for Realtime WebSockets
const supabaseUrl = 'https://zjfjvzejndkgjqcfcajz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqZmp2emVqbmRrZ2pxY2ZjYWp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzMDc1NDYsImV4cCI6MjA5MDg4MzU0Nn0.ukHUtLKxT32K_XHDiQPIU201bQokavH2CaBIB7y0ufM';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function App() {
  const [user, setUser] = useState(null);
  const [policy, setPolicy] = useState(null);
  const [toaast, setToast] = useState(null);

  useEffect(() => {
    // Subscribe to entire database changes (alerts) for realtime push
    const channel = supabase.channel('realtime-alerts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'alerts' }, payload => {
        setToast({
          title: payload.new.title || 'New Alert',
          desc: payload.new.description || 'Threshold exceeded',
          type: payload.new.severity === 'fraud' ? 'danger' : 'warning'
        });
        setTimeout(() => setToast(null), 6000);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="app-root">
      <Navbar user={user} setUser={setUser} />
      
      {/* Realtime Toast Notification */}
      <AnimatePresence>
        {toaast && (
          <motion.div 
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            style={{
               position: 'fixed', top: 80, left: '50%', zIndex: 9999,
               background: toaast.type === 'danger' ? 'var(--danger-bg)' : 'var(--warning-bg)',
               border: `1px solid ${toaast.type === 'danger' ? 'var(--danger)' : 'var(--warning)'}`,
               padding: '16px 24px', borderRadius: 12, display: 'flex', gap: 12, alignItems: 'center',
               boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
            }}
          >
            <Bell size={24} color={toaast.type === 'danger' ? 'var(--danger)' : 'var(--warning)'} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{toaast.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{toaast.desc}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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

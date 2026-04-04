import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import authRoutes from './routes/auth.js';
import policyRoutes from './routes/policy.js';
import claimsRoutes from './routes/claims.js';
import weatherRoutes from './routes/weather.js';
import aiRoutes from './routes/ai.js';
import { connectDB, supabase } from './store.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/policies', policyRoutes);
app.use('/api/claims', claimsRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/ai', aiRoutes);

app.get('/api/health', async (req, res) => {
  try {
    const { count: workers } = await supabase.from('workers').select('*', { count: 'exact', head: true });
    const { count: activePolicies } = await supabase.from('policies').select('*', { count: 'exact', head: true }).eq('status', 'active');
    const { count: totalClaims } = await supabase.from('claims').select('*', { count: 'exact', head: true });
    res.json({ status: 'ok', service: 'ShramSuraksha API', database: 'Supabase', timestamp: new Date().toISOString(), workers, activePolicies, totalClaims });
  } catch (err) {
    res.json({ status: 'ok', service: 'ShramSuraksha API', database: 'error', error: err.message });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    const { count: totalWorkers } = await supabase.from('workers').select('*', { count: 'exact', head: true });
    const { data: policies } = await supabase.from('policies').select('*');
    const { data: claims } = await supabase.from('claims').select('*');
    
    const activePolicies = policies?.filter(p => p.status === 'active').length || 0;
    const settledClaims = claims?.filter(c => c.status === 'settled') || [];
    const totalPaidOut = settledClaims.reduce((s, c) => s + (c.payoutAmount || 0), 0);
    const avgSettleTime = settledClaims.length
      ? Math.round(settledClaims.reduce((s, c) => s + (c.settleTime || 0), 0) / settledClaims.length)
      : 0;
    const totalPremiums = policies?.reduce((s, p) => s + (p.weeklyPremium || 0), 0) || 0;
    const lossRatio = totalPremiums > 0 ? ((totalPaidOut / totalPremiums) * 100).toFixed(1) : '0.0';
    const fraudFlags = claims?.filter(c => c.fraudFlag).length || 0;

    res.json({ totalWorkers, activePolicies, totalClaims: claims?.length || 0, settledClaims: settledClaims.length, totalPaidOut, avgSettleTime, lossRatio, fraudFlags });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🛡️ ShramSuraksha API running on port ${PORT}`);
  });
}

start();

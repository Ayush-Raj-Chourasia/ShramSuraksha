import { createClient } from '@supabase/supabase-js';

export let supabase;

export async function connectDB() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    console.log('⚠️  Supabase URL or Key not set');
    return false;
  }
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase connected to', supabaseUrl);
    return true;
  } catch (err) {
    console.error('❌ Supabase connect failed:', err.message);
    return false;
  }
}

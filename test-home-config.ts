import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf-8');
const envUrlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const envKeyMatch = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/);

const supabaseUrl = envUrlMatch ? envUrlMatch[1].trim() : '';
const serviceRoleKey = envKeyMatch ? envKeyMatch[1].trim() : '';

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function run() {
  const { data, error } = await supabaseAdmin.from('home_config').select('*');
  console.log("home_config table query:", { data, error });
}

run();

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf-8');
const envUrlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const envKeyMatch = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/);

const supabaseUrl = envUrlMatch ? envUrlMatch[1].trim() : '';
const serviceRoleKey = envKeyMatch ? envKeyMatch[1].trim() : '';

console.log("URL:", supabaseUrl ? "Present" : "Missing");
console.log("Key:", serviceRoleKey ? "Present" : "Missing");

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function run() {
  const userId = '91009713-39fc-40f7-8e61-729df34346ea'; // user id from log
  console.log("Updating userId:", userId);
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update({ role: 'admin' })
    .eq('id', userId)
    .select();
  console.log("Update result:", data, error);
}

run();

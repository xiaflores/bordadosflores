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
  const userId = '91009713-39fc-40f7-8e61-729df34346ea'; // user id from log
  console.log("Updating auth user metadata for:", userId);
  
  const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
    userId,
    { user_metadata: { role: 'admin' } }
  );
  
  console.log("Auth update result:", data?.user?.user_metadata, error);

  // Now check if profile changed
  const { data: profileData } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();
    
  console.log("Profile role is now:", profileData?.role);
}

run();

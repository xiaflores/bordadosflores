import * as fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf-8');
const envUrlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const supabaseUrl = envUrlMatch ? envUrlMatch[1].trim() : '';

async function run() {
  console.log("Fetching OpenAPI spec from:", `${supabaseUrl}/rest/v1/?apikey=...`);
  const res = await fetch(`${supabaseUrl}/rest/v1/`, {
    headers: {
      'Accept': 'application/openapi+json'
    }
  });
  const data = await res.json();
  const profilesDef = data.definitions?.profiles;
  console.log("Profiles definition:", JSON.stringify(profilesDef, null, 2));
}

run();

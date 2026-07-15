const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

async function testSupabase() {
  console.log("=========================================");
  console.log("🔍 TESTING LIVE SUPABASE CONNECTION");
  console.log("=========================================");

  // 1. Read supabase_config.json
  const configPath = path.join(__dirname, '..', 'supabase_config.json');
  if (!fs.existsSync(configPath)) {
    console.error("❌ Error: supabase_config.json not found!");
    process.exit(1);
  }

  let config;
  try {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch (err) {
    console.error("❌ Error: Failed to parse supabase_config.json:", err.message);
    process.exit(1);
  }

  const { SUPABASE_URL, SUPABASE_ANON_KEY } = config;
  console.log(`Supabase URL: ${SUPABASE_URL}`);
  console.log(`Supabase Anon Key: ${SUPABASE_ANON_KEY ? 'Present (Configured)' : 'Missing'}`);

  // 2. Initialize client
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // 3. Test Query Categories
  console.log("\nQuerying 'categories' table...");
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('*')
    .limit(5);

  if (catError) {
    console.error("❌ Error querying categories:", catError.message);
  } else {
    console.log(`✅ Success! Found ${categories.length} categories.`);
    if (categories.length > 0) {
      console.log("First Category Sample:", categories[0]);
    }
  }

  // 4. Test Query Cafe Settings
  console.log("\nQuerying 'cafe_settings' table...");
  const { data: settings, error: setImgError } = await supabase
    .from('cafe_settings')
    .select('*')
    .limit(1);

  if (setImgError) {
    console.error("❌ Error querying cafe_settings:", setImgError.message);
  } else {
    console.log(`✅ Success! Settings Row count: ${settings.length}`);
    if (settings.length > 0) {
      console.log("Cafe Settings Sample:", settings[0]);
    }
  }
}

testSupabase().catch(err => {
  console.error("Unhandled exception:", err);
});

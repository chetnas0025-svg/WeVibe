const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://xbzjjtqyxokefzjvvqyd.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_XiQmI4Ckcg9d7nqlbFrRWg_kRDi4fmo";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function run() {
  console.log("Attempting to sign up admin user pinkblueadmin@gmail.com...");
  const { data, error } = await supabase.auth.signUp({
    email: 'pinkblueadmin@gmail.com',
    password: 'password'
  });

  if (error) {
    if (error.message.includes("User already exists")) {
      console.log("User already exists! Excellent, no action needed.");
    } else {
      console.error("Signup failed:", error.message);
    }
  } else {
    console.log("Admin user created successfully!");
    console.log("User ID:", data.user.id);
  }
}

run();

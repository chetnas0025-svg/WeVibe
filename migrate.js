const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const DB_FILE = path.join(__dirname, 'db.json');
const CONFIG_FILE = path.join(__dirname, 'supabase_config.json');

async function runMigration() {
  console.log("===================================================");
  console.log("🚀 STARTING DB MIGRATION: Local JSON -> Live Supabase");
  console.log("===================================================");

  // 1. Load Local db.json
  if (!fs.existsSync(DB_FILE)) {
    console.error("❌ Error: Local db.json database file not found. Run server.js first to generate it.");
    process.exit(1);
  }
  let db;
  try {
    db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch (e) {
    console.error("❌ Error: Failed to parse db.json file:", e);
    process.exit(1);
  }

  // 2. Load Supabase credentials
  if (!fs.existsSync(CONFIG_FILE)) {
    console.error("❌ Error: supabase_config.json configuration file not found. Provide credentials first.");
    process.exit(1);
  }
  let config;
  try {
    config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
  } catch (e) {
    console.error("❌ Error: Failed to parse supabase_config.json file:", e);
    process.exit(1);
  }

  const { SUPABASE_URL, SUPABASE_ANON_KEY } = config;
  if (!SUPABASE_URL || SUPABASE_URL === "https://your-supabase-url.supabase.co") {
    console.error("❌ Error: Valid SUPABASE_URL has not been configured inside supabase_config.json.");
    process.exit(1);
  }

  console.log(`Connecting to Supabase project: ${SUPABASE_URL}...`);
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // 3. Migrate Categories
  if (Array.isArray(db.categories) && db.categories.length > 0) {
    console.log(`\n📁 Migrating ${db.categories.length} Categories...`);
    for (const cat of db.categories) {
      const { error } = await supabase
        .from('categories')
        .upsert({
          id: cat.id,
          name: cat.name,
          display_order: cat.display_order,
          is_active: cat.is_active,
          created_at: cat.created_at,
          updated_at: cat.updated_at
        });
      if (error) {
        console.error(`  ❌ Failed to upsert category "${cat.name}":`, error.message);
      } else {
        console.log(`  ✅ Upserted category: "${cat.name}"`);
      }
    }
  }

  // 4. Migrate Menu Items
  if (Array.isArray(db.menu_items) && db.menu_items.length > 0) {
    console.log(`\n🍔 Migrating ${db.menu_items.length} Menu Items...`);
    for (const item of db.menu_items) {
      const { error } = await supabase
        .from('menu_items')
        .upsert({
          id: item.id,
          category_id: item.category_id,
          name: item.name,
          description: item.description,
          price_small: item.price_small,
          price_medium: item.price_medium,
          price_large: item.price_large,
          price_xxxl: item.price_xxxl,
          is_veg: item.is_veg,
          is_spicy: item.is_spicy,
          is_must_try: item.is_must_try,
          image_url: item.image_url,
          is_active: item.is_active,
          display_order: item.display_order,
          created_at: item.created_at,
          updated_at: item.updated_at
        });
      if (error) {
        console.error(`  ❌ Failed to upsert menu item "${item.name}":`, error.message);
      } else {
        console.log(`  ✅ Upserted menu item: "${item.name}"`);
      }
    }
  }

  // 5. Migrate Gallery Images
  if (Array.isArray(db.gallery_images) && db.gallery_images.length > 0) {
    console.log(`\n🖼️ Migrating ${db.gallery_images.length} Gallery Images...`);
    for (const img of db.gallery_images) {
      const { error } = await supabase
        .from('gallery_images')
        .upsert({
          id: img.id,
          image_url: img.image_url,
          caption: img.caption,
          display_order: img.display_order,
          is_active: img.is_active,
          created_at: img.created_at,
          updated_at: img.updated_at
        });
      if (error) {
        console.error(`  ❌ Failed to upsert gallery image "${img.caption}":`, error.message);
      } else {
        console.log(`  ✅ Upserted gallery image: "${img.caption}"`);
      }
    }
  }

  // 6. Migrate Offers
  if (Array.isArray(db.offers) && db.offers.length > 0) {
    console.log(`\n🏷️ Migrating ${db.offers.length} Offers...`);
    for (const offer of db.offers) {
      const { error } = await supabase
        .from('offers')
        .upsert({
          id: offer.id,
          title: offer.title,
          description: offer.description,
          badge_text: offer.badge_text,
          image_url: offer.image_url,
          start_date: offer.start_date,
          end_date: offer.end_date,
          is_active: offer.is_active,
          display_order: offer.display_order,
          created_at: offer.created_at,
          updated_at: offer.updated_at
        });
      if (error) {
        console.error(`  ❌ Failed to upsert offer "${offer.title}":`, error.message);
      } else {
        console.log(`  ✅ Upserted offer: "${offer.title}"`);
      }
    }
  }

  // 7. Migrate Cafe Settings
  if (Array.isArray(db.cafe_settings) && db.cafe_settings.length > 0) {
    console.log(`\n⚙️ Migrating Cafe Settings...`);
    for (const settings of db.cafe_settings) {
      const { error } = await supabase
        .from('cafe_settings')
        .upsert({
          id: settings.id,
          address: settings.address,
          map_embed_url: settings.map_embed_url,
          phone: settings.phone,
          whatsapp_number: settings.whatsapp_number,
          email: settings.email,
          instagram_url: settings.instagram_url,
          facebook_url: settings.facebook_url,
          hours_json: settings.hours_json,
          gemini_api_key: settings.gemini_api_key,
          created_at: settings.created_at,
          updated_at: settings.updated_at
        });
      if (error) {
        console.error(`  ❌ Failed to upsert cafe settings:`, error.message);
      } else {
        console.log(`  ✅ Upserted global cafe settings.`);
      }
    }
  }

  console.log("\n===================================================");
  console.log("🎉 DATABASE MIGRATION COMPLETED SUCCESSFULLY!");
  console.log("===================================================");
}

runMigration().catch(err => {
  console.error("❌ Unhandled Migration Error:", err);
  process.exit(1);
});

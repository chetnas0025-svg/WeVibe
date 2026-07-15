const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const DB_FILE = path.join(__dirname, '..', 'db.json');
const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));

const client = new Client({
  host: 'aws-0-ap-northeast-1.pooler.supabase.com',
  port: 5432,
  user: 'postgres.xbzjjtqyxokefzjvvqyd',
  password: 'qo8zkwXCeyjIoxvX',
  database: 'postgres',
  ssl: {
    rejectUnauthorized: false
  }
});

async function runMigration() {
  console.log("Connecting to Postgres database for migration...");
  await client.connect();
  console.log("Connected. Beginning direct PostgreSQL migration (bypassing RLS)...");

  // 1. Categories
  if (Array.isArray(db.categories)) {
    console.log(`Migrating ${db.categories.length} Categories...`);
    for (const cat of db.categories) {
      const query = `
        INSERT INTO categories (id, name, display_order, is_active, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          display_order = EXCLUDED.display_order,
          is_active = EXCLUDED.is_active,
          updated_at = EXCLUDED.updated_at
      `;
      await client.query(query, [cat.id, cat.name, cat.display_order, cat.is_active, cat.created_at, cat.updated_at]);
    }
  }

  // 2. Menu Items
  if (Array.isArray(db.menu_items)) {
    console.log(`Migrating ${db.menu_items.length} Menu Items...`);
    for (const item of db.menu_items) {
      const query = `
        INSERT INTO menu_items (id, category_id, name, description, price_small, price_medium, price_large, price_xxxl, is_veg, is_spicy, is_must_try, image_url, is_active, display_order, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        ON CONFLICT (id) DO UPDATE SET
          category_id = EXCLUDED.category_id,
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          price_small = EXCLUDED.price_small,
          price_medium = EXCLUDED.price_medium,
          price_large = EXCLUDED.price_large,
          price_xxxl = EXCLUDED.price_xxxl,
          is_veg = EXCLUDED.is_veg,
          is_spicy = EXCLUDED.is_spicy,
          is_must_try = EXCLUDED.is_must_try,
          image_url = EXCLUDED.image_url,
          is_active = EXCLUDED.is_active,
          display_order = EXCLUDED.display_order,
          updated_at = EXCLUDED.updated_at
      `;
      await client.query(query, [
        item.id, item.category_id, item.name, item.description,
        item.price_small, item.price_medium, item.price_large, item.price_xxxl,
        item.is_veg, item.is_spicy, item.is_must_try, item.image_url,
        item.is_active, item.display_order, item.created_at, item.updated_at
      ]);
    }
  }

  // 3. Gallery Images
  if (Array.isArray(db.gallery_images)) {
    console.log(`Migrating ${db.gallery_images.length} Gallery Images...`);
    for (const img of db.gallery_images) {
      const query = `
        INSERT INTO gallery_images (id, image_url, caption, display_order, is_active, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id) DO UPDATE SET
          image_url = EXCLUDED.image_url,
          caption = EXCLUDED.caption,
          display_order = EXCLUDED.display_order,
          is_active = EXCLUDED.is_active,
          updated_at = EXCLUDED.updated_at
      `;
      await client.query(query, [img.id, img.image_url, img.caption, img.display_order, img.is_active, img.created_at, img.updated_at]);
    }
  }

  // 4. Offers
  if (Array.isArray(db.offers)) {
    console.log(`Migrating ${db.offers.length} Offers...`);
    for (const offer of db.offers) {
      const query = `
        INSERT INTO offers (id, title, description, badge_text, image_url, start_date, end_date, is_active, display_order, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          badge_text = EXCLUDED.badge_text,
          image_url = EXCLUDED.image_url,
          start_date = EXCLUDED.start_date,
          end_date = EXCLUDED.end_date,
          is_active = EXCLUDED.is_active,
          display_order = EXCLUDED.display_order,
          updated_at = EXCLUDED.updated_at
      `;
      await client.query(query, [
        offer.id, offer.title, offer.description, offer.badge_text, offer.image_url,
        offer.start_date, offer.end_date, offer.is_active, offer.display_order,
        offer.created_at, offer.updated_at
      ]);
    }
  }

  // 5. Settings
  if (Array.isArray(db.cafe_settings)) {
    console.log(`Migrating Cafe Settings...`);
    for (const settings of db.cafe_settings) {
      const query = `
        INSERT INTO cafe_settings (id, address, map_embed_url, phone, whatsapp_number, email, instagram_url, facebook_url, hours_json, gemini_api_key, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (id) DO UPDATE SET
          address = EXCLUDED.address,
          map_embed_url = EXCLUDED.map_embed_url,
          phone = EXCLUDED.phone,
          whatsapp_number = EXCLUDED.whatsapp_number,
          email = EXCLUDED.email,
          instagram_url = EXCLUDED.instagram_url,
          facebook_url = EXCLUDED.facebook_url,
          hours_json = EXCLUDED.hours_json,
          gemini_api_key = EXCLUDED.gemini_api_key,
          updated_at = EXCLUDED.updated_at
      `;
      await client.query(query, [
        settings.id, settings.address, settings.map_embed_url, settings.phone, settings.whatsapp_number,
        settings.email, settings.instagram_url, settings.facebook_url, JSON.stringify(settings.hours_json),
        settings.gemini_api_key, settings.created_at, settings.updated_at
      ]);
    }
  }

  console.log("Direct PostgreSQL Migration finished successfully!");
  await client.end();
}

runMigration().catch(err => {
  console.error("Migration error:", err);
  client.end();
  process.exit(1);
});

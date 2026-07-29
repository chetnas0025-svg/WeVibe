-- ==========================================================================
-- PINK & BLUE CAFE — DATABASE SCHEMA & SECURITY POLICIES (SUPABASE POSTGRES)
-- ==========================================================================

-- 1. Automatic Timestamp Update Triggers Setup
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';


-- 2. Tables Definitions

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Menu Items Table
CREATE TABLE IF NOT EXISTS menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price_small NUMERIC,
    price_medium NUMERIC,
    price_large NUMERIC,
    price_xxxl NUMERIC,
    is_veg BOOLEAN DEFAULT true,
    is_must_try BOOLEAN DEFAULT false,
    is_spicy BOOLEAN DEFAULT false,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Gallery Images Table
CREATE TABLE IF NOT EXISTS gallery_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_url TEXT NOT NULL,
    caption TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Cafe Settings Table (Single-row configurations)
CREATE TABLE IF NOT EXISTS cafe_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    address TEXT NOT NULL,
    map_embed_url TEXT,
    phone TEXT NOT NULL,
    whatsapp_number TEXT NOT NULL,
    email TEXT NOT NULL,
    instagram_url TEXT,
    facebook_url TEXT,
    hours_json JSONB NOT NULL,
    gemini_api_key TEXT, -- Secure API Key for AI Menu scanning
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Offers/Promotional Banners Table
CREATE TABLE IF NOT EXISTS offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    badge_text TEXT,
    image_url TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Reservations Table
CREATE TABLE IF NOT EXISTS reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    date DATE NOT NULL,
    time TIME NOT NULL,
    party_size INTEGER NOT NULL,
    occasion_note TEXT,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'confirmed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Contact Submissions Table
CREATE TABLE IF NOT EXISTS contact_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email_or_phone TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Newsletter Signups Table
CREATE TABLE IF NOT EXISTS newsletter_signups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- 3. Triggers Registration for updated_at column
CREATE TRIGGER update_categories_modtime BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_menu_items_modtime BEFORE UPDATE ON menu_items FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_gallery_images_modtime BEFORE UPDATE ON gallery_images FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_cafe_settings_modtime BEFORE UPDATE ON cafe_settings FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_offers_modtime BEFORE UPDATE ON offers FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_reservations_modtime BEFORE UPDATE ON reservations FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_contact_submissions_modtime BEFORE UPDATE ON contact_submissions FOR EACH ROW EXECUTE FUNCTION update_modified_column();


-- 4. Enable Row Level Security (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE cafe_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_signups ENABLE ROW LEVEL SECURITY;


-- 5. Define RLS Policies for Anon & Authenticated Admin Roles

-- Categories Policies
CREATE POLICY "Allow public select on active categories" ON categories FOR SELECT TO anon USING (is_active = true);
CREATE POLICY "Allow authenticated full access on categories" ON categories FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Menu Items Policies
CREATE POLICY "Allow public select on active menu items" ON menu_items FOR SELECT TO anon USING (is_active = true);
CREATE POLICY "Allow authenticated full access on menu items" ON menu_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Gallery Images Policies
CREATE POLICY "Allow public select on active gallery images" ON gallery_images FOR SELECT TO anon USING (is_active = true);
CREATE POLICY "Allow authenticated full access on gallery images" ON gallery_images FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Cafe Settings Policies
CREATE POLICY "Allow public select on settings" ON cafe_settings FOR SELECT TO anon USING (true);
CREATE POLICY "Allow authenticated full access on settings" ON cafe_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Offers Policies
CREATE POLICY "Allow public select on active offers" ON offers FOR SELECT TO anon USING (is_active = true AND end_date >= CURRENT_DATE);
CREATE POLICY "Allow authenticated full access on offers" ON offers FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Reservations Policies
CREATE POLICY "Allow public insert on reservations" ON reservations FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow authenticated full access on reservations" ON reservations FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Contact Submissions Policies
CREATE POLICY "Allow public insert on contact submissions" ON contact_submissions FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow authenticated full access on contact submissions" ON contact_submissions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Newsletter Signups Policies
CREATE POLICY "Allow public insert on newsletter signups" ON newsletter_signups FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow authenticated full access on newsletter signups" ON newsletter_signups FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- 6. Supabase Storage buckets & policies for uploaded cafe photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('cafe-uploads', 'cafe-uploads', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow authenticated uploads to cafe-uploads bucket" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'cafe-uploads');

CREATE POLICY "Allow authenticated updates to cafe-uploads bucket" ON storage.objects
FOR UPDATE TO authenticated WITH CHECK (bucket_id = 'cafe-uploads');

CREATE POLICY "Allow authenticated deletions from cafe-uploads bucket" ON storage.objects
FOR DELETE TO authenticated USING (bucket_id = 'cafe-uploads');

CREATE POLICY "Allow public read-only access to cafe-uploads bucket" ON storage.objects
FOR SELECT TO public USING (bucket_id = 'cafe-uploads');


-- 7. Initial Seed Data: Global Settings Row
INSERT INTO cafe_settings (id, address, map_embed_url, phone, whatsapp_number, email, instagram_url, facebook_url, hours_json)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    '',
    '',
    '8950191495',
    '8950191495',
    'zato08100@gmail.com',
    'https://instagram.com',
    'https://facebook.com',
    '{"mon": "10:00 AM to 10:00 PM", "tue": "10:00 AM to 10:00 PM", "wed": "10:00 AM to 10:00 PM", "thu": "10:00 AM to 10:00 PM", "fri": "10:00 AM to 10:00 PM", "sat": "10:00 AM to 10:00 PM", "sun": "10:00 AM to 10:00 PM"}'
) ON CONFLICT DO NOTHING;


-- ==========================================================================
-- 8. SUBMISSION RATE-LIMITING TRIGGERS (Abuse Prevention)
-- ==========================================================================

-- Reservations Rate Limiter (Max 5 per hour per phone)
CREATE OR REPLACE FUNCTION check_reservation_rate_limit()
RETURNS TRIGGER AS $$
BEGIN
    IF (
        SELECT COUNT(*)
        FROM reservations
        WHERE phone = NEW.phone
          AND created_at > now() - INTERVAL '1 hour'
    ) >= 5 THEN
        RAISE EXCEPTION 'Rate limit exceeded for this phone number. Please try again in an hour.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER reservations_rate_limit_trigger
BEFORE INSERT ON reservations
FOR EACH ROW EXECUTE FUNCTION check_reservation_rate_limit();


-- Contact Submissions Rate Limiter (Max 5 per hour per email/phone)
CREATE OR REPLACE FUNCTION check_contact_rate_limit()
RETURNS TRIGGER AS $$
BEGIN
    IF (
        SELECT COUNT(*)
        FROM contact_submissions
        WHERE email_or_phone = NEW.email_or_phone
          AND created_at > now() - INTERVAL '1 hour'
    ) >= 5 THEN
        RAISE EXCEPTION 'Rate limit exceeded for this contact. Please try again in an hour.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER contact_submissions_rate_limit_trigger
BEFORE INSERT ON contact_submissions
FOR EACH ROW EXECUTE FUNCTION check_contact_rate_limit();


-- Newsletter Signups Rate Limiter (Max 5 per hour per email)
CREATE OR REPLACE FUNCTION check_newsletter_rate_limit()
RETURNS TRIGGER AS $$
BEGIN
    IF (
        SELECT COUNT(*)
        FROM newsletter_signups
        WHERE email = NEW.email
          AND created_at > now() - INTERVAL '1 hour'
    ) >= 5 THEN
        RAISE EXCEPTION 'Rate limit exceeded for this email. Please try again in an hour.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER newsletter_signups_rate_limit_trigger
BEFORE INSERT ON newsletter_signups
FOR EACH ROW EXECUTE FUNCTION check_newsletter_rate_limit();


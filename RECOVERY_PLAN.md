# 🛡️ Availability & Recovery Plan — Pink & Blue Cafe

This document outlines the backup procedures and step-by-step recovery workflow for the Pink & Blue Cafe web application and database.

---

## 1. BACKUP STRATEGY

### Database Backups
- **Paid Tier (Recommended)**: Enable **Supabase's Automatic Daily Backups** via the Supabase Dashboard -> Database -> Backups.
- **Free Tier (Alternative)**: Perform a **manual weekly database export**:
  1. Navigate to the Supabase Dashboard.
  2. Go to the **Table Editor** or **SQL Editor**.
  3. Export key tables (`categories`, `menu_items`, `gallery_images`, `cafe_settings`, `offers`) as CSV/JSON, or use the `pg_dump` utility:
     ```bash
     pg_dump -h db.your-project.supabase.co -U postgres -d postgres -F c -f backup_file.dump
     ```

### Media Assets Backup
- All uploaded images are stored inside the `cafe-uploads` Supabase Storage bucket.
- Keep a local backup folder containing the original high-resolution menu photos and cafe images. These act as an audit trail and an immediate asset recovery source.

---

## 2. DISASTER RECOVERY STEPS

### Scenario A: Frontend Website is Offline or Broken
1. Locate the hosting provider dashboard (e.g., **Vercel** or **Netlify**).
2. Go to the project deployments page.
3. Select the last known working deployment (associated with a stable Git commit on the `main` branch).
4. Click **Redeploy** or **Rollback** to make it live instantly.
5. If the codebase is corrupted, check the local git log:
   ```bash
   git log --oneline
   ```
   Revert code to the last stable state and push to `main` to trigger the automatic Git CI/CD build.

### Scenario B: Database Corrupted or Data Lost
1. Go to the Supabase Dashboard -> Database -> Backups.
2. Select the latest stable daily backup snapshot.
3. Click **Restore** to roll back the database state.
4. For manual backups:
   - Run the restoration query using `pg_restore` or upload the exported CSVs via the Table Editor.
5. Verify application data consistency by visiting `http://localhost:8000/index.html` and checking that categories and items render correctly.

### Scenario C: Lost Supabase Connection / Invalid Keys
1. Verify the `supabase_config.json` file in the environment config of the host server (or local development folder).
2. Ensure the `SUPABASE_URL` and `SUPABASE_ANON_KEY` match your active Supabase Project credentials.
3. If Turnstile or Sentry is failing, verify their key settings inside `supabase_config.json`.

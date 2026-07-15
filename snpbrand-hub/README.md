# SNP Brand — Accra Fulfillment Hub Partner App

This is a standalone, mobile-first React, TypeScript, and Vite web application designed for SNP Brand's Accra fulfillment hub partner. It connects to the same Supabase database backend as the main storefront, but isolates hub partner workflows (pending order fulfillment, live stock view, and walk-in sales logger) in a dedicated mobile-friendly layout optimized for smartphones.

## Tech Stack
- **React 18** with strict TypeScript
- **Tailwind CSS** (for styling, optimized for mobile screen dimensions)
- **React Router v6** (for client-side routing)
- **Supabase JS Client** (with real-time subscriptions enabled)
- **Lucide React** (for icons)

---

## 1. Local Setup Instructions

1. **Navigate to the Project Directory**:
   ```bash
   cd snpbrand-hub
   ```

2. **Configure Environment Variables**:
   Copy `.env.example` to `.env` and fill in the values:
   ```bash
   cp .env.example .env
   ```
   Add your Supabase details:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key-jwt
   ```

3. **Install Dependencies**:
   ```bash
   npm install
   ```

4. **Run Dev Server**:
   ```bash
   npm run dev
   ```
   By default, the Vite dev server runs on `http://localhost:3001`.

5. **Build for Production**:
   ```bash
   npm run build
   ```

---

## 2. Supabase Backend Setup

To support this app, you need to configure the following items in your Supabase project:

### A. Run Database Migration for Walk-in Sales
Go to the **SQL Editor** in your Supabase dashboard and run the SQL code from:
`supabase/migrations/log_walk_in_sale.sql`

This creates the `log_walk_in_sale` RPC function which executes stock decrements and storefront sales logs under a single Postgres transaction block.

### B. Create a Hub Partner Account
To allow a partner user to sign in, do the following:

1. **Create Auth User**:
   Go to **Authentication > Users** in Supabase and click **Add User** to invite or create a user. Copy the generated `User ID (UUID)`.

2. **Create User Profile Role**:
   Go to the **SQL Editor** (or Table Editor under `user_profiles`) and insert/update the user profile to assign them the `hub_partner` role:
   ```sql
   -- Insert profile if it doesn't exist
   INSERT INTO public.user_profiles (id, name, email, role)
   VALUES ('[USER_UUID]', 'Accra Hub Partner', 'partner-accra@snpbrand.com', 'hub_partner')
   ON CONFLICT (id) DO UPDATE SET role = 'hub_partner';
   ```

3. **Ensure locations table is seeded**:
   Confirm that Accra is present in the `locations` table:
   ```sql
   INSERT INTO public.locations (name) VALUES ('Accra') ON CONFLICT DO NOTHING;
   ```

---

## 3. Deploying to Vercel

1. **Push Code to Git**:
   Commit and push the codebase to your Git repository (GitHub/GitLab/Bitbucket).

2. **Import Project to Vercel**:
   - Go to your Vercel Dashboard and click **Add New > Project**.
   - Import the repository containing this workspace.
   - For **Root Directory**, set it to `snpbrand-hub`.

3. **Configure Build Settings**:
   Vercel will auto-detect Vite. Confirm the settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. **Configure Environment Variables**:
   Add the following environment variables in the project setup:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

5. **Click Deploy**:
   Vercel will build the project and deploy it. Since it uses client-side routing with React Router, add a `vercel.json` file in the root directory of the hub app to handle route rewrites if necessary:
   ```json
   {
     "rewrites": [
       { "source": "/(.*)", "destination": "/" }
     ]
   }
   ```
   *(Note: This redirect has been pre-configured for this web project.)*

---

## 4. Mobile Design Constraints

This web app is configured specifically for mobile devices and enforces:
- **No horizontal scroll** at all viewport widths.
- **Minimum 44px tap targets** for buttons, input triggers, and tabs.
- **Minimum 16px font sizes** on form input elements to suppress iOS Safari automatic zoom behaviors upon text focus.
- **Bottom Navigation Layout** fixed to the bottom of the screen with a safe area padding on notched devices.

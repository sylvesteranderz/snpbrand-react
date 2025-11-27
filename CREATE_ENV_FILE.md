# ⚠️ REQUIRED: Create .env File

## Quick Setup (2 minutes)

### Step 1: Create the file
Create a new file named `.env` in the **root** of your project:
```
C:\Users\slyboy\Desktop\snpbrand-react\.env
```

### Step 2: Copy this content into the file

```bash
# Medusa Backend Configuration
VITE_MEDUSA_URL=http://localhost:9000
VITE_MEDUSA_PUBLISHABLE_KEY=pk_c0582a0d5f38b4080a3f6783da0bd0f3d3df1416594927df890a8c8b69bead02

# Keep your existing Supabase credentials below (if you have them)
VITE_SUPABASE_URL=your_existing_supabase_url
VITE_SUPABASE_ANON_KEY=your_existing_supabase_key
```

### Step 3: Restart your React dev server
After creating the file, **stop** and **restart** your dev server:
```bash
# Press Ctrl+C to stop the current server
# Then run:
npm run dev
```

### Step 4: Check the test component
Go to `http://localhost:5173` (or your local dev URL) and you should see a green success message at the top of the page showing the Medusa products!

---

## ✅ Once this is done, the integration will work!


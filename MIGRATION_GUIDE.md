# Migration Guide: Separating Backend and Frontend

This guide will help you move your existing Next.js application to the new separated structure.

## 🎯 Goal

Transform this:
```
ecommerce/
├── app/              # Next.js + API routes mixed
├── server/           # Express files (to move)
├── models/           # Shared models
└── ...
```

Into this:
```
ecommerce/
├── backend/          # Pure Express API
├── frontend/         # Pure Next.js app
└── README.md
```

## ✅ What's Already Done

The backend structure is **100% complete** with:
- ✅ Express server setup
- ✅ All routes (auth, products, orders, users)
- ✅ MongoDB models
- ✅ JWT middleware
- ✅ Configuration files
- ✅ Environment setup

## 📋 Migration Steps

### Step 1: Backup Your Work (Optional but Recommended)

```bash
# Create a backup
xcopy c:\Users\Lenovo\Downloads\ecommerce c:\Users\Lenovo\Downloads\ecommerce-backup\ /E /I
```

### Step 2: Move Frontend Files

#### Option A: Using File Explorer (Windows)

1. **Open File Explorer** and navigate to `c:\Users\Lenovo\Downloads\ecommerce`

2. **Move these folders to `frontend/`:**
   - `app/` → `frontend/app/`
   - `components/` → `frontend/components/`
   - `hooks/` → `frontend/hooks/`
   - `lib/` → `frontend/lib/` (We'll merge with existing)
   - `stores/` → `frontend/stores/`
   - `public/` → `frontend/public/` (if exists)

3. **Copy these files to `frontend/`:**
   - `package.json` → `frontend/package.json`
   - `tsconfig.json` → `frontend/tsconfig.json`
   - `next.config.js/ts` → `frontend/next.config.js/ts`
   - `tailwind.config.js/ts` → `frontend/tailwind.config.js/ts`
   - `postcss.config.js` → `frontend/postcss.config.js`
   - `components.json` → `frontend/components.json`
   - `.env.local` → `frontend/.env.local`

#### Option B: Using Command Line (Windows)

```bash
cd c:\Users\Lenovo\Downloads\ecommerce

# Move directories
move app frontend\app
move components frontend\components
move hooks frontend\hooks
move stores frontend\stores

# Copy config files
copy package.json frontend\package.json
copy tsconfig.json frontend\tsconfig.json
copy next.config.* frontend\
copy tailwind.config.* frontend\
copy postcss.config.* frontend\
copy components.json frontend\

# Copy environment file
copy .env.local frontend\.env.local
```

### Step 3: Update Frontend Environment Variables

Edit `frontend/.env.local`:

```env
# Add this line
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Keep your existing variables
MONGODB_URI=...
JWT_SECRET=...
```

### Step 4: Update Frontend API Calls

You need to update all API calls in your frontend to use the Express backend.

#### Find all API calls:
```bash
cd frontend
# Search for fetch calls to /api
grep -r "fetch.*'/api" app/ components/
```

#### Update them:

**Before:**
```typescript
const res = await fetch('/api/products')
const res = await fetch('/api/auth/login', {...})
const res = await fetch(`/api/products/${id}`)
```

**After:**
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL

const res = await fetch(`${API_URL}/products`)
const res = await fetch(`${API_URL}/auth/login`, {...})
const res = await fetch(`${API_URL}/products/${id}`)
```

#### Common Files to Update:
- `frontend/app/login/page.tsx`
- `frontend/app/signup/page.tsx`
- `frontend/components/product-grid.tsx`
- `frontend/stores/auth-store.ts`
- `frontend/stores/cart-store.ts`

### Step 5: Handle `lib/` Folder

Your frontend needs some utilities from `lib/` but not the backend ones.

**Keep in `frontend/lib/`:**
- `utils.ts` (UI utilities)

**Remove from `frontend/lib/`:**
- `db.ts` (Backend only)
- `auth.ts` (Backend only, if it has Next.js specific code)
- `middleware.ts` (Backend only)

**For validations:**
- Keep `validations.ts` in `frontend/lib/` if frontend uses it
- Backend has its own copy in `backend/src/utils/validations.ts`

### Step 6: Update Models (Optional)

If you share TypeScript interfaces between frontend and backend:

**Option 1: Duplicate them** (simpler)
- Keep copies in both `frontend/` and `backend/src/models/`

**Option 2: Shared types package** (advanced)
- Create `shared/types/` and import from both

For now, **Option 1 is recommended**.

### Step 7: Install Dependencies

```bash
# Install root dependencies
cd c:\Users\Lenovo\Downloads\ecommerce
npm install concurrently

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 8: Test the Setup

#### Start Backend:
```bash
cd c:\Users\Lenovo\Downloads\ecommerce\backend
npm run dev
```

You should see:
```
✅ MongoDB connected successfully
🚀 Express server running on http://localhost:5000
```

#### Test Backend API:
```bash
curl http://localhost:5000/health
```

#### Start Frontend (in new terminal):
```bash
cd c:\Users\Lenovo\Downloads\ecommerce\frontend
npm run dev
```

You should see:
```
▲ Next.js 15.2.4
- Local: http://localhost:3000
```

#### Test Full Stack:
1. Open http://localhost:3000
2. Try logging in
3. Browse products
4. Check browser DevTools Network tab to see API calls to `http://localhost:5000/api`

### Step 9: Clean Up Old Files

Once everything works, remove old files from root:

```bash
cd c:\Users\Lenovo\Downloads\ecommerce

# Remove old Next.js files (already moved to frontend/)
rm -rf app components hooks stores public

# Remove old server files (new backend is ready)
rm -rf server

# Remove old models (backend has them)
rm -rf models

# Remove old lib if not needed
rm -rf lib

# Keep only:
# - backend/
# - frontend/
# - README.md
# - MIGRATION_GUIDE.md
# - EXPRESS_SETUP.md
# - root-package.json (optional)
```

## 🔄 API Call Examples

### Before (Next.js API Routes):
```typescript
// Login
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
})

// Get products
const products = await fetch('/api/products')
```

### After (Express Backend):
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL // http://localhost:5000/api

// Login
const response = await fetch(`${API_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
})

// Get products
const products = await fetch(`${API_URL}/products`)

// With auth token
const orders = await fetch(`${API_URL}/orders`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

## 🎨 Frontend API Helper (Recommended)

Create `frontend/lib/api.ts`:

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token') // or however you store it

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`)
  }

  return response.json()
}

// Usage:
// const products = await apiRequest('/products')
// const user = await apiRequest('/users/me')
```

## ✅ Verification Checklist

- [ ] Backend running on port 5000
- [ ] Frontend running on port 3000
- [ ] MongoDB connected
- [ ] Login works
- [ ] Products load
- [ ] Orders can be created
- [ ] Admin features work (if applicable)
- [ ] No console errors
- [ ] API calls go to http://localhost:5000/api

## 🐛 Common Issues

### Issue: "Cannot find module"
**Solution:** Run `npm install` in both backend and frontend folders

### Issue: "CORS error"
**Solution:** Check `backend/.env` - `CORS_ORIGIN` should be `http://localhost:3000`

### Issue: "API calls return 404"
**Solution:** Verify `NEXT_PUBLIC_API_URL` in `frontend/.env.local`

### Issue: "Unauthorized" errors
**Solution:** Check if token is being sent in Authorization header

### Issue: Port 5000 already in use
**Solution:** Change PORT in `backend/.env` to 5001 or kill the process using port 5000

## 📚 Next Steps

After migration:

1. **Test all features** thoroughly
2. **Update deployment configs** for production
3. **Set up CI/CD** for both apps
4. **Deploy backend** to Railway/Render
5. **Deploy frontend** to Vercel
6. **Update production environment variables**

## 🆘 Need Help?

- Check [README.md](README.md) for overview
- Check [backend/README.md](backend/README.md) for API docs
- Check [EXPRESS_SETUP.md](EXPRESS_SETUP.md) for Express details

---

Good luck with your migration! 🚀

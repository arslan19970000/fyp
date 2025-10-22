# 📁 Project Structure

## Complete File Tree

```
ecommerce/
│
├── 📁 backend/                          ✅ EXPRESS.JS API (100% COMPLETE)
│   ├── 📁 src/
│   │   ├── 📁 config/
│   │   │   └── db.ts                    Database connection
│   │   │
│   │   ├── 📁 middleware/
│   │   │   └── auth.ts                  JWT auth, admin, seller middleware
│   │   │
│   │   ├── 📁 models/
│   │   │   ├── User.ts                  User schema (buyer/seller/admin)
│   │   │   ├── Product.ts               Product schema with reviews
│   │   │   └── Order.ts                 Order schema
│   │   │
│   │   ├── 📁 routes/
│   │   │   ├── auth.ts                  POST /register, /login
│   │   │   ├── products.ts              GET, POST, PUT, DELETE /products
│   │   │   ├── orders.ts                GET, POST, PUT, DELETE /orders
│   │   │   └── users.ts                 GET, PUT /users
│   │   │
│   │   ├── 📁 utils/
│   │   │   ├── auth.ts                  JWT sign/verify helpers
│   │   │   └── validations.ts           Zod schemas
│   │   │
│   │   └── index.ts                     🚀 Main Express server
│   │
│   ├── .env                             Environment variables
│   ├── .env.example                     Example env file
│   ├── .gitignore                       Git ignore rules
│   ├── package.json                     Backend dependencies
│   ├── tsconfig.json                    TypeScript config
│   ├── nodemon.json                     Nodemon config
│   └── README.md                        📚 Backend API docs
│
├── 📁 frontend/                         ⚠️  NEXT.JS APP (NEED TO MOVE FILES HERE)
│   └── .gitkeep                         Placeholder file
│
├── 📁 app/                              📦 YOUR CURRENT NEXT.JS (TO BE MOVED)
│   ├── page.tsx
│   ├── layout.tsx
│   ├── login/
│   ├── signup/
│   ├── products/
│   ├── cart/
│   ├── checkout/
│   ├── account/
│   ├── admin/
│   └── api/                             ⚠️ OLD API ROUTES (WILL BE REPLACED)
│
├── 📁 components/                       📦 REACT COMPONENTS (TO BE MOVED)
│   ├── navbar.tsx
│   ├── footer.tsx
│   ├── product-card.tsx
│   ├── product-grid.tsx
│   └── ui/                              Shadcn components
│
├── 📁 lib/                              📦 UTILITIES (SPLIT BETWEEN FRONTEND/BACKEND)
│   ├── utils.ts                         → frontend/lib/
│   ├── db.ts                            ✅ Already in backend/
│   ├── auth.ts                          ✅ Already in backend/
│   └── validations.ts                   ✅ Already in backend/
│
├── 📁 stores/                           📦 STATE MANAGEMENT (TO BE MOVED)
│   ├── cart-store.ts                    → frontend/stores/
│   └── auth-store.ts                    → frontend/stores/
│
├── 📁 hooks/                            📦 CUSTOM HOOKS (TO BE MOVED)
│   ├── use-mobile.ts                    → frontend/hooks/
│   └── use-toast.ts                     → frontend/hooks/
│
├── 📁 models/                           ⚠️  OLD MODELS (REPLACED BY BACKEND)
│   ├── user.ts                          ✅ Now in backend/src/models/
│   ├── product.ts                       ✅ Now in backend/src/models/
│   └── order.ts                         ✅ Now in backend/src/models/
│
├── 📁 server/                           ⚠️  OLD EXPRESS ATTEMPT (REPLACED)
│   ├── index.ts                         ✅ Replaced by backend/src/index.ts
│   ├── routes/                          ✅ Replaced by backend/src/routes/
│   └── middleware/                      ✅ Replaced by backend/src/middleware/
│
├── 📄 README.md                         📚 Main documentation
├── 📄 MIGRATION_GUIDE.md                📚 Step-by-step migration
├── 📄 QUICK_START.md                    📚 5-minute setup guide
├── 📄 EXPRESS_SETUP.md                  📚 Express integration guide
├── 📄 PROJECT_STRUCTURE.md              📚 This file
├── 📄 root-package.json                 📦 Monorepo package.json
├── 📄 package.json                      📦 Current Next.js package.json
├── 📄 tsconfig.json                     ⚙️  TypeScript config
├── 📄 .env.local                        ⚙️  Environment variables
└── 📄 components.json                   ⚙️  Shadcn config
```

## 🎯 Migration Target Structure

After you complete the migration:

```
ecommerce/
│
├── 📁 backend/                          ✅ EXPRESS.JS API
│   ├── src/
│   ├── package.json
│   ├── .env
│   └── README.md
│
├── 📁 frontend/                         ✅ NEXT.JS APP
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── stores/
│   ├── hooks/
│   ├── public/
│   ├── package.json
│   ├── .env.local
│   ├── next.config.js
│   └── tsconfig.json
│
├── 📄 README.md                         Main docs
├── 📄 MIGRATION_GUIDE.md                How to migrate
├── 📄 QUICK_START.md                    Quick start
└── 📄 root-package.json                 Run both apps
```

## 📊 File Count

### Backend (✅ Complete)
- **Total files:** 16
- **Source files:** 11
- **Config files:** 5
- **Status:** 100% Ready to use

### Current Root (Need to organize)
- **Next.js pages:** ~15 files in `app/`
- **Components:** ~70 files in `components/`
- **Utilities:** ~10 files in `lib/`, `hooks/`, `stores/`
- **Config:** 5 files
- **Status:** Need to move to `frontend/`

## 🔧 Configuration Files

### Backend
| File | Purpose | Location |
|------|---------|----------|
| `.env` | Environment vars | `backend/.env` |
| `tsconfig.json` | TypeScript config | `backend/tsconfig.json` |
| `nodemon.json` | Dev server config | `backend/nodemon.json` |
| `package.json` | Dependencies | `backend/package.json` |

### Frontend (After Migration)
| File | Purpose | Location |
|------|---------|----------|
| `.env.local` | Environment vars | `frontend/.env.local` |
| `tsconfig.json` | TypeScript config | `frontend/tsconfig.json` |
| `next.config.js` | Next.js config | `frontend/next.config.js` |
| `tailwind.config.js` | Tailwind config | `frontend/tailwind.config.js` |
| `package.json` | Dependencies | `frontend/package.json` |

## 📡 API Endpoints

All backend endpoints are at `http://localhost:5000/api/`:

### Authentication (`/api/auth`)
```
POST /api/auth/register   ✅ Ready
POST /api/auth/login      ✅ Ready
```

### Products (`/api/products`)
```
GET    /api/products         ✅ Ready
GET    /api/products/:id     ✅ Ready
POST   /api/products         ✅ Ready (Admin)
PUT    /api/products/:id     ✅ Ready (Admin)
DELETE /api/products/:id     ✅ Ready (Admin)
```

### Orders (`/api/orders`)
```
GET    /api/orders           ✅ Ready (Auth)
GET    /api/orders/:id       ✅ Ready (Auth)
POST   /api/orders           ✅ Ready (Auth)
PUT    /api/orders/:id       ✅ Ready (Auth)
DELETE /api/orders/:id       ✅ Ready (Auth)
```

### Users (`/api/users`)
```
GET    /api/users/me         ✅ Ready (Auth)
PUT    /api/users/me         ✅ Ready (Auth)
GET    /api/users            ✅ Ready (Admin)
GET    /api/users/:id        ✅ Ready (Admin)
DELETE /api/users/:id        ✅ Ready (Admin)
```

## 🗄️ Database Collections

MongoDB database: `nextuth`

### Collections:
1. **users**
   - Fields: name, email, password (hashed), role, phone, address, shopName, wishlist
   - Indexes: email (unique)

2. **products**
   - Fields: title, slug, description, price, images, category, brand, rating, reviews, countInStock, featured
   - Indexes: slug (unique), category, title+description (text)

3. **orders**
   - Fields: userId, items, total, shipping, status
   - Indexes: userId

## 🔐 Authentication Flow

```
Client (Frontend)
    ↓
    ├─→ POST /api/auth/register → Create account
    │                              ↓
    │                           User created in MongoDB
    │
    ├─→ POST /api/auth/login    → Verify credentials
    │                              ↓
    │                           JWT token generated
    │                              ↓
    │                           Token sent to client
    │
    └─→ Protected Routes        → Send token in header
                                   ↓
                                Middleware verifies token
                                   ↓
                                Request proceeds if valid
```

## 📦 Dependencies

### Backend
```json
{
  "express": "^4.18.2",
  "mongoose": "^8.0.0",
  "jsonwebtoken": "^9.0.2",
  "bcryptjs": "^2.4.3",
  "cors": "^2.8.5",
  "zod": "^3.25.76",
  "dotenv": "^16.4.5"
}
```

### Frontend (Same as current)
```json
{
  "next": "15.2.4",
  "react": "^19",
  "react-dom": "^19",
  "tailwindcss": "^4.1.9",
  "@radix-ui/*": "Various",
  "zustand": "latest",
  "swr": "latest"
}
```

## 🌐 Environment Variables

### Backend (`backend/.env`)
```env
MONGODB_URI=mongodb+srv://...
MONGODB_DB=nextuth
JWT_SECRET=ecommerce-jwt-secret-key-2025...
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 📈 Next Steps

1. ✅ **Backend is ready** - Install and run it!
2. ⚠️  **Move Next.js files** - See [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md)
3. ⚠️  **Update API calls** - Use `NEXT_PUBLIC_API_URL`
4. ✅ **Test everything** - Make sure all features work
5. 🚀 **Deploy** - Backend to Railway/Render, Frontend to Vercel

---

**Current Status: Backend 100% Complete ✅ | Frontend Migration Pending ⚠️**

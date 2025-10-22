# E-commerce Application - Separated Architecture

Full-stack e-commerce application with **separate backend and frontend** in a monorepo structure.

## 🏗️ Architecture

```
ecommerce/
├── backend/           # Express.js REST API
│   ├── src/
│   │   ├── config/    # Database configuration
│   │   ├── middleware/# Auth middleware
│   │   ├── models/    # MongoDB models
│   │   ├── routes/    # API routes
│   │   ├── utils/     # Utilities (auth, validation)
│   │   └── index.ts   # Main server file
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
│
├── frontend/          # Next.js application
│   ├── app/          # Next.js pages (Move your existing app here)
│   ├── components/   # React components
│   ├── lib/          # Frontend utilities
│   ├── package.json
│   └── .env.local
│
└── root-package.json  # Workspace root
```

## ✨ Features

### Backend (Express.js)
- ✅ RESTful API with Express.js
- ✅ MongoDB with Mongoose
- ✅ JWT authentication
- ✅ Role-based authorization
- ✅ Input validation (Zod)
- ✅ TypeScript
- ✅ CORS enabled

### Frontend (Next.js)
- ✅ Next.js 15 (App Router)
- ✅ React 19
- ✅ TypeScript
- ✅ Tailwind CSS
- ✅ Shadcn UI components
- ✅ State management (Zustand)

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account or local MongoDB
- **At least 2GB free disk space**

### Installation

#### Option 1: Install Everything at Once
```bash
cd ecommerce
npm run install:all
```

#### Option 2: Install Separately

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### Configuration

#### Backend (.env)
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
MONGODB_URI=your-mongodb-connection-string
MONGODB_DB=ecommerce
JWT_SECRET=your-super-secret-jwt-key
PORT=5000
CORS_ORIGIN=http://localhost:3000
```

#### Frontend (.env.local)
```bash
cd frontend
```

Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 🏃 Running the Application

### Development Mode

#### Run Both (Recommended)
```bash
npm run dev
```
This starts both backend (port 5000) and frontend (port 3000) concurrently.

#### Run Separately

**Backend only:**
```bash
npm run dev:backend
# OR
cd backend && npm run dev
```

**Frontend only:**
```bash
npm run dev:frontend
# OR
cd frontend && npm run dev
```

### Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **API Health Check**: http://localhost:5000/health

## 📁 Moving Your Existing Files

Since your Next.js app is currently in the root, you need to move it to the `frontend/` folder:

### Manual Move Steps:

1. **Copy Next.js files to frontend folder:**
```bash
# Copy app directory
xcopy app frontend\app\ /E /I

# Copy components
xcopy components frontend\components\ /E /I

# Copy lib
xcopy lib frontend\lib\ /E /I

# Copy hooks
xcopy hooks frontend\hooks\ /E /I

# Copy stores
xcopy stores frontend\stores\ /E /I

# Copy config files
copy tsconfig.json frontend\tsconfig.json
copy next.config.* frontend\
copy tailwind.config.* frontend\
copy components.json frontend\
copy postcss.config.* frontend\
```

2. **Copy the original package.json to frontend:**
```bash
copy package.json frontend\package.json
```

3. **Update frontend API calls** to use the environment variable:

Replace:
```typescript
// OLD
fetch('/api/products')
```

With:
```typescript
// NEW
fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`)
```

4. **Install frontend dependencies:**
```bash
cd frontend
npm install
```

## 📡 API Endpoints

See [backend/README.md](backend/README.md) for detailed API documentation.

### Quick Reference

**Authentication:**
- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login

**Products:**
- `GET /api/products` - List products
- `GET /api/products/:id` - Get product
- `POST /api/products` - Create (Admin)
- `PUT /api/products/:id` - Update (Admin)
- `DELETE /api/products/:id` - Delete (Admin)

**Orders:**
- `GET /api/orders` - User orders
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order
- `PUT /api/orders/:id` - Update order
- `DELETE /api/orders/:id` - Cancel order

**Users:**
- `GET /api/users/me` - Current user
- `PUT /api/users/me` - Update profile
- `GET /api/users` - All users (Admin)

## 🔧 Build for Production

### Backend
```bash
cd backend
npm run build
npm run serve
```

### Frontend
```bash
cd frontend
npm run build
npm start
```

### Both
```bash
npm run build:all
```

## 📦 Project Structure Details

### Backend Structure
```
backend/src/
├── config/
│   └── db.ts              # MongoDB connection
├── middleware/
│   └── auth.ts            # JWT middleware
├── models/
│   ├── User.ts            # User schema
│   ├── Product.ts         # Product schema
│   └── Order.ts           # Order schema
├── routes/
│   ├── auth.ts            # Auth endpoints
│   ├── products.ts        # Product endpoints
│   ├── orders.ts          # Order endpoints
│   └── users.ts           # User endpoints
├── utils/
│   ├── auth.ts            # JWT utils
│   └── validations.ts     # Zod schemas
└── index.ts               # Express app
```

### Frontend Structure
```
frontend/
├── app/                   # Next.js pages
├── components/            # React components
│   ├── ui/               # Shadcn components
│   ├── navbar.tsx
│   └── footer.tsx
├── lib/                   # Utilities
├── stores/                # Zustand stores
└── hooks/                 # Custom hooks
```

## 🚨 Important Notes

### Disk Space Issue
You mentioned having disk space issues. Before installing:

1. **Check available space:**
```bash
# Windows
wmic logicaldisk get size,freespace,caption
```

2. **Clean npm cache:**
```bash
npm cache clean --force
```

3. **Delete old node_modules (if any):**
```bash
# In root directory
rm -rf node_modules
```

### Database
- Uses MongoDB Atlas (cloud)
- Connection string already configured
- Database: `nextuth`

### Authentication
- JWT tokens (7-day expiry)
- Stored in frontend (localStorage/cookies)
- Sent via `Authorization: Bearer <token>` header

## 🛠️ Available Scripts

### Root Level
| Command | Description |
|---------|-------------|
| `npm run dev` | Run both backend & frontend |
| `npm run dev:backend` | Run backend only |
| `npm run dev:frontend` | Run frontend only |
| `npm run install:all` | Install all dependencies |
| `npm run build:all` | Build both apps |

### Backend
| Command | Description |
|---------|-------------|
| `npm run dev` | Start with nodemon |
| `npm start` | Start with ts-node |
| `npm run build` | Compile TypeScript |
| `npm run serve` | Run compiled code |

### Frontend
| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Run linter |

## 🔐 Environment Variables

### Backend (.env)
```env
MONGODB_URI=mongodb+srv://...
MONGODB_DB=ecommerce
JWT_SECRET=your-secret-key
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 📚 Documentation

- [Backend API Documentation](backend/README.md)
- [Express Setup Guide](EXPRESS_SETUP.md)

## 🐛 Troubleshooting

### Backend won't start
- Check MongoDB connection string
- Ensure JWT_SECRET is set
- Verify port 5000 is available

### Frontend can't connect to API
- Check NEXT_PUBLIC_API_URL in .env.local
- Ensure backend is running
- Check CORS settings

### Module not found errors
- Run `npm install` in both folders
- Delete node_modules and reinstall

## 🚀 Deployment

### Backend
- Deploy to: Railway, Render, Heroku, DigitalOcean
- Set environment variables
- Use `npm run serve` or PM2

### Frontend
- Deploy to: Vercel, Netlify
- Set `NEXT_PUBLIC_API_URL` to production backend URL
- Build command: `npm run build`

## 📄 License

MIT

## 👥 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open pull request

## 🆘 Support

For issues or questions:
- Check [backend/README.md](backend/README.md)
- Check [EXPRESS_SETUP.md](EXPRESS_SETUP.md)
- Open an issue in the repository

---

**Built with ❤️ using Express.js, Next.js, MongoDB, and TypeScript**

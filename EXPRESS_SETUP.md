# Express.js + Next.js + MongoDB E-commerce Setup

This project has been migrated to use **Express.js** as the backend API server alongside **Next.js** for the frontend.

## Project Structure

```
ecommerce/
├── app/                    # Next.js frontend (App Router)
├── server/                 # Express.js backend
│   ├── index.ts           # Express server entry point
│   ├── routes/            # API routes
│   │   ├── auth.ts        # Authentication routes
│   │   ├── products.ts    # Product routes
│   │   ├── orders.ts      # Order routes
│   │   └── users.ts       # User routes
│   └── middleware/        # Express middlewares
│       └── auth.ts        # JWT authentication middleware
├── models/                # MongoDB Mongoose models
├── lib/                   # Shared utilities
└── components/            # React components
```

## Installation

### 1. Free Up Disk Space (IMPORTANT!)
Before installing packages, ensure you have enough disk space. Your system has low disk space. Consider:
- Cleaning Windows temp files
- Running Disk Cleanup
- Deleting unnecessary files

### 2. Install Dependencies

```bash
npm install
```

If you encounter space issues, you can manually install the new packages:

```bash
npm install express cors dotenv
npm install --save-dev @types/express @types/cors nodemon ts-node concurrently @types/bcryptjs @types/jsonwebtoken
```

## Environment Variables

Make sure your `.env.local` file contains:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://Arslan:Mus%401234@cluster00.sgiwttw.mongodb.net/nextuth
MONGODB_DB=nextuth

# JWT Secret
JWT_SECRET=ecommerce-jwt-secret-key-2025-super-secure-random-string-32chars

# Express Server Port
PORT=5000

# Next.js API URL (for connecting frontend to Express backend)
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Node Environment
NODE_ENV=development
```

## Available Scripts

### Development Mode

**Run Next.js Frontend Only:**
```bash
npm run dev
```
Starts Next.js on http://localhost:3000

**Run Express Backend Only:**
```bash
npm run dev:server
```
Starts Express server on http://localhost:5000

**Run Both Simultaneously (Recommended):**
```bash
npm run dev:all
```
Runs both Next.js and Express concurrently

### Production Mode

**Build Next.js:**
```bash
npm run build
```

**Start Next.js:**
```bash
npm start
```

**Start Express Server:**
```bash
npm run server
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)

### Orders
- `GET /api/orders` - Get user's orders (Auth required)
- `GET /api/orders/:id` - Get single order (Auth required)
- `POST /api/orders` - Create order (Auth required)
- `PUT /api/orders/:id` - Update order (Auth required)
- `DELETE /api/orders/:id` - Cancel order (Auth required)

### Users
- `GET /api/users/me` - Get current user profile (Auth required)
- `PUT /api/users/me` - Update user profile (Auth required)
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID (Admin only)
- `DELETE /api/users/:id` - Delete user (Admin only)

## Authentication

All protected routes require JWT authentication. Include the token in the Authorization header:

```bash
Authorization: Bearer <your-jwt-token>
```

## Middleware

### authMiddleware
Verifies JWT token and attaches user to request object.

### adminMiddleware
Ensures user has admin role. Must be used after authMiddleware.

### sellerMiddleware
Ensures user has seller or admin role. Must be used after authMiddleware.

## Frontend Integration

Update your frontend API calls to use the Express backend:

```typescript
// Before (Next.js API routes)
const response = await fetch('/api/products')

// After (Express backend)
const response = await fetch('http://localhost:5000/api/products')
// OR use the environment variable
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`)
```

## Database

The app uses MongoDB Atlas with Mongoose ODM. Connection is handled in `lib/db.ts`.

Models:
- **User** - User accounts with roles (buyer, seller, admin)
- **Product** - Product catalog
- **Order** - Customer orders

## Testing the API

### Health Check
```bash
curl http://localhost:5000/health
```

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "buyer"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Get Products
```bash
curl http://localhost:5000/api/products
```

### Get Products with Filters
```bash
curl "http://localhost:5000/api/products?category=Electronics&min=100&max=1000"
```

## Migration from Next.js API Routes

The old Next.js API routes in `app/api/` can be removed once you've updated all frontend code to use the Express endpoints. For now, both can coexist.

## Troubleshooting

### Port Already in Use
If port 5000 is already in use, change the PORT in `.env.local`:
```env
PORT=5001
```

### MongoDB Connection Issues
Ensure your MongoDB URI is correct and your IP is whitelisted in MongoDB Atlas.

### CORS Errors
The Express server has CORS enabled. If you encounter issues, update the CORS configuration in `server/index.ts`.

## Next Steps

1. **Free up disk space** and run `npm install`
2. **Update frontend API calls** to use Express endpoints
3. **Test all endpoints** using curl or Postman
4. **Remove old Next.js API routes** once migration is complete
5. **Deploy Express server** separately from Next.js frontend

## Production Deployment

For production:
1. Deploy Next.js to Vercel/Netlify
2. Deploy Express server to Railway/Render/Heroku
3. Update `NEXT_PUBLIC_API_URL` to your Express server URL
4. Enable HTTPS and update CORS settings
5. Use environment-specific configurations

---

Built with Express.js, Next.js, MongoDB, and TypeScript

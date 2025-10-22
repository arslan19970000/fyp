# Role-Based Access Control Setup Guide

## Overview

Your e-commerce application now supports **three distinct user roles**:
- **Buyer** (default) - Can browse and purchase products
- **Seller** - Can list and manage their own products
- **Admin** - Has full access to manage users, products, and orders

Each role has access **only to their own work** and designated features.

---

## MongoDB Setup

### Connection String

Your MongoDB Atlas connection is configured with:

```env
MONGODB_URI=mongodb+srv://Arslan:<YOUR_PASSWORD>@cluster00.sgiwttw.mongodb.net/nextuth
MONGODB_DB=nextuth
```

### Setup Steps:

1. **Create `.env.local` file** in the project root:

```env
MONGODB_URI=mongodb+srv://Arslan:<REPLACE_WITH_YOUR_PASSWORD>@cluster00.sgiwttw.mongodb.net/nextuth
MONGODB_DB=nextuth
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
NODE_ENV=development
```

2. **Replace `<YOUR_PASSWORD>`** with your actual MongoDB Atlas password

3. **Generate a strong JWT_SECRET**:
```bash
# On Linux/Mac:
openssl rand -base64 32

# Or use this online: https://generate-random.org/api-token-generator
```

---

## User Roles & Permissions

### 1. **Buyer Role** (Default)

**What Buyers Can Do:**
- Browse all products
- Add items to cart
- Place orders
- View their own order history
- Manage their profile

**Buyer Pages:**
- `/products` - Browse products
- `/products/[id]` - View product details
- `/cart` - Shopping cart
- `/checkout` - Place orders (requires auth)
- `/account` - View order history

**API Access:**
- `GET /api/products` - Browse products
- `POST /api/orders` - Create orders (own only)
- `GET /api/orders` - View own orders
- `GET /api/users/me` - View own profile

---

### 2. **Seller Role**

**What Sellers Can Do:**
- All buyer features PLUS:
- Create and list products
- Manage their own products (edit, delete)
- View orders for their products
- Manage shop information

**Seller Pages:**
- `/seller/dashboard` - Sales overview
- `/seller/products` - Manage products
- `/seller/orders` - View product orders
- `/seller/shop` - Shop settings

**API Access:**
- `POST /api/products` - Create products (own only)
- `PUT /api/products/[id]` - Update own products
- `DELETE /api/products/[id]` - Delete own products
- `GET /api/seller/orders` - View orders for own products

**Seller-Specific Fields:**
- `shopName` - Required during signup
- `shopDescription` - Optional shop description

---

### 3. **Admin Role**

**What Admins Can Do:**
- **Full access** to everything
- Manage all users
- Manage all products
- View all orders
- Access analytics
- System configuration

**Admin Pages:**
- `/admin` - Admin dashboard
- `/admin/users` - Manage all users
- `/admin/products` - Manage all products
- `/admin/orders` - View all orders
- `/admin/analytics` - System analytics

**API Access:**
- All endpoints with full permissions
- Can perform actions on behalf of any user
- Can promote/demote user roles

---

## How Roles Work

### 1. **User Registration**

When a user signs up at `/signup`, they choose their role:

```typescript
// Signup form includes:
- Name
- Email
- Password
- Role: "buyer" OR "seller"
- Shop Name (required if seller)
```

**Note:** Admin accounts must be created manually in the database or promoted by existing admins.

### 2. **Authentication Flow**

```
User Signs Up → Choose Role → Account Created
           ↓
User Logs In → JWT Token Generated (includes role)
           ↓
Token Stored → Client-side auth store
           ↓
Protected Routes → Verify token + role
```

### 3. **Role-Based Middleware**

API routes use middleware to enforce permissions:

```typescript
// lib/middleware.ts provides:

requireAuth()          // Any authenticated user
requireBuyer()         // Buyer or Admin only
requireSeller()        // Seller or Admin only
requireAdmin()         // Admin only
requireRole(...roles)  // Custom role list
```

**Example Usage:**

```typescript
// API route for sellers only
import { requireSeller } from "@/lib/middleware"

export const POST = requireSeller(async (req) => {
  const userId = req.user.sub
  // Create product for this seller...
  return NextResponse.json({ success: true })
})
```

---

## Database Schema

### User Model

```typescript
{
  _id: ObjectId
  name: string
  email: string (unique, indexed)
  password: string (hashed)
  role: "buyer" | "seller" | "admin"

  // Optional fields
  phone?: string
  address?: {
    street, city, country, postalCode
  }

  // Seller-specific
  shopName?: string
  shopDescription?: string

  // Buyer-specific
  wishlist?: string[]  // Product IDs

  createdAt: Date
  updatedAt: Date
}
```

### Product Model (Enhanced)

```typescript
{
  _id: ObjectId
  title: string
  slug: string (unique, indexed)
  description: string
  price: number
  images: string[]
  category: string (indexed)

  sellerId: ObjectId  // Reference to User
  sellerName: string  // Denormalized for display
  shopName: string    // Seller's shop name

  rating: number
  numReviews: number
  countInStock: number
  featured: boolean

  reviews: [
    { userId, name, rating, comment, createdAt }
  ]

  createdAt: Date
  updatedAt: Date
}
```

---

## Access Control Rules

### Buyers Can:
✅ View all products
✅ Create orders for themselves
✅ View their own orders
✅ Update their own profile
❌ Create/edit products
❌ View other users' orders
❌ Access admin panel

### Sellers Can:
✅ Everything buyers can do, PLUS:
✅ Create new products
✅ Edit/delete their own products
✅ View orders containing their products
✅ Update shop information
❌ Edit other sellers' products
❌ Access admin panel

### Admins Can:
✅ **Everything** - full system access
✅ Create/edit/delete any product
✅ View/modify any order
✅ Manage user accounts
✅ Promote/demote roles

---

## UI/UX Differences by Role

### Navbar Indicators

The navbar shows role badges:
- **Buyers**: No badge
- **Sellers**: Blue "S" badge
- **Admins**: Purple "A" badge

### Dropdown Menu Content

**Buyer sees:**
- My Orders
- Logout

**Seller sees:**
- My Dashboard
- My Products
- Orders
- Logout

**Admin sees:**
- Admin Panel
- Manage Users
- Manage Products
- Logout

---

## Creating Your First Admin

Since admin signup isn't available publicly, create the first admin manually:

### Option 1: MongoDB Compass/Atlas

1. Connect to your database
2. Find the `users` collection
3. Create a new document:

```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "$2a$10$...",  // Use bcrypt to hash
  "role": "admin",
  "createdAt": { "$date": "2025-10-15T00:00:00.000Z" },
  "updatedAt": { "$date": "2025-10-15T00:00:00.000Z" }
}
```

### Option 2: Update Existing User

```javascript
// In MongoDB shell or Compass
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { role: "admin" } }
)
```

### Option 3: Seed Script

Create `scripts/create-admin.ts`:

```typescript
import { connectDB } from "@/lib/db"
import { User } from "@/models/user"

async function createAdmin() {
  await connectDB()

  const admin = new User({
    name: "Admin User",
    email: "admin@example.com",
    password: "your-secure-password",
    role: "admin",
  })

  await admin.save()
  console.log("Admin created successfully!")
}

createAdmin()
```

---

## API Endpoints by Role

### Public (No Auth Required)
- `GET /api/products` - List products
- `GET /api/products/[id]` - Get product details
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register

### Buyer Only
- `POST /api/orders` - Create order
- `GET /api/orders` - Get own orders
- `GET /api/users/me` - Get profile

### Seller Only
- `POST /api/products` - Create product
- `PUT /api/products/[id]` - Update own product
- `DELETE /api/products/[id]` - Delete own product
- `GET /api/seller/orders` - Orders with own products

### Admin Only
- `GET /api/admin/users` - List all users
- `PUT /api/admin/users/[id]` - Update any user
- `DELETE /api/admin/users/[id]` - Delete user
- `GET /api/admin/orders` - All orders
- `PUT /api/admin/products/[id]` - Update any product

---

## Testing the Roles

### 1. Create Test Accounts

```bash
# 1. Buyer Account
Email: buyer@test.com
Password: test123
Role: Buyer

# 2. Seller Account
Email: seller@test.com
Password: test123
Role: Seller
Shop Name: Test Shop

# 3. Admin Account (manual creation)
Email: admin@test.com
Password: admin123
Role: Admin
```

### 2. Test Buyer Flow

1. Sign up as buyer
2. Browse products
3. Add to cart
4. Checkout (requires login)
5. View orders in `/account`

### 3. Test Seller Flow

1. Sign up as seller (with shop name)
2. Go to `/seller/dashboard`
3. Create a product
4. View in `/seller/products`
5. Edit/delete own products

### 4. Test Admin Flow

1. Login as admin
2. Access `/admin`
3. View all users
4. Manage any product
5. View all orders

---

## Security Best Practices

### 1. Token Verification

Every protected route checks:
- Token exists
- Token is valid (not expired)
- Token signature is correct
- User role matches requirements

### 2. Database Queries

Always filter by user:

```typescript
// ❌ BAD - Shows all orders
const orders = await Order.find()

// ✅ GOOD - Shows only user's orders
const orders = await Order.find({ userId: user.sub })

// ✅ ADMIN - Can see all
const orders = isAdmin(user.role)
  ? await Order.find()
  : await Order.find({ userId: user.sub })
```

### 3. Frontend Protection

Client-side checks are for UX only:

```typescript
// Show/hide UI elements
{isAdmin() && <AdminButton />}
{isSeller() && <SellerDashboard />}

// But ALWAYS verify on backend!
```

---

## Common Tasks

### Change User Role

```typescript
// In MongoDB or via admin API
db.users.updateOne(
  { email: "user@example.com" },
  { $set: { role: "seller", shopName: "New Shop" } }
)
```

### Promote Buyer to Seller

User must provide shop name when upgrading.

### Seller Statistics

```typescript
// Count seller's products
const productCount = await Product.countDocuments({ sellerId })

// Total revenue
const orders = await Order.find({ "items.sellerId": sellerId })
const revenue = orders.reduce((sum, order) => sum + order.total, 0)
```

---

## Troubleshooting

### "Forbidden - Requires role: seller"

**Cause:** User role doesn't match endpoint requirements

**Solution:**
1. Check user role in auth store: `useAuth().user?.role`
2. Verify JWT token includes correct role
3. Check middleware on API route

### Products Not Showing for Seller

**Cause:** sellerId not set correctly

**Solution:**
```typescript
// When creating product, always set:
const product = await Product.create({
  ...productData,
  sellerId: req.user.sub,
  sellerName: req.user.name,
})
```

### Can't Access Admin Panel

**Cause:** Role is not "admin"

**Solution:** Manually update in database or have existing admin promote you.

---

## Next Steps

1. ✅ Set up environment variables
2. ✅ Create admin account manually
3. ✅ Test buyer signup and login
4. ✅ Test seller signup with shop
5. ✅ Create seller dashboard pages
6. ✅ Add product management for sellers
7. ✅ Implement admin user management
8. ✅ Add analytics and reporting

---

## File Structure

```
app/
├── api/
│   ├── auth/
│   │   ├── login/route.ts       # Login (all roles)
│   │   └── register/route.ts    # Signup with role
│   ├── products/route.ts        # GET (public), POST (seller+)
│   ├── orders/route.ts          # Buyer orders
│   ├── seller/
│   │   ├── products/route.ts    # Seller's products
│   │   └── orders/route.ts      # Seller's orders
│   └── admin/
│       ├── users/route.ts       # Admin user management
│       └── products/route.ts    # Admin product management
├── account/page.tsx             # Buyer orders
├── seller/
│   ├── dashboard/page.tsx       # Seller dashboard
│   └── products/page.tsx        # Seller products
└── admin/
    ├── page.tsx                 # Admin panel
    └── users/page.tsx           # User management

lib/
├── auth.ts                      # JWT + role helpers
├── middleware.ts                # Role-based middleware
└── validations.ts               # Schemas with role

models/
├── user.ts                      # User with 3 roles
├── product.ts                   # Product with sellerId
└── order.ts                     # Order model

stores/
└── auth-store.ts                # Client auth with roles
```

---

## Support

For issues or questions:
1. Check this documentation
2. Verify environment variables
3. Check browser console for errors
4. Verify MongoDB connection
5. Check API route logs

---

**Last Updated:** October 15, 2025
**Version:** 3.0.0 - Multi-Role System

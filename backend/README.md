# E-commerce Backend API

Express.js REST API for the e-commerce application with MongoDB and JWT authentication.

## Features

- ✅ RESTful API architecture
- ✅ MongoDB with Mongoose ODM
- ✅ JWT authentication & authorization
- ✅ Role-based access control (Admin, Seller, Buyer)
- ✅ Input validation with Zod
- ✅ TypeScript support
- ✅ CORS enabled
- ✅ Auto-reload with Nodemon

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── db.ts              # MongoDB connection
│   ├── middleware/
│   │   └── auth.ts            # Authentication middleware
│   ├── models/
│   │   ├── User.ts            # User model
│   │   ├── Product.ts         # Product model
│   │   └── Order.ts           # Order model
│   ├── routes/
│   │   ├── auth.ts            # Auth routes (register, login)
│   │   ├── products.ts        # Product CRUD routes
│   │   ├── orders.ts          # Order management routes
│   │   └── users.ts           # User profile routes
│   ├── utils/
│   │   ├── auth.ts            # JWT utilities
│   │   └── validations.ts     # Zod schemas
│   └── index.ts               # Main server file
├── .env                       # Environment variables
├── .env.example               # Example env file
├── package.json
├── tsconfig.json
└── nodemon.json
```

## Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account or local MongoDB

### Setup

1. Install dependencies:
```bash
cd backend
npm install
```

2. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Update `.env` with your credentials:
```env
MONGODB_URI=your-mongodb-connection-string
MONGODB_DB=ecommerce
JWT_SECRET=your-super-secret-jwt-key
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

## Available Scripts

### Development
```bash
npm run dev
```
Starts the server with auto-reload using Nodemon on port 5000

### Production
```bash
npm run build    # Compile TypeScript to JavaScript
npm run serve    # Run compiled code
```

### Start (without build)
```bash
npm start
```

## API Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "buyer"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Products

#### Get All Products
```http
GET /api/products
GET /api/products?category=Electronics
GET /api/products?min=100&max=1000
GET /api/products?featured=true
GET /api/products?q=laptop
```

#### Get Single Product
```http
GET /api/products/:id
```

#### Create Product (Admin only)
```http
POST /api/products
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Product Name",
  "slug": "product-name",
  "description": "Description",
  "price": 99.99,
  "category": "Electronics",
  "images": ["url1", "url2"],
  "countInStock": 10
}
```

#### Update Product (Admin only)
```http
PUT /api/products/:id
Authorization: Bearer <token>
```

#### Delete Product (Admin only)
```http
DELETE /api/products/:id
Authorization: Bearer <token>
```

### Orders

#### Get User's Orders
```http
GET /api/orders
Authorization: Bearer <token>
```

#### Get Single Order
```http
GET /api/orders/:id
Authorization: Bearer <token>
```

#### Create Order
```http
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    {
      "productId": "123",
      "title": "Product",
      "price": 99.99,
      "quantity": 2
    }
  ],
  "total": 199.98,
  "shipping": {
    "fullName": "John Doe",
    "address": "123 Street",
    "city": "City",
    "country": "Country",
    "postalCode": "12345"
  }
}
```

#### Update Order
```http
PUT /api/orders/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "Shipped"
}
```

#### Cancel Order
```http
DELETE /api/orders/:id
Authorization: Bearer <token>
```

### Users

#### Get Current User
```http
GET /api/users/me
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /api/users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "New Name",
  "phone": "1234567890"
}
```

#### Get All Users (Admin only)
```http
GET /api/users
Authorization: Bearer <token>
```

#### Get User by ID (Admin only)
```http
GET /api/users/:id
Authorization: Bearer <token>
```

#### Delete User (Admin only)
```http
DELETE /api/users/:id
Authorization: Bearer <token>
```

## Authentication

Protected routes require a JWT token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

## User Roles

- **buyer**: Can browse products, create orders
- **seller**: Can manage own products (if implemented)
- **admin**: Full access to all resources

## Error Handling

The API returns consistent error responses:

```json
{
  "error": "Error message",
  "details": [] // (optional) validation errors
}
```

### HTTP Status Codes
- `200` OK
- `201` Created
- `400` Bad Request
- `401` Unauthorized
- `403` Forbidden
- `404` Not Found
- `500` Internal Server Error

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | Required |
| `MONGODB_DB` | Database name | `ecommerce` |
| `JWT_SECRET` | Secret key for JWT | Required |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:3000` |

## Database Models

### User
- name, email, password, role
- Optional: phone, address, shopName, wishlist

### Product
- title, slug, description, price, images
- category, brand, rating, reviews
- countInStock, featured

### Order
- userId, items, total, shipping
- status: Pending, Shipped, Delivered

## Development

### Hot Reload
Nodemon watches for file changes and automatically restarts the server.

### TypeScript
The project uses TypeScript for type safety. Compile with:
```bash
npm run build
```

## Testing

Test the API using:
- cURL
- Postman
- Thunder Client (VS Code extension)
- REST Client (VS Code extension)

### Example cURL
```bash
# Health check
curl http://localhost:5000/health

# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"test123","role":"buyer"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

## Deployment

### Railway / Render / Heroku

1. Set environment variables in platform dashboard
2. Deploy from Git repository
3. Update `CORS_ORIGIN` to frontend URL

### PM2 (Production)

```bash
npm install -g pm2
npm run build
pm2 start dist/index.js --name ecommerce-api
```

## License

MIT

## Support

For issues or questions, please open an issue in the repository.

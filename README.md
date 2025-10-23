# ShopLite - Full-Stack E-Commerce Platform

A modern, full-stack e-commerce platform built with **Next.js 15**, featuring AI-powered customer support, secure payments via Stripe, and multi-role authentication.

## ✨ Features

### Core Features
- 🛍️ **Product Management** - Browse, search, filter products with categories
- 🛒 **Shopping Cart** - Persistent cart with localStorage
- 💳 **Stripe Payments** - Secure checkout with Stripe integration
- 👥 **Multi-Role Auth** - Buyer, Seller, and Admin roles
- 🤖 **AI Chatbot** - Google Gemini-powered shopping assistant
- ⭐ **Product Reviews** - 5-star rating system with comments
- 📧 **Email Notifications** - Order confirmations via Nodemailer
- 🌙 **Dark Mode** - Full dark mode support
- 📱 **Responsive Design** - Mobile-first approach

### User Roles

**Buyers:**
- Browse and search products
- Add to cart and checkout
- View order history
- Submit product reviews
- Chat with AI assistant

**Sellers:**
- Create and manage products
- View seller dashboard
- Track inventory and ratings
- Manage shop information

**Admins:**
- Full system access
- User management
- Product moderation
- Dashboard analytics

## 🏗️ Tech Stack

**Frontend:**
- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- Shadcn UI components
- Zustand (state management)
- SWR (data fetching)

**Backend (Next.js API Routes):**
- Next.js API Routes (serverless)
- MongoDB with Mongoose
- JWT authentication
- Zod validation
- Bcrypt password hashing

**External Services:**
- MongoDB Atlas (database)
- Stripe (payments)
- Google Gemini AI (chatbot)
- Gmail SMTP (emails)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Stripe account
- Google Gemini API key

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/arslan19970000/fyp.git
cd fyp
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
# Database
MONGODB_URI=mongodb+srv://your-username:password@cluster.mongodb.net/
MONGODB_DB=nextuth

# Authentication
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters

# Stripe
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Google Gemini AI
GEMINI_API_KEY=AIza...

# Email (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password

# Application
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

4. **Run development server:**
```bash
npm run dev
```

5. **Access the application:**
- Frontend: http://localhost:3000
- API: http://localhost:3000/api

## 📁 Project Structure

```
ecommerce/
├── app/                      # Next.js App Router
│   ├── api/                 # API routes (backend)
│   │   ├── auth/           # Authentication endpoints
│   │   ├── products/       # Product CRUD
│   │   ├── orders/         # Order management
│   │   ├── users/          # User endpoints
│   │   ├── chat/           # AI chatbot
│   │   └── create-checkout-session/  # Stripe
│   ├── (pages)/            # Frontend pages
│   │   ├── page.tsx        # Homepage
│   │   ├── products/       # Product listing/details
│   │   ├── cart/           # Shopping cart
│   │   ├── checkout/       # Checkout flow
│   │   ├── account/        # User orders
│   │   ├── seller/         # Seller dashboard
│   │   └── admin/          # Admin dashboard
│   └── layout.tsx          # Root layout
│
├── components/              # React components
│   ├── ui/                 # Shadcn UI components
│   ├── navbar.tsx
│   ├── footer.tsx
│   ├── chatbot.tsx
│   └── product-card.tsx
│
├── lib/                     # Utilities
│   ├── auth.ts             # JWT functions
│   ├── db.ts               # MongoDB connection
│   ├── middleware.ts       # Auth middleware
│   └── validations.ts      # Zod schemas
│
├── models/                  # Mongoose schemas
│   ├── user.ts
│   ├── product.ts
│   └── order.ts
│
├── stores/                  # Zustand state
│   ├── auth-store.ts
│   └── cart-store.ts
│
└── hooks/                   # Custom React hooks
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Products
- `GET /api/products` - List products (with search/filters)
- `GET /api/products/:id` - Get product details
- `POST /api/products/:id` - Add review (buyers only)

### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create new order

### Stripe
- `POST /api/create-checkout-session` - Create Stripe session

### AI Chatbot
- `POST /api/chat` - Chat with AI assistant

### Users
- `GET /api/users/me` - Get current user
- `GET /api/verify-session` - Verify session

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

## 🔐 Environment Variables

Required variables in `.env`:

```env
MONGODB_URI           # MongoDB Atlas connection string
MONGODB_DB            # Database name
JWT_SECRET            # Secret key for JWT (32+ chars)
STRIPE_PUBLIC_KEY     # Stripe publishable key
STRIPE_SECRET_KEY     # Stripe secret key
GEMINI_API_KEY        # Google Gemini API key
EMAIL_HOST            # SMTP host (smtp.gmail.com)
EMAIL_PORT            # SMTP port (587)
EMAIL_USER            # Your email
EMAIL_PASSWORD        # App-specific password
NEXT_PUBLIC_API_URL   # API base URL
NEXT_PUBLIC_APP_URL   # App base URL
```

## 🎨 Key Features Explained

### Multi-Role Authentication
- JWT-based authentication with 7-day expiry
- Role-based access control (RBAC)
- Protected routes for buyers, sellers, admins
- Secure password hashing with bcrypt

### AI Shopping Assistant
- Powered by Google Gemini 2.5 Flash
- Context-aware conversations
- Real-time responses
- Shopping-focused system prompt

### Stripe Payment Integration
- Secure checkout sessions
- Test mode support
- Metadata storage for orders
- Success/cancel page handling

### Email Notifications
- Order confirmations for buyers
- New order alerts for sellers
- Beautiful HTML email templates
- Gmail SMTP integration

### Product Review System
- 5-star rating with hover effects
- Text comments
- Automatic rating calculation
- Buyer-only submission

## 🚀 Deployment

### Vercel (Recommended)

1. **Push to GitHub:**
```bash
git push origin main
```

2. **Deploy to Vercel:**
- Import repository on Vercel
- Add environment variables
- Deploy automatically

3. **Set environment variables in Vercel:**
- Go to Project Settings → Environment Variables
- Add all variables from `.env`

### Environment Setup
- `MONGODB_URI` - Your MongoDB Atlas URI
- `JWT_SECRET` - Random 32+ character string
- `STRIPE_SECRET_KEY` - From Stripe dashboard
- `GEMINI_API_KEY` - From Google AI Studio
- `EMAIL_PASSWORD` - Gmail app-specific password

## 📚 Documentation

- [THESIS.md](THESIS.md) - Complete academic thesis (120+ pages)
- [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) - Migration guide

## 🐛 Troubleshooting

### MongoDB Connection Error
- Check `MONGODB_URI` is correct
- Verify IP whitelist in MongoDB Atlas
- Ensure database user has permissions

### Stripe Payment Fails
- Use test card: `4242 4242 4242 4242`
- Verify Stripe keys are in test mode
- Check webhook configuration

### AI Chatbot Not Responding
- Verify `GEMINI_API_KEY` is set
- Check API quota in Google AI Studio
- Review browser console for errors

### Email Not Sending
- Use Gmail app-specific password
- Enable 2FA on Google account
- Check SMTP settings

## 🧪 Testing

### Test Accounts
Create test users with different roles:

**Admin:**
```bash
# Use signup page with admin role
Email: admin@shoplite.com
Role: Admin
```

**Seller:**
```bash
Email: seller@example.com
Role: Seller
Shop Name: Your Shop
```

**Buyer:**
```bash
Email: buyer@example.com
Role: Buyer
```

### Test Payment
Use Stripe test card:
- Card: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

## 🆘 Support

For issues or questions:
- Open an issue on GitHub
- Check the [THESIS.md](THESIS.md) for detailed documentation
- Review troubleshooting section above

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Shadcn/ui](https://ui.shadcn.com/) - UI components
- [Stripe](https://stripe.com/) - Payment processing
- [Google Gemini](https://ai.google.dev/) - AI chatbot
- [MongoDB](https://www.mongodb.com/) - Database
- [Vercel](https://vercel.com/) - Deployment platform

---

**Built with ❤️ using Next.js, TypeScript, MongoDB, and modern web technologies**

**GitHub:** https://github.com/arslan19970000/fyp

**Project Status:** ✅ Production Ready (MVP)

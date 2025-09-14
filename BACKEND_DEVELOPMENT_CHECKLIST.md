# 🚀 SnP Brand E-commerce Backend Development Checklist

## Project Overview
This checklist outlines the complete development process for building an Express.js backend for the SnP Brand React e-commerce application.

---

## Phase 1: Project Structure & Setup

### ✅ 1.1 Create Backend Directory Structure
```
snpbrand-react/
├── frontend/                 # Your current React app
│   ├── src/
│   ├── public/
│   └── package.json
└── backend/                  # New Express backend
    ├── src/
    │   ├── controllers/      # Route handlers
    │   ├── models/          # Database models
    │   ├── routes/          # API routes
    │   ├── middleware/      # Custom middleware
    │   ├── utils/           # Helper functions
    │   ├── config/          # Configuration files
    │   └── app.js           # Express app setup
    ├── uploads/             # File uploads
    ├── .env                 # Environment variables
    ├── package.json
    └── server.js            # Server entry point
```

### ✅ 1.2 Initialize Backend Package
- [ ] Create `backend/` folder
- [ ] Run `npm init -y` in backend folder
- [ ] Install core dependencies:
  ```bash
  npm install express cors helmet morgan dotenv bcryptjs jsonwebtoken
  npm install mongoose multer cloudinary
  npm install stripe nodemailer
  ```
- [ ] Install dev dependencies:
  ```bash
  npm install -D nodemon concurrently
  ```

### ✅ 1.3 Environment Configuration
- [ ] Create `.env` file with:
  ```env
  NODE_ENV=development
  PORT=5000
  MONGODB_URI=mongodb://localhost:27017/snpbrand
  JWT_SECRET=your_jwt_secret_key
  JWT_EXPIRE=7d
  STRIPE_SECRET_KEY=sk_test_...
  STRIPE_WEBHOOK_SECRET=whsec_...
  CLOUDINARY_CLOUD_NAME=your_cloud_name
  CLOUDINARY_API_KEY=your_api_key
  CLOUDINARY_API_SECRET=your_api_secret
  EMAIL_HOST=smtp.gmail.com
  EMAIL_PORT=587
  EMAIL_USER=your_email@gmail.com
  EMAIL_PASS=your_app_password
  ```

---

## Phase 2: Database Setup

### ✅ 2.1 Database Choice & Setup
**Option A: MongoDB (Recommended for beginners)**
- [ ] Install MongoDB locally or use MongoDB Atlas
- [ ] Set up Mongoose ODM
- [ ] Create database connection

**Option B: PostgreSQL (More structured)**
- [ ] Install PostgreSQL locally or use cloud service
- [ ] Set up Prisma ORM
- [ ] Create database schema

### ✅ 2.2 Database Models
- [ ] **User Model** (authentication, profile)
  ```javascript
  // User Schema
  {
    name: String,
    email: String (unique),
    password: String (hashed),
    role: String (user/admin),
    avatar: String,
    phone: String,
    address: Object,
    createdAt: Date,
    updatedAt: Date
  }
  ```

- [ ] **Product Model** (inventory, categories)
  ```javascript
  // Product Schema
  {
    name: String,
    description: String,
    price: Number,
    originalPrice: Number,
    images: [String],
    category: String,
    subcategory: String,
    brand: String,
    rating: Number,
    reviews: Number,
    inStock: Boolean,
    stockQuantity: Number,
    isNew: Boolean,
    isOnSale: Boolean,
    discount: Number,
    sizes: [String],
    colors: [String],
    tags: [String],
    createdAt: Date,
    updatedAt: Date
  }
  ```

- [ ] **Order Model** (purchases, status)
  ```javascript
  // Order Schema
  {
    user: ObjectId (ref: User),
    orderItems: [{
      product: ObjectId (ref: Product),
      quantity: Number,
      price: Number,
      size: String,
      color: String
    }],
    shippingAddress: Object,
    paymentMethod: String,
    paymentResult: Object,
    taxPrice: Number,
    shippingPrice: Number,
    totalPrice: Number,
    isPaid: Boolean,
    paidAt: Date,
    isDelivered: Boolean,
    deliveredAt: Date,
    status: String,
    createdAt: Date,
    updatedAt: Date
  }
  ```

- [ ] **Cart Model** (shopping cart items)
  ```javascript
  // Cart Schema
  {
    user: ObjectId (ref: User),
    items: [{
      product: ObjectId (ref: Product),
      quantity: Number,
      size: String,
      color: String,
      addedAt: Date
    }],
    createdAt: Date,
    updatedAt: Date
  }
  ```

- [ ] **Review Model** (product reviews)
  ```javascript
  // Review Schema
  {
    user: ObjectId (ref: User),
    product: ObjectId (ref: Product),
    rating: Number,
    comment: String,
    createdAt: Date,
    updatedAt: Date
  }
  ```

- [ ] **Category Model** (product categories)
  ```javascript
  // Category Schema
  {
    name: String,
    description: String,
    image: String,
    parentCategory: ObjectId (ref: Category),
    isActive: Boolean,
    createdAt: Date,
    updatedAt: Date
  }
  ```

---

## Phase 3: Authentication System

### ✅ 3.1 User Authentication
- [ ] Create user registration endpoint
  ```javascript
  POST /api/users/register
  // Body: { name, email, password }
  // Response: { token, user }
  ```

- [ ] Create user login endpoint
  ```javascript
  POST /api/users/login
  // Body: { email, password }
  // Response: { token, user }
  ```

- [ ] Implement JWT token generation
- [ ] Create password hashing with bcrypt
- [ ] Add email verification system
  ```javascript
  POST /api/users/verify-email
  // Body: { token }
  ```

- [ ] Create password reset functionality
  ```javascript
  POST /api/users/forgot-password
  // Body: { email }
  
  POST /api/users/reset-password
  // Body: { token, newPassword }
  ```

### ✅ 3.2 Authorization Middleware
- [ ] Create JWT verification middleware
- [ ] Add role-based access control
- [ ] Create admin-only routes protection
- [ ] Add rate limiting for auth routes

---

## Phase 4: Core API Endpoints

### ✅ 4.1 Product Management
- [ ] `GET /api/products` - Get all products (with pagination, filtering)
  ```javascript
  // Query params: page, limit, category, minPrice, maxPrice, search, sort
  // Response: { products, totalPages, currentPage, totalProducts }
  ```

- [ ] `GET /api/products/:id` - Get single product
  ```javascript
  // Response: { product, relatedProducts }
  ```

- [ ] `POST /api/products` - Create product (admin only)
  ```javascript
  // Body: { name, description, price, images, category, etc. }
  // Response: { product }
  ```

- [ ] `PUT /api/products/:id` - Update product (admin only)
- [ ] `DELETE /api/products/:id` - Delete product (admin only)
- [ ] `GET /api/products/search` - Search products
- [ ] `GET /api/products/categories` - Get product categories

### ✅ 4.2 User Management
- [ ] `GET /api/users/profile` - Get user profile
- [ ] `PUT /api/users/profile` - Update user profile
- [ ] `POST /api/users/register` - User registration
- [ ] `POST /api/users/login` - User login
- [ ] `POST /api/users/logout` - User logout
- [ ] `POST /api/users/forgot-password` - Forgot password
- [ ] `POST /api/users/reset-password` - Reset password

### ✅ 4.3 Shopping Cart
- [ ] `GET /api/cart` - Get user's cart
  ```javascript
  // Response: { items, totalItems, totalPrice }
  ```

- [ ] `POST /api/cart/add` - Add item to cart
  ```javascript
  // Body: { productId, quantity, size, color }
  // Response: { cart }
  ```

- [ ] `PUT /api/cart/update/:id` - Update cart item quantity
- [ ] `DELETE /api/cart/remove/:id` - Remove item from cart
- [ ] `DELETE /api/cart/clear` - Clear entire cart

### ✅ 4.4 Order Management
- [ ] `POST /api/orders` - Create new order
  ```javascript
  // Body: { orderItems, shippingAddress, paymentMethod }
  // Response: { order }
  ```

- [ ] `GET /api/orders` - Get user's orders
- [ ] `GET /api/orders/:id` - Get single order
- [ ] `PUT /api/orders/:id/status` - Update order status (admin)
- [ ] `GET /api/orders/admin` - Get all orders (admin)

### ✅ 4.5 Wishlist
- [ ] `GET /api/wishlist` - Get user's wishlist
- [ ] `POST /api/wishlist/add` - Add to wishlist
- [ ] `DELETE /api/wishlist/remove/:id` - Remove from wishlist

---

## Phase 5: Payment Integration

### ✅ 5.1 Stripe Setup
- [ ] Create Stripe account
- [ ] Install Stripe SDK
- [ ] Create payment intent endpoint
- [ ] Handle webhook events
- [ ] Create checkout session endpoint

### ✅ 5.2 Payment Endpoints
- [ ] `POST /api/payments/create-intent` - Create payment intent
  ```javascript
  // Body: { amount, currency, orderId }
  // Response: { clientSecret }
  ```

- [ ] `POST /api/payments/confirm` - Confirm payment
- [ ] `POST /api/payments/webhook` - Handle Stripe webhooks

---

## Phase 6: File Upload & Media

### ✅ 6.1 Image Upload
- [ ] Set up Multer for file uploads
- [ ] Configure Cloudinary for image storage
- [ ] Create image upload endpoints
- [ ] Add image optimization
- [ ] Create image deletion functionality

### ✅ 6.2 Media Endpoints
- [ ] `POST /api/upload/images` - Upload product images
  ```javascript
  // FormData: { images: File[] }
  // Response: { urls: string[] }
  ```

- [ ] `DELETE /api/upload/images/:id` - Delete image
- [ ] `GET /api/upload/images` - Get uploaded images

---

## Phase 7: Frontend Integration

### ✅ 7.1 API Service Layer
- [ ] Create API service functions in React
- [ ] Set up Axios for HTTP requests
- [ ] Add request/response interceptors
- [ ] Handle authentication tokens
- [ ] Add error handling

### ✅ 7.2 Update React Components
- [ ] Connect product data to backend
- [ ] Implement real user authentication
- [ ] Connect cart to backend persistence
- [ ] Add order history functionality
- [ ] Integrate payment flow

---

## Phase 8: Testing & Validation

### ✅ 8.1 API Testing
- [ ] Test all endpoints with Postman/Insomnia
- [ ] Add input validation middleware
- [ ] Test error handling
- [ ] Add API documentation (Swagger)

### ✅ 8.2 Security
- [ ] Add CORS configuration
- [ ] Implement rate limiting
- [ ] Add input sanitization
- [ ] Set up security headers
- [ ] Add request validation

---

## Phase 9: Deployment

### ✅ 9.1 Backend Deployment
- [ ] Choose hosting platform (Railway, Render, Heroku)
- [ ] Set up production database
- [ ] Configure environment variables
- [ ] Deploy backend API

### ✅ 9.2 Frontend Deployment
- [ ] Update API endpoints for production
- [ ] Deploy frontend (Vercel, Netlify)
- [ ] Configure domain and SSL
- [ ] Test full-stack application

---

## Phase 10: Production Features

### ✅ 10.1 Monitoring & Analytics
- [ ] Add logging system
- [ ] Set up error tracking (Sentry)
- [ ] Add performance monitoring
- [ ] Create admin dashboard

### ✅ 10.2 Additional Features
- [ ] Email notifications
- [ ] Inventory management
- [ ] Order tracking
- [ ] Customer support system
- [ ] Analytics and reporting

---

## 🚀 Quick Start Commands

When you're ready to begin:

```bash
# 1. Create backend directory
mkdir backend
cd backend

# 2. Initialize package.json
npm init -y

# 3. Install dependencies
npm install express cors helmet morgan dotenv bcryptjs jsonwebtoken mongoose multer cloudinary stripe nodemailer

# 4. Install dev dependencies
npm install -D nodemon concurrently

# 5. Create basic server structure
mkdir src src/controllers src/models src/routes src/middleware src/utils src/config
```

---

## 📝 Development Notes

### Key Dependencies to Install:
```bash
# Core Express dependencies
npm install express cors helmet morgan dotenv

# Authentication
npm install bcryptjs jsonwebtoken

# Database
npm install mongoose  # For MongoDB
# OR
npm install prisma @prisma/client  # For PostgreSQL

# File handling
npm install multer cloudinary

# Payment processing
npm install stripe

# Email
npm install nodemailer

# Development
npm install -D nodemon concurrently
```

### Environment Variables Template:
```env
# Server
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/snpbrand
# OR for PostgreSQL
DATABASE_URL=postgresql://username:password@localhost:5432/snpbrand

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

---

## 📚 Useful Resources

- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [Stripe API Documentation](https://stripe.com/docs/api)
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [JWT.io](https://jwt.io/) - For testing JWT tokens
- [Postman](https://www.postman.com/) - For API testing

---

## ✅ Progress Tracking

**Phase 1: Project Setup** - [ ] Complete
**Phase 2: Database Setup** - [ ] Complete
**Phase 3: Authentication** - [ ] Complete
**Phase 4: Core APIs** - [ ] Complete
**Phase 5: Payment Integration** - [ ] Complete
**Phase 6: File Upload** - [ ] Complete
**Phase 7: Frontend Integration** - [ ] Complete
**Phase 8: Testing** - [ ] Complete
**Phase 9: Deployment** - [ ] Complete
**Phase 10: Production Features** - [ ] Complete

---

*Last Updated: [Current Date]*
*Status: Ready to Start Development*

# 🐧 Penguin Men's Atelier — Complete Technical Handover Documentation

> **Status**: Production Ready  
> **Last Updated**: October 2026  
> **Primary Repository**: [github.com/saadhan-p/penguin-mens-clothing](https://github.com/saadhan-p/penguin-mens-clothing)  
> **Hosting Architecture**: Frontend on **Vercel**, Backend on **Render**, Database on **Supabase PostgreSQL**

---

## 📑 Table of Contents

1. [Executive Summary & Architecture Overview](#1-executive-summary--architecture-overview)
2. [Technology Stack](#2-technology-stack)
3. [Repository Directory & File Map](#3-repository-directory--file-map)
4. [Database Architecture & Data Models (Prisma + Supabase)](#4-database-architecture--data-models-prisma--supabase)
5. [Authentication, Authorization & Security Architecture](#5-authentication-authorization--security-architecture)
6. [Payment Gateways & Order Fulfillment Lifecycle](#6-payment-gateways--order-fulfillment-lifecycle)
7. [Storefront & Client Features](#7-storefront--client-features)
8. [Admin & SuperAdmin Portals](#8-admin--superadmin-portals)
9. [Infrastructure, Hosting & Deployment Playbook](#9-infrastructure-hosting--deployment-playbook)
10. [Environment Variables Master Matrix](#10-environment-variables-master-matrix)
11. [Operational Runbook & Troubleshooting](#11-operational-runbook--troubleshooting)

---

## 1. Executive Summary & Architecture Overview

**Penguin Men's Atelier** is a modern, high-performance, minimalist luxury menswear e-commerce platform. It provides a curated direct-to-consumer (D2C) shopping experience inspired by high-end fashion ateliers with complete merchandising, inventory governance, multi-tiered administrative access, and payment integrations.

### Architecture Diagram

```mermaid
graph TD
    subgraph ClientLayer ["Storefront Clients (Browser & Mobile)"]
        Shopper["Shopper / Customer"]
        AdminUser["Store Merchandiser"]
        SuperAdminUser["Security / Lead Superadmin"]
    end

    subgraph HostingFrontend ["Frontend Hosting (Vercel Global CDN)"]
        ReactApp["Vite + React SPA\n(React Router, Context API, Vanilla CSS)"]
    end

    subgraph HostingBackend ["Backend Hosting (Render Web Service)"]
        ExpressApp["Node.js / Express REST API\n(Controllers, Middleware, Multer, JWT)"]
    end

    subgraph HostingDatabase ["Database Hosting (Supabase)"]
        PostgresDB[("Supabase PostgreSQL\n(10 Relational Tables, Prisma ORM)")]
    end

    subgraph ExternalServices ["External Third-Party Integrations"]
        Razorpay["Razorpay Payment Gateway\n(Cards, UPI, NetBanking, HMAC-SHA256)"]
        GmailSMTP["Gmail SMTP / Nodemailer\n(Account Verification, Password Reset)"]
    end

    Shopper -->|HTTPS / WSS| ReactApp
    AdminUser -->|HTTPS| ReactApp
    SuperAdminUser -->|HTTPS| ReactApp

    ReactApp -->|REST API Calls /api/*| ExpressApp
    ExpressApp -->|Connection Pooler Port 5432| PostgresDB
    ExpressApp -->|Order Creation & Verification| Razorpay
    ExpressApp -->|Transactional Emails| GmailSMTP
```

---

## 2. Technology Stack

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | React | `^18.3.1` | Declarative component UI |
| **Build Tooling** | Vite | `^8.3.1` | Ultra-fast HMR and production bundling |
| **Routing** | React Router DOM | `^6.26.0` | Client-side routing with nested admin routes |
| **HTTP Client** | Axios | `^1.7.9` | Interceptor-driven API calls with credential support |
| **Backend Framework** | Express.js | `^4.19.2` | RESTful API routing, middleware, controllers |
| **Language Runtime** | Node.js (ES Modules) | `>= v18.0.0` | Server runtime with `"type": "module"` |
| **Database ORM** | Prisma Client & CLI | `^6.19.3` | Type-safe PostgreSQL queries and schema migrations |
| **Database Engine** | PostgreSQL | `15+` | Relational SQL database hosted on Supabase |
| **Authentication** | JWT (`jsonwebtoken`) | `^9.0.3` | Stateless signed auth tokens |
| **Password Hashing** | `bcryptjs` | `^3.0.3` | Salted 10-12 round password hashing |
| **Two-Factor Auth** | `speakeasy` + `qrcode` | `^2.0.0` | RFC 6238 TOTP Google Authenticator 2FA |
| **Payment Gateway** | Razorpay SDK | `^2.9.8` | Order initialization, webhooks, signature verification |
| **Email Service** | `nodemailer` | `^10.0.15` | SMTP transactional email transport |
| **File Uploads** | `multer` | `^2.4.0` | Multipart image upload pipeline |

---

## 3. Repository Directory & File Map

```
penguin-mens-clothing/
├── .gitignore                   # Root ignore rules (keeps secrets safe)
├── README.md                    # Quick-start setup instructions
├── HANDOVER_DOCUMENTATION.md    # Master technical handover document (This file)
├── package.json                 # Monorepo root concurrency scripts
├── render.yaml                  # Render Blueprints infrastructure-as-code
├── vercel.json                  # Vercel SPA routing rewrite rules
│
├── backend/                     # Node.js Express REST API
│   ├── config/
│   │   └── prisma.js            # Prisma client singleton instance
│   ├── controllers/
│   │   ├── authController.js    # Admin & Superadmin auth, 2FA, lockout logic
│   │   ├── categoryController.js# Category taxonomy CRUD
│   │   ├── configController.js  # Global site configs, hero slides, COD toggle
│   │   ├── customerAuthController.js # Shopper auth, verification, reset password
│   │   ├── orderController.js   # Order placement, tracking, status transitions
│   │   ├── paymentController.js # Razorpay order creation, verification, webhooks
│   │   └── productController.js # Product catalog CRUD, stock management, search
│   ├── middleware/
│   │   ├── auth.js              # Admin & Superadmin JWT & Bearer authorization
│   │   ├── customerAuth.js      # Customer session verification
│   │   └── upload.js            # Multer image storage & mime validation
│   ├── prisma/
│   │   ├── schema.prisma        # Master PostgreSQL Prisma schema definition
│   │   └── database_dump.sql    # Complete SQL dump of initial production data
│   ├── routes/
│   │   ├── authRoutes.js        # /api/auth/* routes
│   │   ├── categoryRoutes.js    # /api/categories/* routes
│   │   ├── configRoutes.js      # /api/config/* routes
│   │   ├── customerAuthRoutes.js# /api/customer/* routes
│   │   ├── orderRoutes.js       # /api/orders/* routes
│   │   ├── paymentRoutes.js     # /api/payments/* routes
│   │   ├── productRoutes.js     # /api/products/* routes
│   │   └── uploadRoutes.js      # /api/upload/* routes
│   ├── scripts/
│   │   ├── createSuperAdmin.js  # CLI to bootstrap a fresh SuperAdmin
│   │   ├── restoreDatabase.js   # Restores the curated 12-product database
│   │   ├── seedCleanBasics.js   # Optional development starter seed
│   │   └── seedPostgres.js      # Raw SQL seeder
│   ├── services/
│   │   ├── email.js             # Nodemailer welcome, verification & reset templates
│   │   └── razorpay.js          # Razorpay client instance & HMAC verifier
│   ├── uploads/                 # Local directory for uploaded garment photos
│   ├── server.js                # Express entrypoint, CORS, route registry
│   └── package.json             # Backend dependencies & npm scripts
│
└── frontend/                    # Vite + React Storefront Single Page App
    ├── public/                  # Static assets, category thumbnails, robots.txt
    ├── src/
    │   ├── components/          # Reusable UI components
    │   │   ├── AnnouncementBar.jsx
    │   │   ├── BottomNav.jsx    # Mobile bottom navigation bar
    │   │   ├── Footer.jsx       # Global footer with brand links
    │   │   ├── Header.jsx       # Responsive navigation header, search trigger
    │   │   ├── ProductCard.jsx  # Card with hover zoom, quick sizes & wishlist
    │   │   ├── QuickCartDrawer.jsx # Slide-out shopping bag
    │   │   └── SizeGuideModal.jsx # Atelier tailoring measurements guide
    │   ├── context/
    │   │   ├── CartContext.jsx  # Cart state, quantities, discounts, wishlist
    │   │   └── CustomerAuthContext.jsx # Customer login state & profile
    │   ├── pages/
    │   │   ├── Account.jsx      # Customer profile, orders, addresses
    │   │   ├── Admin.jsx        # Store Admin panel (Catalog, Stock, Orders)
    │   │   ├── Checkout.jsx     # Order placement, addresses, Razorpay / COD
    │   │   ├── Collection.jsx   # Catalog with category filters & sorting
    │   │   ├── ForgotPassword.jsx
    │   │   ├── Home.jsx         # Hero slides, Bento categories, new arrivals
    │   │   ├── Login.jsx        # Customer login
    │   │   ├── OrderStatus.jsx  # Post-purchase confirmation & invoice summary
    │   │   ├── ProductDetail.jsx# High-res gallery, size picker, fabric care
    │   │   ├── ResetPassword.jsx
    │   │   ├── Search.jsx       # Instant search by keywords & categories
    │   │   ├── SignUp.jsx       # Customer registration
    │   │   ├── SuperAdmin.jsx   # SuperAdmin security, staff accounts & 2FA
    │   │   ├── TrackOrder.jsx   # Public order tracking by order number
    │   │   ├── VerifyEmail.jsx  # Email verification callback handler
    │   │   ├── WinterDrop.jsx   # Curated seasonal winter capsule page
    │   │   └── Wishlist.jsx     # Saved customer items
    │   ├── services/
    │   │   └── api.js           # Axios API endpoints with automatic prod fallback
    │   ├── App.jsx              # Routes declaration & layout wrapper
    │   ├── index.css            # Atelier typography, dark mode tokens & layout
    │   └── main.jsx             # React DOM root entry
    ├── index.html               # HTML5 shell with Google Fonts & icons
    └── package.json             # Frontend dependencies & npm scripts
```

---

## 4. Database Architecture & Data Models (Prisma + Supabase)

The database runs on **Supabase PostgreSQL** via **Prisma ORM**. It consists of **10 normalized tables**:

```mermaid
erDiagram
    customers ||--o{ addresses : "has many"
    customers ||--o{ orders : "places"
    customers ||--o{ cart_items : "holds"
    customers ||--o{ wishlist_items : "saves"
    categories ||--o{ products : "contains"
    orders ||--|{ order_items : "contains"
    products ||--o{ order_items : "referenced in"

    users {
        String id PK
        String email UK
        String password
        String role "admin | superadmin"
        Boolean mfaEnabled
        String mfaSecret
        Json backupCodes
    }

    customers {
        String id PK
        String email UK
        String phone UK
        String password
        Boolean emailVerified
        Int failedLoginAttempts
        DateTime lockedUntil
    }

    addresses {
        String id PK
        String customerId FK
        String fullName
        String phone
        String line1
        String city
        String state
        String pincode
        Boolean isDefault
    }

    categories {
        String id PK
        String name UK
        String slug UK
        Int sortOrder
        Boolean isActive
    }

    products {
        String id PK
        String slug UK
        String name
        String category
        String categoryId FK
        Float price
        Float originalPrice
        Json images
        Json sizes
        Json colorVariants
        Int stock
        Boolean inStock
    }

    orders {
        String id PK
        String orderNumber UK
        String customerId FK
        Float subtotal
        Float shippingFee
        Float discount
        Float total
        String status
        String paymentProvider
        String razorpayOrderId UK
        String razorpayPaymentId
        Json shippingAddress
    }

    order_items {
        String id PK
        String orderId FK
        String productId
        String name
        Float price
        String size
        Int quantity
    }

    site_configs {
        String id PK
        String marqueeText
        Json heroSlides
        Boolean enableCod
        Boolean showWinterDrop
    }
```

### Table Definitions & Specifications

#### 1. `users` (Staff & Administrative Governance)
* **Purpose**: Stores Store Admins and Lead Superadmins.
* **Fields**: `id` (UUID), `name`, `email` (Unique), `password` (bcrypt), `role` (`customer`, `admin`, `superadmin`), `mfaSecret` (TOTP), `mfaEnabled` (Boolean), `backupCodes` (JSON array of bcrypt hashes), `failedLoginAttempts`, `lockedUntil`, `lastLoginAt`.

#### 2. `customers` (Store Shoppers)
* **Purpose**: Stores registered storefront customers.
* **Fields**: `id` (UUID), `name`, `email` (Unique), `phone` (Unique), `password` (bcrypt), `emailVerified` (Boolean), `emailVerifyToken`, `emailVerifyExpiry`, `resetToken`, `resetTokenExpiry`, `failedLoginAttempts`, `lockedUntil`.

#### 3. `addresses` (Customer Delivery Locations)
* **Purpose**: Customer shipping addresses.
* **Relation**: Belongs to `Customer` with `onDelete: Cascade`.

#### 4. `categories` (Garment Taxonomy)
* **Purpose**: Categories displayed on headers, mobile bars, and filters (`Shirts`, `Jackets`, `Tees`, `Tailoring`, `Jeans`, `Accessories`, `Formals`).
* **Fields**: `name` (Unique), `slug` (Unique), `description`, `image`, `sortOrder`, `isActive`.

#### 5. `products` (Inventory Catalog)
* **Purpose**: Holds all garment items.
* **Fields**: `slug` (Unique), `name`, `category`, `categoryId` (FK to `categories`), `color`, `price`, `originalPrice`, `badge`, `images` (JSON array of URLs), `sizes` (JSON array with size and stock), `colorVariants` (JSON), `isFeatured`, `isWinterDrop`, `inStock`, `stock`, `stockStatus`, `fabricDetails`, `careInstructions`, `description`.

#### 6. `orders` & `order_items`
* **Purpose**: Financial purchase history and customer invoices.
* **Fields in Order**: `orderNumber` (Unique, e.g., `PGN-829991-902`), `customerId` (FK, `onDelete: SetNull`), `subtotal`, `shippingFee`, `discount`, `total`, `status` (`pending`, `paid`, `shipped`, `delivered`, `cancelled`), `orderStatus`, `paymentProvider` (`razorpay`, `cod`), `razorpayOrderId` (Unique), `razorpayPaymentId`, `razorpaySignature`, `shippingAddress` (JSON).
* **Fields in OrderItem**: Price snapshot at purchase, size, color, quantity.

#### 7. `site_configs` (Global CMS Toggles)
* **Purpose**: Real-time admin settings.
* **Fields**: `marqueeText`, `heroSlides` (JSON), `showWinterDrop`, `enableCod` (Boolean toggle for COD), `winterDropTitle`, `winterDropSubtitle`.

---

## 5. Authentication, Authorization & Security Architecture

### A. Customer vs. Staff Separation
The application strictly enforces **Role-Based Access Control (RBAC)** across two separate database models:
* **Customers** authenticate against `/api/customer/*` and the `customers` table.
* **Staff/Admins** authenticate against `/api/auth/*` and the `users` table.
* A customer cannot access admin routes, and admins cannot bypass 2FA checks without valid sessions.

### B. Password Security
* **Algorithm**: `bcryptjs` with salt rounds = 10 (or 12 for high-security admins).
* **Policy**: Passwords are never stored in plaintext, never logged, and cannot be decrypted even in database dumps.

### C. Multi-Factor Authentication (MFA / 2FA)
* SuperAdmin and Admin accounts support **TOTP 2FA** using the `speakeasy` library.
* Compatible with **Google Authenticator**, **1Password**, and **Apple Passwords**.
* Provides 8 cryptographically hashed emergency single-use backup recovery codes.

### D. Anti-Brute Force Protection
* Accounts track `failedLoginAttempts`.
* Upon reaching threshold limits, the account is locked for a cooling duration (`lockedUntil`), mitigating credential stuffing.

### E. Session Cookies & Cross-Origin Security
To ensure seamless authentication between a frontend on **Vercel** (`.vercel.app`) and backend on **Render** (`.onrender.com`):
* Session cookies use `sameSite: 'none'` and `secure: true` in production.
* Backend middlewares ([backend/middleware/auth.js](file:///Users/saadhan/Drive/Projects/Clients/Pengiun's%20Groups/backend/middleware/auth.js) & [backend/middleware/customerAuth.js](file:///Users/saadhan/Drive/Projects/Clients/Pengiun's%20Groups/backend/middleware/customerAuth.js)) support **both Cookies and the `Authorization: Bearer <token>` header**.

### F. Regulatory Compliance
* **DPDP Act 2023 (India)**: Data minimization (only essential order details saved); cascading account deletion via `onDelete: Cascade`.
* **RBI & PCI-DSS Guidelines**: **Zero banking/card information is ever stored.** All card and UPI numbers are processed in Razorpay's PCI-DSS Level 1 certified vault.

---

## 6. Payment Gateways & Order Fulfillment Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor Shopper as Shopper
    participant Client as Frontend (Vercel)
    participant Server as Backend API (Render)
    participant Razorpay as Razorpay Gateway
    participant DB as PostgreSQL (Supabase)

    Shopper->>Client: Clicks "Proceed to Payment"
    Client->>Server: POST /api/payments/checkout (Cart + Address)
    
    alt If Cash on Delivery (COD)
        Server->>DB: Check if enableCod == true
        Server->>DB: Decrement Product Inventory
        Server->>DB: Create Order (status: 'pending', provider: 'cod')
        Server-->>Client: Returns { success: true, isCod: true, orderNumber }
        Client->>Shopper: Redirect to /order/status (Success Invoice)
    else If Online Payment (Razorpay)
        Server->>Razorpay: rzp.orders.create({ amount, currency: 'INR', receipt })
        Razorpay-->>Server: Returns razorpay_order_id
        Server->>DB: Create Order in DB (paymentStatus: 'initiated')
        Server-->>Client: Returns { razorpayOrderId, keyId, amount }
        Client->>Shopper: Opens Razorpay Checkout Modal
        Shopper->>Razorpay: Authorizes Payment (UPI / Card / NetBanking)
        Razorpay-->>Client: Returns { razorpay_payment_id, razorpay_signature }
        Client->>Server: POST /api/payments/razorpay/verify
        Server->>Server: Verify HMAC-SHA256 Signature
        Server->>DB: Decrement Product Inventory (Atomic)
        Server->>DB: Update Order (status: 'paid', paymentStatus: 'success')
        Server-->>Client: Returns { success: true, orderNumber }
        Client->>Shopper: Redirect to /order/status
    end
```

### Dev Mode Mock Support
If `RAZORPAY_KEY_ID` is omitted or set to test mode in development, the system generates a simulated order ID (`order_dev_*`) allowing full end-to-end checkout testing without failing network requests.

---

## 7. Storefront & Client Features

1. **Hero Fashion Carousel**: Auto-advancing slides featuring seasonal drops, customizable from the Admin Panel.
2. **Dynamic Bento & Mobile Categories**: Responsive visual category tiles matching clean streetwear styling.
3. **Filter & Sort Engine**: Filter by category, price ranges, sizes (`S` to `XXL`), and sort by *Popularity*, *Price*, or *Newest*.
4. **Interactive Size Guide**: Tailored measurements modal for chest, waist, and length in inches and centimeters.
5. **Persistent Bag & Wishlist**: Context-backed cart supporting quantity adjustments, coupon logic, and instant wishlist toggles.
6. **Public Order Tracking**: Real-time status lookup (`/track/:orderNumber`) without requiring login.

---

## 8. Admin & SuperAdmin Portals

The application implements a **two-layer administration architecture** with obfuscated routes:

```mermaid
graph LR
    subgraph Layer1 ["Layer 1: Store Merchandising"]
        StoreAdmin["Store Admin\nURL: /penguin-ctrl-x7k2\nRole: 'admin'"]
        StoreAdmin --> CatalogMgmt["Product CRUD & Photos"]
        StoreAdmin --> StockMgmt["Inventory Levels & Size Stock"]
        StoreAdmin --> OrderMgmt["Order Dispatch & Tracking IDs"]
        StoreAdmin --> ConfigMgmt["Hero Slides & COD Toggle"]
    end

    subgraph Layer2 ["Layer 2: Security Governance"]
        SuperAdmin["Superadmin\nURL: /penguin-super-ctrl\nRole: 'superadmin'"]
        SuperAdmin --> StaffMgmt["Create & Revoke Admin Accounts"]
        SuperAdmin --> TwoFactor["Enforce 2FA & View Audit Logs"]
        SuperAdmin --> Lockout["Unlock Brute-Forced Accounts"]
    end
```

### Secret Admin URLs:
| Portal | Default Path | Configurable Env Key |
| :--- | :--- | :--- |
| **Store Admin** | `/penguin-ctrl-x7k2` *(or `/admin`)* | `VITE_ADMIN_PANEL_PATH` |
| **SuperAdmin Console** | `/penguin-super-ctrl` *(or `/superadmin`)* | `VITE_SUPERADMIN_PATH` |

### Default Seed Credentials:
* **Superadmin**: `admin@penguin.com` / `admin123`
* **Admin (Pavan)**: `storeadmin@gmail.com`

---

## 9. Infrastructure, Hosting & Deployment Playbook

### Architecture Components

```
┌─────────────────────────┐       ┌─────────────────────────┐       ┌─────────────────────────┐
│     VERCEL (Frontend)   │       │   RENDER (Backend API)  │       │   SUPABASE (Database)   │
│  • React SPA Build      │ ----> │  • Node.js / Express    │ ----> │  • PostgreSQL 15+       │
│  • Edge CDN             │       │  • Free Web Service     │       │  • Port 5432 Session    │
│  • Custom Domain        │       │  • 24/7 HTTPS Endpoint  │       │  • Permanent 500MB Free │
└─────────────────────────┘       └─────────────────────────┘       └─────────────────────────┘
```

### Render Web Service Setup (Backend)
1. **Repository**: Connect `saadhan-p/penguin-mens-clothing`.
2. **Root Directory**: `backend`
3. **Environment**: `Node`
4. **Build Command**:
   ```bash
   npm install && npx prisma generate && npx prisma db push --accept-data-loss
   ```
5. **Start Command**:
   ```bash
   npm start
   ```

### Vercel Setup (Frontend)
1. **Root Directory**: `frontend` (or root with `vercel.json`).
2. **Build Command**: `npm run build`
3. **Output Directory**: `dist`
4. **Environment Variables**:
   * `VITE_API_URL`: `https://penguin-mens-clothing.onrender.com/api`

---

## 10. Environment Variables Master Matrix

### Backend Environment Variables (`backend/.env`)

| Variable | Required | Description | Example / Default |
| :--- | :--- | :--- | :--- |
| `PORT` | No | Express server listening port | `5001` |
| `NODE_ENV` | Yes | App environment (`development` or `production`) | `production` |
| `DATABASE_URL` | **Yes** | Supabase PostgreSQL Connection String (Port 5432) | `postgresql://postgres.[REF]:[PASS]@aws-0-[REGION].pooler.supabase.com:5432/postgres` |
| `JWT_SECRET` | **Yes** | 256-bit secret key for signing auth tokens | `secure_jwt_secret_atelier_2026` |
| `CLIENT_URL` | Yes | Storefront URL for CORS validation | `https://penguin-mens.vercel.app` |
| `ADMIN_EMAIL` | Yes | Default bootstrap admin email | `admin@penguin.com` |
| `ADMIN_PASSWORD`| Yes | Default bootstrap admin password | `admin123` |
| `ADMIN_PANEL_PATH`| No | Custom admin panel route prefix | `penguin-ctrl-x7k2` |
| `RAZORPAY_KEY_ID` | Optional | Razorpay Key ID | `rzp_live_...` or `rzp_test_...` |
| `RAZORPAY_KEY_SECRET`| Optional| Razorpay Secret Key | `your_secret_key` |
| `SMTP_HOST` | Optional | SMTP mail host (e.g., Gmail) | `smtp.gmail.com` |
| `SMTP_PORT` | Optional | SMTP port | `587` |
| `SMTP_USER` | Optional | Transactional email account | `penguinmensadmin@gmail.com` |
| `SMTP_PASS` | Optional | SMTP App Password | `16-character-app-password` |

### Frontend Environment Variables (`frontend/.env`)

| Variable | Required | Description | Example / Default |
| :--- | :--- | :--- | :--- |
| `VITE_API_URL` | **Yes** | Fully qualified URL to the backend `/api` endpoint | `https://penguin-mens-clothing.onrender.com/api` |
| `VITE_ADMIN_PANEL_PATH` | No | Must match backend admin route | `penguin-ctrl-x7k2` |
| `VITE_SUPERADMIN_PATH` | No | Secret superadmin route | `penguin-super-ctrl` |

---

## 11. Operational Runbook & Troubleshooting

### Local Development Commands

```bash
# 1. Run both Frontend & Backend concurrently
npm run dev

# 2. Run only Frontend
npm run dev:frontend

# 3. Run only Backend
npm run dev:backend

# 4. Open Prisma Visual Database Studio
npm run --prefix backend studio
```

### Database Maintenance & Reseeding

```bash
# Restore the curated 12 products, categories & real accounts to database
cd backend
npm run db:restore

# Push schema changes to database (without losing data)
npx prisma db push --accept-data-loss
```

### Common Troubleshooting Scenarios

#### 1. "Frontend is blank or products don't show"
* **Cause**: Backend on Render free tier is sleeping (cold start).
* **Fix**: Render free tier takes ~30 seconds to wake up. Visit `https://penguin-mens-clothing.onrender.com/health` directly in your browser. Once it returns `{"status":"online"}`, refresh the storefront.

#### 2. "CORS Error in Browser Console"
* **Cause**: `CLIENT_URL` on Render doesn't match the frontend URL.
* **Fix**: Ensure your Vercel URL is added to `CLIENT_URL` in Render Environment settings. Note that any `*.vercel.app` domain is automatically permitted by [server.js](file:///Users/saadhan/Drive/Projects/Clients/Pengiun's%20Groups/backend/server.js).

#### 3. "Password contains special character like `@` in DATABASE_URL"
* **Cause**: The `@` character breaks connection string URI parsing.
* **Fix**: URL-encode special characters (e.g. replace `@` with `%40`).

---

*Handover documentation compiled with full architectural fidelity for Penguin Men's Section.*

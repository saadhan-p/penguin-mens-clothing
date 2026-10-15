# 🐧 Penguin Men's Section — Luxury E-Commerce Atelier

Modern, minimalist luxury menswear e-commerce platform built with Node.js/Express, PostgreSQL, Prisma ORM, and React (Vite).

> 📖 **Comprehensive Handover Documentation**: For complete architecture diagrams, database models, security, deployment, and operational procedures, refer to [HANDOVER_DOCUMENTATION.md](file:///Users/saadhan/Drive/Projects/Clients/Pengiun's%20Groups/HANDOVER_DOCUMENTATION.md).

---

## ⚡ Quick Start Guide (For New Setup)

### 1. Prerequisites
- **Node.js**: v18 or higher
- **PostgreSQL**: Running locally (e.g. via Homebrew on Mac `brew services start postgresql@15`, Docker, or Postgres.app)

---

### 2. Clone Repository & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/saadhan-p/penguin-mens-clothing.git
cd penguin-mens-clothing

# Install root, backend, and frontend dependencies
npm install
npm install --prefix backend
npm install --prefix frontend
```

---

### 3. Setup Environment Variables

```bash
# In the backend directory:
cp backend/.env.example backend/.env
```

> **Note**: Verify `DATABASE_URL` in `backend/.env` matches your local PostgreSQL credentials (e.g., `postgresql://postgres:postgres@localhost:5432/penguin_mens_store?schema=public`).

---

### 4. Initialize Database & Seed Catalog

```bash
# Push Prisma schema to PostgreSQL database & generate client
cd backend
npx prisma db push
npx prisma generate

# Seed 45 clean basic products & initial categories
node scripts/seedCleanBasics.js
cd ..
```

---

### 5. Run the Application

You can start both frontend & backend concurrently with a single command from the project root:

```bash
npm run dev
```

- **Storefront**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5001](http://localhost:5001)

---

## 🛠️ Helpful Commands

```bash
# Open Prisma Studio GUI
npm run --prefix backend studio

# Restore curated store database (12 products, categories & real accounts)
node backend/scripts/restoreDatabase.js

# Build for production
npm run build
```

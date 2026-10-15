# 🐧 Penguin Men's Section — Luxury E-Commerce Atelier

Modern, minimalist luxury menswear e-commerce platform built with Node.js/Express, PostgreSQL, Prisma ORM, and React (Vite).

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

# Re-seed clean basic catalog
node backend/scripts/seedCleanBasics.js

# Build for production
npm run build
```

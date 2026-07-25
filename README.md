# Payment Checkout Application

A full-stack payment checkout application built with React and NestJS. Customers can browse products, enter payment and delivery information, process credit card payments through an external payment gateway, and view transaction results.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Redux Toolkit + Vite |
| Backend | NestJS + TypeScript + Prisma ORM |
| Database | PostgreSQL |
| Architecture | Hexagonal (Ports & Adapters) + Railway Oriented Programming |
| Testing | Jest (>80% coverage target) |
| Deployment | AWS (CloudFront + S3 + Lambda/ECS + RDS) |

## Architecture Overview

### Backend - Hexagonal Architecture

```
backend/src/
├── domain/           # Core business logic (no external dependencies)
│   ├── entities/     # Product, Transaction, Customer, Delivery
│   ├── ports/        # Interface contracts for external deps
│   ├── services/     # Domain services (IntegrityService)
│   └── value-objects/ # Result<T,E>, AppError, pipe utility
├── application/      # Use cases with ROP pipelines
│   └── use-cases/    # GetProducts, CreateTransaction, ProcessPayment, etc.
└── infrastructure/   # External adapters, controllers, DTOs
    ├── adapters/     # Prisma repos, Payment Gateway HTTP adapter
    ├── controllers/  # REST endpoints (thin, delegates to use cases)
    ├── config/       # PrismaService, error mapping
    └── dto/          # Request validation with class-validator
```

### Frontend - React SPA

```
frontend/src/
├── components/       # Reusable UI: ProductCard, PaymentModal, DeliveryForm, etc.
├── pages/            # ProductPage (5-step flow), StatusPage
├── store/            # Redux Toolkit: products + checkout slices
├── services/         # API client, Payment Gateway service, Persistence
├── utils/            # Card validation (Luhn), delivery validation, COP formatting
└── styles/           # CSS variables, global mobile-first styles
```

## Checkout Flow (5 Steps)

1. **Product Page** - Browse products with stock, price in COP
2. **Payment Modal** - Credit card input with Luhn validation, Visa/MC detection
3. **Delivery Form** - Shipping address with postal code validation
4. **Summary Backdrop** - Fee breakdown (product + base fee + delivery fee)
5. **Status Page** - Transaction result (success/failure) with redirect

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List all products with stock |
| POST | `/api/transactions` | Create PENDING transaction |
| GET | `/api/transactions/:id` | Get transaction by ID |
| POST | `/api/transactions/:id/process` | Process payment via gateway |
| POST | `/api/customers` | Create/update customer |
| GET | `/api/customers/:id` | Get customer by ID |
| POST | `/api/deliveries` | Create delivery record |
| GET | `/api/deliveries/:id` | Get delivery by ID |
| GET | `/api/health` | Health check |

## Data Model

```
Product (1) ──── (N) Transaction
Product (1) ──── (N) Delivery
Transaction (1) ── (0..1) Delivery
Customer (1) ──── (N) Delivery

Products: id, name, description, price, stock, image_url
Transactions: id, reference, product_id, quantity, total_amount, base_fee, delivery_fee, status, customer_email, gateway_transaction_id
Customers: id, name, email, phone, document_id
Deliveries: id, transaction_id, customer_id, product_id, full_name, street_address, city, department, postal_code
```

## Setup (Local Development)

### Prerequisites

- Node.js >= 18
- PostgreSQL running locally (or Docker)
- npm

### Environment Variables

```bash
# Backend (backend/.env)
DATABASE_URL=postgresql://user:password@localhost:5432/app_paid?schema=public
PAYMENT_GATEWAY_API_URL=<sandbox_api_url>
PAYMENT_GATEWAY_PUBLIC_KEY=<public_key>
PAYMENT_GATEWAY_PRIVATE_KEY=<private_key>
PAYMENT_GATEWAY_INTEGRITY_KEY=<integrity_key>
PORT=3000
FRONTEND_URL=http://localhost:5173
BASE_FEE=5000
DELIVERY_FEE=10000

# Frontend (frontend/.env)
VITE_API_URL=http://localhost:3000/api
VITE_GATEWAY_PUBLIC_KEY=<public_key>
VITE_GATEWAY_API_URL=<sandbox_api_url>
```

### Installation

```bash
# Install all dependencies (workspaces)
npm install

# Generate Prisma client
cd backend && npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed database
npx prisma db seed

# Start backend
npm run start:dev

# In another terminal - start frontend
cd ../frontend && npm run dev
```

### Running Tests

```bash
# Backend tests
cd backend && npm run test:cov

# Frontend tests
cd frontend && npm run test:cov
```

## Key Design Decisions

1. **Railway Oriented Programming (ROP)** - All use cases return `Result<T, AppError>`. Operations chain sequentially; first failure short-circuits the pipeline.

2. **Hexagonal Architecture** - Domain layer has zero external dependencies. All infrastructure (DB, HTTP, gateway) accessed through port interfaces.

3. **Atomic Stock Decrement** - Uses Prisma's conditional update (`WHERE stock >= quantity`) to prevent race conditions and negative stock.

4. **State Persistence** - Redux state saved to localStorage on step transitions with 30-minute TTL. Survives page refresh.

5. **Integrity Validation** - SHA-256 signature computed from (reference + amount + currency + integrity_key) for payment verification.

6. **Security** - Helmet headers, CORS whitelist, input sanitization via class-validator, CVV never persisted, card data cleared after transaction.

## Deployment

Infrastructure as Code using AWS CDK (TypeScript) located in `infrastructure/`:

**Architecture:**
- Frontend: S3 + CloudFront (HTTPS, edge caching, SPA routing)
- Backend: AWS Lambda + API Gateway (serverless, auto-scaling)
- Database: RDS PostgreSQL (free tier, t3.micro, private subnet)
- Networking: VPC with public + isolated subnets

**Deploy:**
```bash
# Prerequisites: AWS CLI configured, CDK bootstrapped
cd infrastructure
npm install
npx cdk bootstrap   # first time only

# Full deploy (builds frontend + backend, deploys all)
./deploy.sh         # Linux/Mac
deploy.bat          # Windows
```

**Outputs after deploy:**
- `CloudFrontURL` - Frontend HTTPS URL
- `ApiUrl` - Backend API Gateway URL
- `DatabaseEndpoint` - RDS hostname (private)

## Branch Strategy

Each feature is developed in a dedicated branch and merged to main:
- `feature/task-1-scaffolding`
- `feature/task-2-domain-layer`
- `feature/task-3-application-layer`
- `feature/task-4-infrastructure-layer`
- `feature/task-5-frontend-components`
- `feature/task-6-unit-tests`
- `feature/task-7-aws-infrastructure`

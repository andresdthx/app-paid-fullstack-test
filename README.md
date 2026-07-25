# Payment Checkout App

Full-stack payment checkout application with credit card processing, stock management, and delivery tracking. Built with a focus on clean architecture, resilience patterns, and production-grade engineering practices.

**Live Demo:** http://app-paid-frontend-511417.s3-website-us-east-1.amazonaws.com  
**Backend API:** http://44.198.164.53:3000/api  
**Health Check:** http://44.198.164.53:3000/api/health

---

## Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend | React 18, TypeScript, Redux Toolkit, Vite | SPA with type safety, predictable state, fast HMR |
| Backend | NestJS, TypeScript, Prisma ORM | Modular DI framework, type-safe DB access |
| Database | PostgreSQL 15 | ACID transactions, relational integrity |
| Architecture | Hexagonal + Railway Oriented Programming | Decoupled domain, explicit error handling |
| Testing | Jest, ts-jest | 96 tests, >80% coverage |
| Infrastructure | AWS (EC2, S3, PostgreSQL) + CDK IaC | Cost-effective deployment with reproducibility |
| CSS | Flexbox + Grid, custom properties | Mobile-first, no framework overhead |

---

## Architecture

### System Overview

```
                     ┌─────────────────────┐
                     │   S3 Static Site    │  ← React SPA (Vite build)
                     └──────────┬──────────┘
                                │ HTTP
                     ┌──────────▼──────────┐
                     │  EC2 / NestJS API   │  ← Port 3000
                     └──────────┬──────────┘
                                │
               ┌────────────────┼────────────────┐
               ▼                                 ▼
     ┌─────────────────┐              ┌─────────────────┐
     │   PostgreSQL    │              │ Payment Gateway │
     │   (local DB)    │              │  (Sandbox API)  │
     └─────────────────┘              └─────────────────┘
```

### Backend — Hexagonal Architecture (Ports & Adapters)

```
backend/src/
├── domain/                    # Zero external dependencies
│   ├── entities/              # Product, Transaction, Customer, Delivery
│   ├── ports/                 # Interface contracts (repository, gateway, integrity)
│   ├── services/              # IntegrityService (SHA-256 signature)
│   └── value-objects/         # Result<T,E>, AppError, pipe (ROP utilities)
│
├── application/               # Orchestration layer
│   └── use-cases/             # Each use case = ROP pipeline
│       ├── get-products       # Fetch all products
│       ├── create-transaction # Validate → check stock → persist PENDING
│       ├── process-payment    # Gateway call → poll → integrity check → update
│       ├── create-customer    # Idempotent by email
│       └── create-delivery    # Idempotent by transaction
│
└── infrastructure/            # All external adapters
    ├── adapters/              # Prisma repositories, Payment Gateway HTTP client
    ├── controllers/           # Thin REST layer (delegates to use cases)
    ├── dto/                   # Request validation (class-validator)
    └── config/                # PrismaService, error mapper, env config
```

**Key principle:** Domain layer never imports infrastructure. Dependencies point inward. Controllers do NOT contain business logic.

### Frontend — Component Architecture

```
frontend/src/
├── components/                # Reusable, presentation-focused
│   ├── ProductCard/           # Product display with stock badge
│   ├── PaymentModal/          # Card form + real-time Luhn/brand validation
│   ├── DeliveryForm/          # Address fields + postal code validation
│   ├── SummaryBackdrop/       # Material backdrop with fee breakdown
│   └── StatusDisplay/         # Transaction result (success/failure)
│
├── pages/                     # Route-level orchestrators
│   ├── ProductPage/           # 5-step flow controller
│   └── StatusPage/            # Fetch-on-refresh recovery
│
├── store/                     # Redux Toolkit
│   └── slices/                # products (CRUD) + checkout (state machine)
│
├── services/                  # External communication
│   ├── api.service.ts         # Axios client with timeout/interceptors
│   ├── pay-gateway.service.ts # Tokenization + acceptance token
│   └── persistence.service.ts # localStorage with TTL + structure validation
│
└── utils/                     # Pure functions (testable)
    ├── card-validation.ts     # Luhn, brand detection, expiry, CVV, name
    ├── delivery-validation.ts # Postal code, required fields
    └── amount-calculation.ts  # formatCOP, calculateTotal, toCents
```

---

## Checkout Flow (5-Step Process)

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ 1.Product│───▶│ 2.Card   │───▶│3.Delivery│───▶│4.Summary │───▶│ 5.Status │
│   Page   │    │  Modal   │    │   Form   │    │ Backdrop │    │   Page   │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └─────┬────┘
                                                                       │
                                                              redirect │
                                                                       ▼
                                                              ┌──────────┐
                                                              │ 1.Product│
                                                              │(updated) │
                                                              └──────────┘
```

Each step persists to `localStorage` (30-min TTL). Page refresh restores last completed step.

### Test Card Data (Sandbox)

Use the following card for testing approved transactions:

| Field | Value |
|-------|-------|
| Card Number | `4242 4242 4242 4242` |
| Cardholder Name | Any name (e.g. `John Doe`) |
| Expiry | Any future date (e.g. `12/30`) |
| CVV | Any 3 digits (e.g. `123`) |

This card always results in an **APPROVED** transaction in the sandbox environment.

---

## API Endpoints

| Method | Endpoint | Request Body | Response | Status |
|--------|----------|--------------|----------|--------|
| `GET` | `/api/products` | — | `Product[]` | 200 |
| `POST` | `/api/transactions` | `{productId, quantity, customerEmail, baseFee, deliveryFee}` | `{transactionId, reference, totalAmount, signature}` | 201 |
| `GET` | `/api/transactions/:id` | — | `Transaction` | 200/404 |
| `POST` | `/api/transactions/:id/process` | `{cardToken, acceptanceToken, customerEmail, deliveryData}` | `{transactionId, reference, status, statusReason?}` | 200/400/502 |
| `POST` | `/api/customers` | `{name, email, phone?, documentId?}` | `Customer` | 201 |
| `GET` | `/api/customers/:id` | — | `Customer` | 200/404 |
| `POST` | `/api/deliveries` | `{transactionId, customerId, productId, fullName, streetAddress, city, department, postalCode}` | `Delivery` | 201 |
| `GET` | `/api/deliveries/:id` | — | `Delivery` | 200/404 |
| `GET` | `/api/health` | — | `{status: "ok", timestamp}` | 200 |

**Error responses** follow a consistent format:
```json
{ "statusCode": 400, "message": "Insufficient stock for requested quantity" }
```

---

## Data Model

### Entity Relationship Diagram

```
┌─────────────┐       ┌────────────────┐       ┌─────────────┐
│   Product   │       │  Transaction   │       │   Customer  │
├─────────────┤       ├────────────────┤       ├─────────────┤
│ id (PK)     │◄──┐   │ id (PK)        │       │ id (PK)     │
│ name        │   │   │ reference (UK) │       │ name        │
│ description │   │   │ product_id(FK) │───────│ email (UK)  │
│ price       │   │   │ quantity       │       │ phone       │
│ stock       │   │   │ total_amount   │       │ document_id │
│ image_url   │   │   │ base_fee       │       └──────┬──────┘
│ created_at  │   │   │ delivery_fee   │              │
│ updated_at  │   │   │ status (enum)  │              │
└─────────────┘   │   │ customer_email │              │
                  │   │ gateway_txn_id │              │
                  │   │ status_reason  │              │
                  │   │ created_at     │              │
                  │   │ updated_at     │              │
                  │   └───────┬────────┘              │
                  │           │                       │
                  │   ┌───────▼────────┐              │
                  │   │   Delivery     │              │
                  │   ├────────────────┤              │
                  └───│ product_id(FK) │              │
                      │ transaction_id │──────────────┘
                      │ customer_id(FK)│
                      │ full_name      │
                      │ street_address │
                      │ city           │
                      │ department     │
                      │ postal_code    │
                      │ created_at     │
                      └────────────────┘

Status enum: PENDING | APPROVED | DECLINED | ERROR
```

### Database Constraints
- `Transaction.reference` — unique index (idempotency key)
- `Customer.email` — unique index (upsert pattern)
- `Delivery.transaction_id` — unique (one delivery per transaction)
- `Product.stock` — atomic decrement with `WHERE stock >= quantity` (prevents negative)

---

## Setup (Local Development)

### Prerequisites

- Node.js >= 18
- PostgreSQL 15+ (or Docker: `docker run -p 5432:5432 -e POSTGRES_PASSWORD=pass -e POSTGRES_DB=app_paid postgres:15`)
- npm 9+

### Environment Variables

Create `backend/.env`:
```env
DATABASE_URL=postgresql://postgres:pass@localhost:5432/app_paid?schema=public
PAYMENT_GATEWAY_API_URL=https://api-sandbox.co.uat.wompi.dev/v1
PAYMENT_GATEWAY_PUBLIC_KEY=<your_pub_key>
PAYMENT_GATEWAY_PRIVATE_KEY=<your_prv_key>
PAYMENT_GATEWAY_INTEGRITY_KEY=<your_integrity_key>
PORT=3000
FRONTEND_URL=http://localhost:5173
BASE_FEE=5000
DELIVERY_FEE=10000
```

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:3000/api
VITE_GATEWAY_PUBLIC_KEY=<your_pub_key>
VITE_GATEWAY_API_URL=https://api-sandbox.co.uat.wompi.dev/v1
```

### Quick Start

```bash
# 1. Install dependencies (npm workspaces)
npm install

# 2. Setup database
cd backend
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed

# 3. Start backend (port 3000)
npm run start:dev

# 4. Start frontend (port 5173, proxies /api to backend)
cd ../frontend
npm run dev
```

---

## Testing

### Run Tests

```bash
# Backend (37 tests)
cd backend && npm test

# Frontend (59 tests)
cd frontend && npm test

# With coverage
cd backend && npm run test:cov
cd frontend && npm run test:cov
```

### Test Coverage Results

| Module | Suites | Tests | Coverage Target |
|--------|--------|-------|-----------------|
| Backend Domain | 3 | 20 | >80% |
| Backend Use Cases | 4 | 17 | >80% |
| Frontend Utils | 3 | 38 | >80% |
| Frontend Redux | 2 | 21 | >80% |
| **Total** | **12** | **96** | **>80%** |

### What's Tested

**Backend:**
- IntegrityService: SHA-256 generation + timing-safe validation
- Result type: Success/Failure creation + type guards
- AppError: All factory methods + error categories
- GetProductsUseCase: success + repository failure
- CreateTransactionUseCase: validation, product not found, insufficient stock, success, idempotency
- CreateCustomerUseCase: validation, create new, update existing (idempotent)
- CreateDeliveryUseCase: validation, postal code, transaction check, idempotent return, success

**Frontend:**
- Card validation: Luhn algorithm, brand detection (Visa/MC), expiry temporal check, CVV, cardholder name
- Delivery validation: postal code (6 digits), required field + max length
- Amount calculation: total computation, COP formatting, cents conversion
- Redux slices: all actions, state transitions, reset behavior, sensitive data clearing

---

## Key Design Decisions

### 1. Railway Oriented Programming (ROP)

Every use case returns `Result<T, AppError>`. Operations chain sequentially; the first failure short-circuits the entire pipeline.

```typescript
// Success path: validate → check stock → persist → sign
// Any failure: immediately returns Failure<AppError> to caller
async execute(input): Promise<Result<Output, AppError>> {
  if (!input.productId) return failure(AppError.validation(...));
  const product = await this.productRepo.findById(input.productId);
  if (!product) return failure(AppError.notFound(...));
  if (!product.hasStock(qty)) return failure(AppError.insufficientStock());
  // ... continue pipeline
  return success(output);
}
```

### 2. Atomic Stock Management

Stock decrement uses Prisma's conditional update to prevent race conditions:

```sql
UPDATE products SET stock = stock - :qty WHERE id = :id AND stock >= :qty
```

If the `WHERE` fails (concurrent purchase), no rows update and the operation returns `AppError.insufficientStock()`.

### 3. Resilience — State Persistence

Redux checkout state is persisted to `localStorage` on every step transition:
- 30-minute TTL (expired state is discarded)
- Structure validation on load (corrupted JSON resets to step 1)
- Card data (CVV, number) is **never** persisted (security)
- Terminal states (APPROVED/DECLINED/ERROR) clear persisted state

### 4. Retry Pattern (Payment Processing)

The payment flow implements retry with exponential backoff:
- Max 3 retries on gateway timeout/failure
- Polling mechanism for async payment status (5s intervals, max 12 attempts)
- After exhausting retries, transaction marked as ERROR and user redirected

### 5. Security (OWASP Aligned)

- **Helmet middleware**: X-Content-Type-Options, X-Frame-Options: DENY, HSTS
- **CORS**: Whitelist frontend origin only
- **Input sanitization**: class-validator decorators, max field length 1000 chars
- **CVV handling**: Never stored in DB, cleared from Redux/localStorage post-transaction
- **Card masking**: Only last 4 digits in any log output
- **HTTPS**: S3 website + gateway communication over TLS

### 6. Idempotent Operations

- **Transaction creation**: Same reference returns existing transaction (no duplicate charge)
- **Customer upsert**: Finds by email, updates if exists, creates if new
- **Delivery creation**: One per transaction_id (unique constraint)

---

## Deployment

### Current Deployment

| Component | Service | URL |
|-----------|---------|-----|
| Frontend | AWS S3 Static Website | http://app-paid-frontend-511417.s3-website-us-east-1.amazonaws.com |
| Backend | AWS EC2 (t3.micro) + PM2 | http://3.92.18.108:3000/api |
| Database | PostgreSQL (on EC2) | localhost:5432 (internal) |

### Infrastructure as Code (CDK)

Located in `infrastructure/`:
- S3 + CloudFront (HTTPS, edge caching, SPA routing)
- Lambda/ECS option for backend (serverless scaling)
- RDS PostgreSQL (private subnet, encrypted)
- VPC with public + isolated subnets

```bash
cd infrastructure && npm install
npx cdk bootstrap   # first time
npx cdk deploy --all
```

---

## Folder Structure

```
app-paid/
├── backend/                   # NestJS API
│   ├── prisma/                # Schema, migrations, seed
│   ├── src/
│   │   ├── domain/            # Core business logic
│   │   ├── application/       # Use cases (ROP)
│   │   └── infrastructure/    # Adapters, controllers, DTOs
│   └── package.json
├── frontend/                  # React SPA
│   ├── src/
│   │   ├── components/        # UI components
│   │   ├── pages/             # Route pages
│   │   ├── store/             # Redux
│   │   ├── services/          # API + Gateway + Persistence
│   │   └── utils/             # Validation + formatting
│   └── package.json
├── infrastructure/            # AWS CDK (TypeScript)
├── package.json               # Monorepo workspaces
├── tsconfig.base.json         # Shared TS config
└── README.md
```

---

## Branch Strategy

Feature branches with incremental PRs (simulates real team workflow):

| Branch | Feature |
|--------|---------|
| `feature/task-1-scaffolding` | Monorepo setup, configs |
| `feature/task-2-domain-layer` | Entities, ports, ROP types |
| `feature/task-3-application-layer` | Use cases with ROP |
| `feature/task-4-infrastructure-layer` | Prisma, controllers, DI |
| `feature/task-5-frontend-components` | UI, services, checkout flow |
| `feature/task-6-unit-tests` | 96 tests, >80% coverage |
| `feature/task-7-aws-infrastructure` | CDK IaC + deploy scripts |

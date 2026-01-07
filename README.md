# TradingApp 📈

A full-stack trading application built as a monorepo using Turborepo. This platform enables users to place market and limit orders, track positions, manage their wallet balance, and view real-time price data with interactive charts.

## 🏗️ Architecture

This project follows a microservices architecture with the following components:

### Apps

| App | Description |
|-----|-------------|
| **web** | Next.js 15 frontend with React 19, featuring interactive trading charts (Lightweight Charts), order management, and a responsive UI built with Radix UI & Tailwind CSS |
| **httpBackend** | Express.js REST API handling authentication, order placement, wallet management, and user operations |
| **wsServer** | WebSocket server for real-time price updates and live order notifications |
| **engine** | Trading engine that processes orders, manages order books, and calculates P&L |
| **pricePollar** | Service that polls external price feeds and distributes price data via Redis |

### Packages

| Package | Description |
|---------|-------------|
| **@repo/db** | Prisma ORM configuration with PostgreSQL database schema for users and orders |
| **@repo/redisclient** | Shared Redis client for pub/sub messaging between services |
| **@repo/timescaledb** | TimescaleDB integration for time-series price data storage |
| **@repo/types** | Shared TypeScript types and Zod validation schemas |
| **@repo/ui** | Shared React component library |
| **@repo/eslint-config** | Shared ESLint configurations |
| **@repo/typescript-config** | Shared TypeScript configurations |

## ✨ Features

- **Order Management**: Place Market and Limit orders with Long/Short positions
- **Wallet System**: Deposit funds and track balance
- **Real-time Updates**: Live price feeds via WebSocket connections
- **P&L Tracking**: Profit and loss calculation for open and closed positions
- **Risk Management**: Set Take Profit and Stop Loss levels on orders
- **Interactive Charts**: Real-time trading charts powered by Lightweight Charts
- **Authentication**: Secure user authentication with JWT tokens

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS, Radix UI, Zustand, React Hook Form
- **Backend**: Express.js, Node.js
- **Real-time**: WebSocket (ws)
- **Database**: PostgreSQL with Prisma ORM
- **Time-series**: TimescaleDB
- **Caching/Messaging**: Redis
- **Validation**: Zod
- **Build Tool**: Turborepo
- **Package Manager**: pnpm
- **Language**: TypeScript

## 📋 Prerequisites

- Node.js >= 18
- pnpm 9.0.0+
- PostgreSQL
- Redis
- TimescaleDB (optional, for price history)

## 🚀 Getting Started

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/SumitKumar777/TradingApp.git
   cd TradingApp
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   ```bash
   # Create .env files in respective apps/packages
   # Required variables:
   DATABASE_URL="postgresql://..."
   REDIS_URL="redis://..."
   JWT_SECRET="your-secret-key"
   ```

4. Generate Prisma client:
   ```bash
   cd packages/db
   pnpm prisma generate
   pnpm prisma db push
   ```

### Development

Run all apps and packages in development mode:
```bash
pnpm dev
```

Run a specific app:
```bash
# Run only the web frontend
pnpm dev --filter=web

# Run only the HTTP backend
pnpm dev --filter=@repo/httpbackend
```

### Build

Build all apps and packages:
```bash
pnpm build
```

### Linting

```bash
pnpm lint
```

### Type Checking

```bash
pnpm check-types
```

## 📁 Project Structure

```
TradingApp/
├── apps/
│   ├── web/              # Next.js frontend
│   ├── httpBackend/      # REST API server
│   ├── wsServer/         # WebSocket server
│   ├── engine/           # Trading engine
│   └── pricePollar/      # Price feed service
├── packages/
│   ├── db/               # Prisma database package
│   ├── redisClient/      # Redis client
│   ├── timescaledb/      # TimescaleDB integration
│   ├── types/            # Shared types & validation
│   ├── ui/               # UI component library
│   ├── eslint-config/    # ESLint configurations
│   └── typescript-config/# TypeScript configurations
├── turbo.json
├── package.json
└── pnpm-workspace.yaml
```

## 📊 Database Schema

The application uses the following main entities:

- **User**: Stores user credentials, email, and wallet balance
- **Orders**: Tracks all trading orders with status, P&L, entry/exit prices, and risk parameters

## 🔧 Configuration

### Turborepo

The project uses Turborepo for efficient builds with caching. See `turbo.json` for task configurations.

### Remote Caching

To enable remote caching with Vercel:
```bash
turbo login
turbo link
```

## 📄 License

ISC

## 👤 Author

Sumit Kumar

---

⭐ Star this repo if you find it useful!
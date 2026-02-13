# eKYC Onboarding - Fullstack Platform

A fullstack eKYC (electronic Know Your Customer) onboarding system with Expo React Native mobile app and Node.js/Express backend API.

## 🎯 Assessment Progress

### ✅ Milestone 1: Core End-to-End Flow (55-65 min)

#### Backend API (100% Complete) ✅
- ✅ Express server with TypeScript
- ✅ All API endpoints implemented:
  - `POST /v1/auth/login` - User authentication
  - `POST /v1/auth/refresh` - Token refresh
  - `GET /v1/me` - Get current user
  - `POST /v1/onboarding/submit` - Submit onboarding
  - `GET /v1/verification/status` - Get verification status
- ✅ JWT authentication with bcrypt password hashing
- ✅ In-memory data stores (Users, Sessions, Onboarding)
- ✅ Consistent error handling with error codes
- ✅ Auth middleware for protected routes
- ✅ **All 16 tests passing** (TDD approach)

#### Mobile App (Infrastructure Complete, UI In Progress) 🔄
**Completed:**
- ✅ Project setup with Expo, TypeScript, Jest
- ✅ Theme system (light/dark) with token-based styling
- ✅ API client (Axios) configured
- ✅ Zustand stores with persistence:
  - `authStore` - Auth with SecureStore
  - `themeStore` - Theme with AsyncStorage
  - `onboardingStore` - Draft with AsyncStorage
  - `verificationStore` - Status fetching
- ✅ Comprehensive TDD tests for stores
- ✅ App entry point with providers

**Remaining (see apps/mobile/README.md):**
- 🔄 Navigation (RootNavigator, AuthStack, MainStack, OnboardingStack)
- 🔄 Screens (Login, Home, Settings, 5 Onboarding steps)
- 🔄 Shared components (Button, Input, Card)

### 🔜 Milestone 2: Production-Ready Essentials (20-30 min)

To be implemented after M1 completes:
- Token refresh-then-retry interceptor
- Route guards
- Enhanced validation
- Structured logging with Winston
- Correlation IDs

### 🔜 Milestone 3: Async Verification + Polling (15-20 min)

To be implemented after M2:
- Async verification processing endpoint
- Polling with exponential backoff
- Terminal state handling

## 📦 Project Structure

```
ekyc-onboarding/
├── apps/
│   ├── api/              # Backend Express API (✅ Complete)
│   │   ├── src/
│   │   │   ├── middleware/    # Auth, Error handling
│   │   │   ├── routes/        # API routes
│   │   │   ├── services/      # Business logic
│   │   │   ├── repositories/  # In-memory storage
│   │   │   ├── types/         # TypeScript types
│   │   │   ├── app.ts         # Express app
│   │   │   └── server.ts      # Server entry
│   │   └── tests/             # 16 passing tests ✅
│   │
│   └── mobile/          # Mobile Expo app (🔄 In Progress)
│       ├── src/
│       │   ├── stores/        # ✅ Zustand stores
│       │   ├── services/      # ✅ API client
│       │   ├── theme/         # ✅ Theme system
│       │   ├── types/         # ✅ TypeScript types
│       │   ├── navigation/    # 🔄 To implement
│       │   ├── screens/       # 🔄 To implement
│       │   └── components/    # 🔄 To implement
│       └── App.tsx            # ✅ Entry point
│
├── docs/                      # System design documentation
└── package.json              # Workspace root
```

## 🚀 Quick Start

### Prerequisites
- Node.js >= 20.0.0
- npm >= 10.0.0
- Expo CLI (for mobile development)

### Installation

```bash
# Install all dependencies
npm install

# Or install individually
cd apps/api && npm install
cd apps/mobile && npm install
```

### Running the Backend API

```bash
cd apps/api
npm run dev
# Server runs on http://localhost:3000
```

#### API Endpoints
- **Health Check**: `GET /health`
- **Login**: `POST /v1/auth/login`
- **Refresh**: `POST /v1/auth/refresh`
- **Get User**: `GET /v1/me` (requires auth)
- **Submit Onboarding**: `POST /v1/onboarding/submit` (requires auth)
- **Get Status**: `GET /v1/verification/status` (requires auth)

#### Test User
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

### Running the Mobile App

```bash
cd apps/mobile
npx expo start

# Then:
# - Press 'i' for iOS simulator
# - Press 'a' for Android emulator  
# - Press 'w' for web browser
```

### Running Tests

```bash
# Backend tests (all passing ✅)
cd apps/api
npm test

# Expected output: 16 passed tests
# - 8 auth tests (login, refresh, /me)
# - 8 onboarding tests (submit, validation, status)

# Mobile tests (stores ready)
cd apps/mobile
npm test
```

## 🧪 Testing Strategy

### Backend (TDD Approach)
1. ✅ **Auth Tests** - Login, refresh, token validation
2. ✅ **Onboarding Tests** - Submit validation, field errors
3. ✅ **Integration Tests** - Full flow testing

### Mobile (TDD Approach)
1. ✅ **Auth Store Tests** - Login, logout, refresh
2. ✅ **Onboarding Store Tests** - Draft persistence, submission
3. 🔄 **Component Tests** - To be added with screens

## 🔑 Key Features

### Backend
- **JWT Authentication** - Access (15min) + Refresh (7 days) tokens
- **Secure Password Storage** - bcrypt with cost factor 10
- **In-Memory Storage** - Fast, no DB required for assessment
- **Consistent Error Format** - Stable error codes for mobile
- **Field-Level Validation** - Detailed error messages

### Mobile  
- **Zustand State Management** - Simple, TypeScript-first
- **Persistent Storage** - SecureStore (tokens), AsyncStorage (draft)
- **Theme System** - Token-based light/dark modes
- **Type Safety** - Full TypeScript coverage
- **Axios API Client** - Configured with interceptors

## 📚 Documentation

- **System Design**: See `docs/eKYC_System_Design_SUMMARY.md`
- **Implementation Plan**: See `.cursor/plans/`
- **Mobile Guide**: See `apps/mobile/README.md`
- **API Docs**: See `apps/api/README.md` (to be created)

## ✅ Completed Milestones

### Phase 0: Setup (Complete)
- ✅ Monorepo structure with npm workspaces
- ✅ TypeScript configuration for both apps
- ✅ Jest testing setup
- ✅ All dependencies installed

### Milestone 1: Backend (Complete)
- ✅ TDD tests written first
- ✅ Express server implementation
- ✅ All routes, services, repositories
- ✅ Auth middleware with JWT
- ✅ Error handling middleware
- ✅ **16/16 tests passing**

### Milestone 1: Mobile Infrastructure (Complete)
- ✅ TDD tests for stores
- ✅ Zustand stores with persistence
- ✅ API client with Axios
- ✅ Theme system implementation
- ✅ Type definitions

## 🎯 Next Steps

To complete Milestone 1:

1. **Implement Navigation** (~30 min)
   - RootNavigator with auth switching
   - AuthStack (Login)
   - MainStack (Home, Settings, Onboarding)

2. **Implement Core Screens** (~45 min)
   - LoginScreen with auth
   - HomeScreen with status
   - SettingsScreen with theme toggle
   - 5 Onboarding step screens

3. **Test End-to-End** (~15 min)
   - Login flow
   - Complete onboarding
   - Submit and verify status
   - Theme persistence

## 🛠️ Technology Stack

**Backend:**
- Node.js + Express
- TypeScript
- JWT + bcrypt
- Jest + Supertest
- Winston (for M2)

**Mobile:**
- Expo (React Native)
- TypeScript
- Zustand (state)
- React Navigation
- Axios
- Expo SecureStore
- AsyncStorage

## 📝 License

MIT

## 👥 Authors

Fullstack Engineer Assessment - eKYC Onboarding Platform

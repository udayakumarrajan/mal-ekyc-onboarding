# eKYC System Design - Quick Reference

> **Project**: Fullstack eKYC Onboarding Platform  
> **Stack**: React Native (Expo) + Node.js/Express + TypeScript  
> **Architecture**: Monorepo

## Overview

eKYC verification system with 5-step mobile onboarding, JWT authentication, and real-time status tracking

## System Architecture

### High-Level Architecture

```mermaid
graph TB
    subgraph MobileApp[Mobile App - Expo React Native]
        Screens[Screens Layer<br/>Login, Home, Onboarding, Settings]
        StateLayer[State Management<br/>Auth, Theme, Onboarding, Verification]
        StorageLayer[Storage Layer<br/>SecureStore, AsyncStorage]
        APIClient[API Client<br/>Axios with Interceptors]
    end
    
    subgraph BackendAPI[Backend API - Node Express]
        Routes[API Routes<br/>/auth, /me, /onboarding, /verification]
        Middleware[Middleware<br/>Auth, Validation, Error, Logger]
        Services[Business Logic<br/>Auth, Onboarding, Verification]
        DataStore[In-Memory Storage<br/>Users, Sessions, Drafts, Status]
    end
    
    Screens --> StateLayer
    StateLayer --> StorageLayer
    StateLayer --> APIClient
    APIClient -->|HTTP/JSON<br/>Bearer Token| Routes
    Routes --> Middleware
    Middleware --> Services
    Services --> DataStore
    
    style MobileApp fill:#e3f2fd
    style BackendAPI fill:#fff3e0
    style APIClient fill:#c8e6c9
    style Middleware fill:#ffccbc
```

### Backend Layered Architecture

```mermaid
graph LR
    subgraph PresentationLayer[Presentation Layer]
        Router[Express Router]
        ErrorHandler[Error Handler]
    end
    
    subgraph ApplicationLayer[Application Layer]
        AuthMW[Auth Middleware]
        ValidationMW[Validation]
        Controllers[Controllers]
    end
    
    subgraph DomainLayer[Domain Layer]
        AuthService[Auth Service]
        OnboardingService[Onboarding Service]
        VerificationService[Verification Service]
    end
    
    subgraph DataLayer[Data Layer]
        UserRepo[User Repository]
        SessionRepo[Session Repository]
        DraftRepo[Draft Repository]
    end
    
    Router --> AuthMW
    AuthMW --> ValidationMW
    ValidationMW --> Controllers
    Controllers --> AuthService
    Controllers --> OnboardingService
    Controllers --> VerificationService
    AuthService --> UserRepo
    AuthService --> SessionRepo
    OnboardingService --> DraftRepo
    VerificationService --> DraftRepo
    
    style PresentationLayer fill:#e1bee7
    style ApplicationLayer fill:#c5cae9
    style DomainLayer fill:#b2dfdb
    style DataLayer fill:#ffccbc
```

### Data Flow Architecture

```mermaid
flowchart LR
    User((User))
    
    subgraph Mobile[Mobile App]
        LoginForm[Login Form]
        OnboardingForm[Onboarding Forms]
        HomeDisplay[Home Display]
        
        subgraph MobileStores[Stores]
            AuthData[Auth Data]
            DraftData[Draft Data]
        end
        
        subgraph MobileStorage[Storage]
            SecureStore[SecureStore<br/>Tokens]
            AsyncStore[AsyncStorage<br/>Draft + Theme]
        end
    end
    
    subgraph Backend[Backend API]
        AuthEndpoint[/auth/login]
        SubmitEndpoint[/onboarding/submit]
        StatusEndpoint[/verification/status]
        MeEndpoint[/me]
        
        subgraph BackendStorage[In-Memory Storage]
            Users[(Users)]
            Sessions[(Sessions)]
            Drafts[(Drafts)]
            Statuses[(Verification<br/>Statuses)]
        end
    end
    
    User -->|Enter credentials| LoginForm
    LoginForm -->|Login| AuthEndpoint
    AuthEndpoint -->|Create| Sessions
    AuthEndpoint -->|Lookup| Users
    AuthEndpoint -->|Return tokens| AuthData
    AuthData -->|Store| SecureStore
    
    User -->|Fill forms| OnboardingForm
    OnboardingForm -->|Update| DraftData
    DraftData -->|Persist| AsyncStore
    DraftData -->|Submit| SubmitEndpoint
    SubmitEndpoint -->|Save| Drafts
    SubmitEndpoint -->|Update| Statuses
    
    HomeDisplay -->|Fetch| MeEndpoint
    HomeDisplay -->|Fetch| StatusEndpoint
    MeEndpoint -->|Get| Users
    StatusEndpoint -->|Get| Statuses
    
    style User fill:#90caf9
    style Mobile fill:#e3f2fd
    style Backend fill:#fff3e0
    style SecureStore fill:#ffccbc
    style AsyncStore fill:#d1c4e9
```

## API Endpoints

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/v1/auth/login` | POST | No | Login (returns JWT) |
| `/v1/auth/refresh` | POST | No | Refresh token |
| `/v1/me` | GET | Yes | User info |
| `/v1/onboarding/submit` | POST | Yes | Submit onboarding |
| `/v1/verification/status` | GET | Yes | Verification status |

## Mobile Flow

**Screens**: Login → Home → Onboarding (5 steps) → Settings

**Onboarding Steps**:
1. Profile (Name, DOB, Nationality)
2. Document (Type, Number)
3. Address (Line, City, Country)
4. Consents (Terms)
5. Review & Submit

## Data Models
```typescript
interface User {
  id: string;
  email: string;
  fullName: string;
}

interface Session {
  accessToken: string;        // Short-lived (15 min)
  refreshToken: string;       // Long-lived (7 days)
  expiresAt: string;
}
```

### Onboarding Draft
```typescript
interface OnboardingDraft {
  profile: {
    fullName: string;
    dateOfBirth: string;
    nationality: string;
  };
  document: {
    documentType: 'PASSPORT' | 'DRIVERS_LICENSE' | 'NATIONAL_ID';
    documentNumber: string;
  };
  address: {
    addressLine1: string;
    city: string;
    country: string;
  };
  consents: {
    termsAccepted: boolean;
  };
}
```

### Verification Status
```typescript
interface VerificationStatus {
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'APPROVED' | 'REJECTED' | 'MANUAL_REVIEW';
  updatedAt: string;
  details: {
    reasons: string[];
  };
}
```

## State Management (Zustand)

### State Architecture

```mermaid
graph TB
    subgraph Stores[Global Stores - Zustand]
        AuthStore[Auth Store<br/>status, user, session]
        ThemeStore[Theme Store<br/>theme, colors, spacing]
        OnboardingStore[Onboarding Store<br/>draft, currentStep, submissionState]
        VerificationStore[Verification Store<br/>status, loading, error]
    end
    
    subgraph Persistence[Persistence Layer]
        SecureStorage[Expo SecureStore<br/>Tokens]
        AsyncStorage[AsyncStorage<br/>Theme, Draft]
    end
    
    subgraph Screens[React Components]
        LoginScreen[Login Screen]
        HomeScreen[Home Screen]
        OnboardingScreens[Onboarding Screens]
        SettingsScreen[Settings Screen]
    end
    
    subgraph API[API Layer]
        APIClient[Axios Client<br/>with Interceptors]
    end
    
    LoginScreen --> AuthStore
    HomeScreen --> AuthStore
    HomeScreen --> VerificationStore
    OnboardingScreens --> OnboardingStore
    SettingsScreen --> ThemeStore
    
    AuthStore --> SecureStorage
    ThemeStore --> AsyncStorage
    OnboardingStore --> AsyncStorage
    
    AuthStore --> APIClient
    OnboardingStore --> APIClient
    VerificationStore --> APIClient
    
    style AuthStore fill:#ffcdd2
    style ThemeStore fill:#fff9c4
    style OnboardingStore fill:#c8e6c9
    style VerificationStore fill:#bbdefb
    style SecureStorage fill:#ffccbc
    style AsyncStorage fill:#d1c4e9
```

### Store Details

**Stores**:
- **Auth**: User, session, tokens (SecureStore)
  - Status: `logged_out | logging_in | logged_in | refreshing | expired`
  - Actions: `login()`, `logout()`, `refreshSession()`
  
- **Theme**: Light/dark mode (AsyncStorage)
  - Theme: `light | dark`
  - Actions: `toggleTheme()`, `setTheme()`
  
- **Onboarding**: Draft data, current step (AsyncStorage)
  - Draft: Profile, document, address, consents
  - Current Step: 0-4 (5 steps total)
  - Actions: `updateProfile()`, `updateDocument()`, `updateAddress()`, `updateConsents()`, `submitOnboarding()`
  
- **Verification**: Status from backend (no persistence)
  - Status: Cached from API
  - Actions: `fetchStatus()`, `clearStatus()`

### State Synchronization Pattern

```mermaid
sequenceDiagram
    participant LocalState
    participant Component
    participant GlobalStore
    participant Persistence
    
    Note over Component: User types in form
    Component->>LocalState: Update local state
    LocalState-->>Component: Immediate UI update
    
    Note over Component: User moves to next step
    Component->>GlobalStore: Sync to global store
    GlobalStore->>Persistence: Save to AsyncStorage
    Persistence-->>GlobalStore: Confirmed
    
    Note over Component: User returns later
    Component->>GlobalStore: Request data
    GlobalStore->>Persistence: Load from storage
    Persistence-->>GlobalStore: Draft data
    GlobalStore-->>Component: Hydrate UI
    Component->>LocalState: Initialize local state
```

## Key Flows

### 1. Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant LoginScreen
    participant AuthStore
    participant SecureStore
    participant API
    participant Backend
    
    User->>LoginScreen: Enter email/password
    LoginScreen->>AuthStore: login(email, password)
    AuthStore->>API: POST /v1/auth/login
    API->>Backend: Validate credentials
    
    alt Valid Credentials
        Backend-->>API: 200 OK {user, session}
        API-->>AuthStore: Success
        AuthStore->>SecureStore: Store tokens
        AuthStore-->>LoginScreen: Navigate to Home
        LoginScreen-->>User: Show Home Screen
    else Invalid Credentials
        Backend-->>API: 401 INVALID_CREDENTIALS
        API-->>AuthStore: Error
        AuthStore-->>LoginScreen: Show error
        LoginScreen-->>User: Display error message
    end
```

### 2. Token Refresh Flow (Automatic)

```mermaid
sequenceDiagram
    participant Component
    participant APIClient
    participant AuthStore
    participant SecureStore
    participant Backend
    
    Component->>APIClient: GET /v1/me
    APIClient->>Backend: Request with expired token
    Backend-->>APIClient: 401 TOKEN_EXPIRED
    
    Note over APIClient: Interceptor catches 401
    
    APIClient->>APIClient: Check if not retried
    APIClient->>AuthStore: refreshSession()
    AuthStore->>SecureStore: Get refresh token
    SecureStore-->>AuthStore: Refresh token
    AuthStore->>Backend: POST /v1/auth/refresh
    
    alt Refresh Success
        Backend-->>AuthStore: 200 OK {new session}
        AuthStore->>SecureStore: Update tokens
        AuthStore-->>APIClient: New access token
        APIClient->>Backend: Retry GET /v1/me
        Backend-->>APIClient: 200 OK {user}
        APIClient-->>Component: Success
    else Refresh Failed
        Backend-->>AuthStore: 401 TOKEN_INVALID
        AuthStore->>AuthStore: logout()
        AuthStore->>SecureStore: Clear tokens
        AuthStore-->>APIClient: Error
        APIClient-->>Component: Navigate to Login
    end
```

### 3. Onboarding Submission Flow

```mermaid
sequenceDiagram
    participant User
    participant UI
    participant OnboardingStore
    participant AsyncStorage
    participant APIClient
    participant Backend
    
    User->>UI: Fill Profile Step
    UI->>OnboardingStore: updateProfile(data)
    OnboardingStore->>AsyncStorage: Save draft
    AsyncStorage-->>OnboardingStore: Saved
    
    Note over User,UI: User completes steps 2-4
    
    User->>UI: Review & Submit (Step 5)
    UI->>OnboardingStore: submitOnboarding()
    OnboardingStore->>OnboardingStore: Set state: submitting
    OnboardingStore->>APIClient: POST /v1/onboarding/submit
    APIClient->>Backend: Validate draft
    
    alt Valid Data
        Backend->>Backend: Create submission
        Backend->>Backend: Set status: IN_PROGRESS
        Backend-->>APIClient: 200 OK {submissionId}
        APIClient-->>OnboardingStore: Success
        OnboardingStore->>AsyncStorage: Clear draft
        OnboardingStore->>OnboardingStore: clearDraft()
        OnboardingStore-->>UI: Navigate to Home
        UI-->>User: Show success message
    else Validation Error
        Backend-->>APIClient: 400 VALIDATION_ERROR
        APIClient-->>OnboardingStore: Field errors
        OnboardingStore-->>UI: Show errors
        UI-->>User: Display field-level errors
    else Token Expired
        Backend-->>APIClient: 401 TOKEN_EXPIRED
        Note over APIClient: Auto refresh & retry
        APIClient->>Backend: POST /auth/refresh
        Backend-->>APIClient: New tokens
        APIClient->>Backend: Retry submit
        Backend-->>APIClient: 200 OK
        APIClient-->>OnboardingStore: Success
    end
```

### 4. Home Screen Data Loading

```mermaid
sequenceDiagram
    participant User
    participant HomeScreen
    participant AuthStore
    participant VerificationStore
    participant API
    participant Backend
    
    User->>HomeScreen: Navigate to Home
    HomeScreen->>AuthStore: Get user data
    
    par Load User Info
        HomeScreen->>API: GET /v1/me
        API->>Backend: Verify token
        Backend-->>API: User data
        API-->>HomeScreen: {user}
    and Load Verification Status
        HomeScreen->>VerificationStore: fetchStatus()
        VerificationStore->>API: GET /v1/verification/status
        API->>Backend: Get status
        Backend-->>API: {status, updatedAt}
        API-->>VerificationStore: Status data
        VerificationStore-->>HomeScreen: Update UI
    end
    
    HomeScreen-->>User: Display user name & status
```

### 5. Mobile Navigation Flow

```mermaid
graph TB
    Login[Login Screen]
    Home[Home Screen]
    Settings[Settings Screen]
    Onboarding[Onboarding Navigator]
    
    Step1[Step 1: Profile<br/>Name, DOB, Nationality]
    Step2[Step 2: Document<br/>Type, Number]
    Step3[Step 3: Address<br/>Line, City, Country]
    Step4[Step 4: Consents<br/>Terms Acceptance]
    Step5[Step 5: Review & Submit]
    
    Login -->|Authenticated| Home
    Home -->|Session Expired| Login
    Home -->|Start/Resume| Onboarding
    Home -->|Navigate| Settings
    Settings -->|Navigate| Home
    
    Onboarding --> Step1
    Step1 -->|Next| Step2
    Step2 -->|Next| Step3
    Step2 -->|Back| Step1
    Step3 -->|Next| Step4
    Step3 -->|Back| Step2
    Step4 -->|Next| Step5
    Step4 -->|Back| Step3
    Step5 -->|Submit Success| Home
    Step5 -->|Back| Step4
    
    style Login fill:#ffcdd2
    style Home fill:#c8e6c9
    style Settings fill:#fff9c4
    style Onboarding fill:#b3e5fc
    style Step5 fill:#a5d6a7
```

## Error Handling

### Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": {
      "fieldErrors": {
        "profile.fullName": "Required",
        "document.documentNumber": "Invalid format"
      }
    }
  }
}
```

### Error Codes

- `VALIDATION_ERROR` (400) - Invalid input with field errors
- `INVALID_CREDENTIALS` (401) - Wrong login
- `TOKEN_EXPIRED` (401) - Refresh needed
- `TOKEN_INVALID` (401) - Re-login required
- `INTERNAL_ERROR` (500) - Server error

### Error Flow Diagram

```mermaid
graph TD
    Request[API Request]
    
    Request --> CheckAuth{Auth<br/>Required?}
    CheckAuth -->|No| ProcessRequest[Process Request]
    CheckAuth -->|Yes| ValidateToken{Token<br/>Valid?}
    
    ValidateToken -->|Invalid| Return401[401 TOKEN_INVALID]
    ValidateToken -->|Expired| Return401Exp[401 TOKEN_EXPIRED]
    ValidateToken -->|Valid| ProcessRequest
    
    ProcessRequest --> Validate{Validate<br/>Input}
    Validate -->|Invalid| Return400[400 VALIDATION_ERROR<br/>with fieldErrors]
    Validate -->|Valid| BusinessLogic[Execute Business Logic]
    
    BusinessLogic --> CheckError{Error?}
    CheckError -->|No| Return200[200 OK<br/>with data]
    CheckError -->|Business Error| Return400Custom[400 with error code]
    CheckError -->|Server Error| Return500[500 INTERNAL_ERROR]
    
    Return401 --> ErrorMiddleware[Error Middleware]
    Return401Exp --> ErrorMiddleware
    Return400 --> ErrorMiddleware
    Return400Custom --> ErrorMiddleware
    Return500 --> ErrorMiddleware
    Return200 --> Client[Client]
    
    ErrorMiddleware --> FormatError[Format Error Response]
    FormatError --> LogError[Log Error]
    LogError --> SanitizePII[Remove PII/Stack]
    SanitizePII --> Client
    
    style Return200 fill:#c8e6c9
    style Return400 fill:#fff9c4
    style Return401 fill:#ffccbc
    style Return401Exp fill:#ffccbc
    style Return500 fill:#ffcdd2
    style ErrorMiddleware fill:#e1bee7
```

## Security

### Token Lifecycle & Security Flow

```mermaid
sequenceDiagram
    participant User
    participant Mobile
    participant SecureStore
    participant Backend
    
    Note over User,Backend: Login Phase
    User->>Mobile: Login with credentials
    Mobile->>Backend: POST /auth/login
    Backend->>Backend: Verify password (bcrypt)
    Backend->>Backend: Generate JWT tokens
    Note right of Backend: Access: 15 min<br/>Refresh: 7 days
    Backend-->>Mobile: Return tokens
    Mobile->>SecureStore: Store tokens (encrypted)
    
    Note over User,Backend: Active Session
    Mobile->>SecureStore: Get access token
    SecureStore-->>Mobile: Token
    Mobile->>Backend: API call with Bearer token
    Backend->>Backend: Verify token signature
    Backend->>Backend: Check expiry
    Backend-->>Mobile: Protected data
    
    Note over User,Backend: Token Expired
    Mobile->>Backend: API call
    Backend->>Backend: Token expired
    Backend-->>Mobile: 401 TOKEN_EXPIRED
    Mobile->>SecureStore: Get refresh token
    Mobile->>Backend: POST /auth/refresh
    Backend->>Backend: Verify refresh token
    Backend->>Backend: Generate new access token
    Backend-->>Mobile: New tokens
    Mobile->>SecureStore: Update tokens
    
    Note over User,Backend: Logout
    User->>Mobile: Logout
    Mobile->>SecureStore: Delete tokens
    Mobile->>Mobile: Clear all stores
    Mobile-->>User: Redirect to Login
```

### Security Architecture

```mermaid
graph LR
    subgraph Auth[Authentication]
        A1[Password Hashing<br/>bcrypt cost: 10]
        A2[JWT Signing<br/>HS256]
        A3[Token Expiry<br/>15min / 7days]
    end
    
    subgraph Storage[Data Storage]
        S1[Secure Token Storage<br/>SecureStore]
        S2[Encrypted at Rest]
        S3[Clear on Logout]
    end
    
    subgraph Transport[Data in Transit]
        T1[HTTPS Only]
        T2[Bearer Token Auth]
        T3[No Tokens in URL]
    end
    
    subgraph Validation[Input Validation]
        V1[Server-Side Checks]
        V2[Client-Side Preview]
        V3[Sanitize Inputs]
    end
    
    subgraph Monitoring[Monitoring]
        M1[Log Correlation IDs]
        M2[No PII in Logs]
        M3[Error Tracking]
    end
    
    style Auth fill:#c8e6c9
    style Storage fill:#fff9c4
    style Transport fill:#ffccbc
    style Validation fill:#b3e5fc
    style Monitoring fill:#f8bbd0
```

### Security Best Practices

**Tokens**:
- Access: 15 min (SecureStore)
- Refresh: 7 days (SecureStore)
- Never logged in console or errors
- Cleared on logout

**Backend**: 
- ✅ Bcrypt passwords (cost factor: 10)
- ✅ Server-side validation (never trust client)
- ✅ No stack traces to client
- ✅ Helmet.js for HTTP security headers
- ✅ Correlation IDs for tracing
- ✅ Sanitize PII from logs

**Mobile**: 
- ✅ SecureStore for tokens (encrypted)
- ✅ AsyncStorage for non-sensitive data
- ✅ Route guards for protected screens
- ✅ Clear sensitive data on logout
- ✅ Validate inputs before API calls

## Tech Stack

**Backend**: Node.js, Express, JWT, bcrypt, express-validator, winston, jest  
**Mobile**: Expo (React Native), React Navigation, Zustand, React Hook Form + Zod, Axios, SecureStore

## Project Structure

### Component Architecture

```mermaid
graph TB
    subgraph App[App Root]
        Navigator[App Navigator<br/>React Navigation]
    end
    
    subgraph UnAuthStack[Unauthenticated Stack]
        Login[Login Screen]
        LoginForm[Login Form Component]
    end
    
    subgraph AuthStack[Authenticated Stack - Bottom Tabs]
        Home[Home Screen]
        Settings[Settings Screen]
        OnboardingNav[Onboarding Navigator]
    end
    
    subgraph OnboardingStack[Onboarding Stack]
        direction LR
        Profile[Profile Step]
        Document[Document Step]
        Address[Address Step]
        Consents[Consents Step]
        Review[Review Step]
    end
    
    subgraph SharedComponents[Shared Components]
        Button[Button]
        Input[Input Field]
        Card[Card]
        Loader[Loading Spinner]
        ErrorMsg[Error Message]
    end
    
    subgraph ProtectedComponents[Protected Components]
        RouteGuard[Route Guard HOC]
        ProtectedRoute[Protected Route]
    end
    
    Navigator --> UnAuthStack
    Navigator --> AuthStack
    
    Login --> LoginForm
    LoginForm --> Input
    LoginForm --> Button
    
    OnboardingNav --> OnboardingStack
    Profile --> Input
    Document --> Input
    Address --> Input
    Consents --> Input
    Review --> Card
    
    Home --> Card
    Home --> Loader
    Settings --> Button
    
    AuthStack --> RouteGuard
    RouteGuard --> ProtectedRoute
    
    style Navigator fill:#90caf9
    style UnAuthStack fill:#ffcdd2
    style AuthStack fill:#c8e6c9
    style OnboardingStack fill:#fff9c4
    style SharedComponents fill:#e1bee7
    style ProtectedComponents fill:#ffccbc
```

### Directory Structure

```
ekyc-onboarding/
├── apps/
│   ├── api/               # Backend (Express)
│   │   ├── src/
│   │   │   ├── server.ts
│   │   │   ├── app.ts
│   │   │   ├── middleware/
│   │   │   │   ├── auth.middleware.ts
│   │   │   │   ├── validation.middleware.ts
│   │   │   │   └── error.middleware.ts
│   │   │   ├── routes/
│   │   │   │   ├── auth.routes.ts
│   │   │   │   ├── user.routes.ts
│   │   │   │   ├── onboarding.routes.ts
│   │   │   │   └── verification.routes.ts
│   │   │   ├── services/
│   │   │   │   ├── auth.service.ts
│   │   │   │   └── onboarding.service.ts
│   │   │   └── repositories/
│   │   │       ├── user.repository.ts
│   │   │       ├── session.repository.ts
│   │   │       └── onboarding.repository.ts
│   │   └── tests/
│   │
│   └── mobile/            # Mobile (Expo)
│       ├── src/
│       │   ├── App.tsx
│       │   ├── screens/
│       │   │   ├── LoginScreen.tsx
│       │   │   ├── HomeScreen.tsx
│       │   │   ├── OnboardingScreen.tsx
│       │   │   └── SettingsScreen.tsx
│       │   ├── components/
│       │   │   ├── common/
│       │   │   └── onboarding/
│       │   ├── stores/
│       │   │   ├── authStore.ts
│       │   │   ├── themeStore.ts
│       │   │   ├── onboardingStore.ts
│       │   │   └── verificationStore.ts
│       │   ├── services/
│       │   │   └── api/
│       │   │       └── client.ts
│       │   └── theme/
│       └── tests/
│
├── package.json
└── README.md
```

## Implementation Plan

### Implementation Timeline

```mermaid
gantt
    title eKYC Implementation Timeline (90 minutes)
    dateFormat mm
    axisFormat %M min
    
    section Setup
    Init Monorepo           :milestone, m1, 00, 0m
    Install Dependencies    :a1, 00, 10m
    TypeScript Config       :a2, after a1, 5m
    
    section Backend
    Express Server          :b1, after a2, 10m
    Auth Routes             :b2, after b1, 15m
    Validation Middleware   :b3, after b2, 10m
    
    section Mobile
    Navigation Setup        :c1, after a2, 10m
    Auth Store & Login      :c2, after c1, 15m
    Onboarding Screens      :c3, after c2, 20m
    Theme Implementation    :c4, after c3, 10m
    
    section Integration
    Connect API             :milestone, m2, after c4, 0m
    End-to-End Test         :d1, after m2, 10m
    
    section Production
    Error Handling          :milestone, m3, after d1, 0m
    Refresh-Retry Logic     :e1, after m3, 10m
    Logging & Tests         :e2, after e1, 15m
    
    section Optional
    Advanced Feature        :f1, after e2, 15m
```

### Milestone Breakdown

**Phase 1 - Core Flow** (55-65 min):

1. **Setup** (10 min)
   - Init monorepo
   - Install dependencies
   - Setup TypeScript configs

2. **Backend** (20 min)
   - Express server with routes
   - In-memory storage
   - Auth middleware
   - Basic validation

3. **Mobile** (25 min)
   - Navigation setup
   - Auth store + Login screen
   - Onboarding screens (5 steps)
   - Home screen with status
   - Settings with theme toggle

4. **Integration** (10 min)
   - Connect mobile to API
   - Test end-to-end flow

**Phase 2 - Production Ready** (20-30 min):

1. **Backend** (10 min)
   - Centralized validation
   - Consistent error format
   - Structured logging
   - Request correlation IDs

2. **Mobile** (10 min)
   - Token refresh-then-retry
   - Route guards
   - Session expiry handling
   - Field-level error display

3. **Testing** (10 min)
   - Backend: Auth flow test
   - Backend: Validation error test
   - Mobile: Refresh-retry test
   - Mobile: Draft persistence test

**Phase 3 - Advanced** (Optional):

Pick ONE if time permits:
- **Option A**: Idempotency for submit
- **Option B**: Async verification + polling
- **Option C**: Offline queue
- **Option D**: OpenAPI spec + typed client

## Testing

### Test Architecture

```mermaid
graph TB
    subgraph BackendTests[Backend Tests]
        direction TB
        BUnit[Unit Tests<br/>Services, Middleware, Utils]
        BIntegration[Integration Tests<br/>API Endpoints]
        
        BUnit --> BServices[Auth Service<br/>Validation Logic<br/>Token Utils]
        BIntegration --> BEndpoints[Login Flow<br/>Submit Validation<br/>Token Refresh]
    end
    
    subgraph MobileTests[Mobile Tests]
        direction TB
        MUnit[Unit Tests<br/>Stores, Utils, Helpers]
        MIntegration[Integration Tests<br/>Store + API]
        MComponent[Component Tests<br/>Screen Rendering]
        
        MUnit --> MStores[Auth Store<br/>Onboarding Store<br/>Theme Store]
        MIntegration --> MFlows[Refresh-Retry<br/>Draft Persistence<br/>State Sync]
        MComponent --> MScreens[Login Screen<br/>Onboarding Steps]
    end
    
    subgraph E2ETests[End-to-End Tests - Optional]
        E2EFlow[Complete User Flows<br/>Login → Onboarding → Submit]
    end
    
    BackendTests -.->|API Contract| MobileTests
    MobileTests -.->|Full Flow| E2ETests
    
    style BackendTests fill:#fff3e0
    style MobileTests fill:#e3f2fd
    style E2ETests fill:#f3e5f5
    style BIntegration fill:#a5d6a7
    style MIntegration fill:#a5d6a7
```

### Backend Tests (Jest + Supertest)

```typescript
// Auth flow test
test('login and access protected route', async () => {
  const login = await POST('/v1/auth/login');
  expect(login.status).toBe(200);
  
  const me = await GET('/v1/me', { token: login.body.session.accessToken });
  expect(me.status).toBe(200);
});

// Validation test
test('submit returns field errors', async () => {
  const res = await POST('/v1/onboarding/submit', { draft: { profile: {} } });
  expect(res.status).toBe(400);
  expect(res.body.error.code).toBe('VALIDATION_ERROR');
  expect(res.body.error.details.fieldErrors).toBeDefined();
});
```

### Mobile Tests (Jest + React Native Testing Library)

```typescript
// Refresh-then-retry test
test('should refresh token and retry on 401', async () => {
  mockAPI.onGet('/v1/me').replyOnce(401);
  mockAPI.onPost('/v1/auth/refresh').replyOnce(200, { session: newTokens });
  mockAPI.onGet('/v1/me').replyOnce(200, { user });
  
  const result = await apiClient.get('/v1/me');
  expect(result.data.user).toEqual(user);
});

// Draft persistence test
test('should persist and restore draft', async () => {
  store.updateProfile({ fullName: 'John' });
  await wait(100);
  
  store.clearDraft();
  await store.loadPersistedDraft();
  
  expect(store.draft.profile.fullName).toBe('John');
});
```

## Design Decisions

| Component | Choice | Why |
|-----------|--------|-----|
| State | Zustand | Simple, TypeScript-first |
| Forms | React Hook Form + Zod | Type-safe validation |
| HTTP | Axios | Interceptor for auto-refresh |
| Storage | In-Memory Maps | Fast, no DB setup |
| Tokens | JWT (15min + 7d refresh) | Stateless, standard |

## Quick Start

```bash
# Backend
cd apps/api && npm install && npm run dev  # :3000

# Mobile (separate terminal)
cd apps/mobile && npm install && npx expo start
```

---

**Version**: 1.0 | **Updated**: Feb 2026

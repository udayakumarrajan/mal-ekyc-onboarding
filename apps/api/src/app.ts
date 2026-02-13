import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import onboardingRoutes from './routes/onboarding.routes';
import verificationRoutes from './routes/verification.routes';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { correlationIdMiddleware } from './middleware/correlationId.middleware';
import { loggingMiddleware } from './middleware/logging.middleware';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Correlation ID and logging (early in the middleware chain)
app.use(correlationIdMiddleware);
app.use(loggingMiddleware);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/v1/auth', authRoutes);
app.use('/v1', userRoutes);
app.use('/v1/onboarding', onboardingRoutes);
app.use('/v1/verification', verificationRoutes);

// Error handlers (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

export default app;

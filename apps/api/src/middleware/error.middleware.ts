import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error('Error occurred', {
    error: err.message,
    stack: err.stack,
    correlationId: req.correlationId,
    method: req.method,
    url: req.url,
  });

  // Default error
  let statusCode = 500;
  let errorResponse = {
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      details: {},
    },
  };

  // Handle specific error types
  if (err.statusCode) {
    statusCode = err.statusCode;
  }

  if (err.code) {
    errorResponse.error.code = err.code;
  }

  if (err.message) {
    errorResponse.error.message = err.message;
  }

  if (err.details) {
    errorResponse.error.details = err.details;
  }


  res.status(statusCode).json(errorResponse);
};

export const notFoundHandler = (req: Request, res: Response): void => {
  logger.warn('Route not found', {
    method: req.method,
    url: req.url,
    correlationId: req.correlationId,
  });

  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
};

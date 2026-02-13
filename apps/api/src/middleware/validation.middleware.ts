import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

// Validation middleware to process express-validator results
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const fieldErrors: Record<string, string> = {};
    
    errors.array().forEach((error) => {
      if (error.type === 'field') {
        // Remove 'draft.' prefix for onboarding field errors
        const fieldName = error.path.startsWith('draft.') 
          ? error.path.substring(6) 
          : error.path;
        fieldErrors[fieldName] = error.msg;
      }
    });

    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: {
          fieldErrors,
        },
      },
    });
    return;
  }
  
  next();
};

// Login validation rules
export const validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format'),
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors,
];

// Refresh token validation rules
export const validateRefresh = [
  body('refreshToken')
    .trim()
    .notEmpty()
    .withMessage('Refresh token is required'),
  handleValidationErrors,
];

// Onboarding submission validation rules
export const validateOnboardingSubmit = [
  // Profile validation
  body('draft.profile.fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required'),
  body('draft.profile.dateOfBirth')
    .trim()
    .notEmpty()
    .withMessage('Date of birth is required'),
  body('draft.profile.nationality')
    .trim()
    .notEmpty()
    .withMessage('Nationality is required'),
  
  // Document validation
  body('draft.document.documentType')
    .trim()
    .notEmpty()
    .withMessage('Document type is required')
    .isIn(['PASSPORT', 'DRIVERS_LICENSE', 'NATIONAL_ID'])
    .withMessage('Invalid document type'),
  body('draft.document.documentNumber')
    .trim()
    .notEmpty()
    .withMessage('Document number is required'),
  
  // Address validation
  body('draft.address.addressLine1')
    .trim()
    .notEmpty()
    .withMessage('Address line 1 is required'),
  body('draft.address.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  body('draft.address.country')
    .trim()
    .notEmpty()
    .withMessage('Country is required'),
  
  // Consents validation
  body('draft.consents.termsAccepted')
    .isBoolean()
    .withMessage('Terms acceptance must be a boolean')
    .equals('true')
    .withMessage('You must accept the terms'),
  
  handleValidationErrors,
];

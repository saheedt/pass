import { ValidationError } from 'express-validator';

export class RequestValidationError extends Error { 
  constructor(public errors: ValidationError[]) {
    super();
    // Required as a built-in class is being extended
    Object.setPrototypeOf(this, RequestValidationError.prototype);
  }
};
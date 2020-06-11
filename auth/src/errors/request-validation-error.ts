import { ValidationError } from 'express-validator';
import { CustomError } from './custom-errors';

export class RequestValidationError extends CustomError { 
  statusCode = 400;
  constructor(public errors: ValidationError[]) {
    super('Invalid request parameters');
    // Required as a built-in class is being extended
    Object.setPrototypeOf(this, RequestValidationError.prototype);
  }

  serializeErrors() {
    return this.errors.map(error => {
      return { message: error.msg, field: error.param };
    });
  }
};
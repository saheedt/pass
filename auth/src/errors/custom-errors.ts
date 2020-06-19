export abstract class CustomError extends Error { 
  abstract statusCode: number;
  constructor(messaage: string) {
    super(messaage);
    Object.setPrototypeOf(this, CustomError.prototype);
  }

  abstract serializeErrors(): { message: string, field?: string }[]
  
}
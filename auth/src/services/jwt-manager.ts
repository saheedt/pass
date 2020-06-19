import jwt from 'jsonwebtoken';
import { BadRequestError } from '../errors/bad-request-error';

export class JwtManager {
  static generateToken(payload: string | object | Buffer, expiry='12 weeks'): string {
    try {
      return jwt.sign(payload, process.env.JWT_SECRET!);
    } catch (error) {
      throw new BadRequestError(error.toString());
    }
  }

  static verifyToken(token: string) : string | object {
    try {
      return jwt.verify(token, process.env.JWT_SECRET!);
    } catch (error) {
      throw new BadRequestError(error.toString());
    }
  }
}

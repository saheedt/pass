import express, { Request, Response } from 'express';
import { body } from 'express-validator';

import { PasswordManager } from '../services/password-manager';
import { JwtManager } from '../services/jwt-manager';
import { BadRequestError } from '../errors/bad-request-error';
import { NotFoundError } from '../errors/not-found-error';
import { User } from '../db/models/user';
import { validateRequest } from '../middlewares/validate-request';

const router = express.Router();

router.post('/api/v1/users/signin', [
  body('email')
    .isEmail()
    .withMessage('Email must be valid'),
  body('password')
    .trim()
    .notEmpty()
    .withMessage('You must supply a password')
],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      throw new NotFoundError('User not found');
    }

    const passwordMadtch = await PasswordManager.compare(existingUser.password, password);
    if (!passwordMadtch) {
      throw new BadRequestError('Invalid credentials');
    }

    const token = JwtManager.generateToken({ id: existingUser.id, email: existingUser.email });
    // @ts-ignore
    req.session = {
      jwt: token
    };
    res.status(200).send(existingUser);
});

export { router as signInRouter };

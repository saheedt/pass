import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { JwtManager } from '../services/jwt-manager';

import { validateRequest } from '../middlewares/validate-request';
import { User } from '../db/models/user';
import { BadRequestError } from '../errors/bad-request-error';

const router = express.Router();

router.post('/api/v1/users/signup',
[
  body('email')
    .isEmail()
    .withMessage('Email must be valid'),
  body('password')
    .trim()
    .isLength({ min: 6 })
    .withMessage('Password must be atleast 6 characters long')
  ],
validateRequest,
async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new BadRequestError('User already exists');
  }
  const user = User.build({ email, password });
  await user.save();

  const token = JwtManager.generateToken({
    id: user.id,
    email: user.email
  });
  // @ts-ignore
  req.session = { jwt: token };
  res.status(201).send(user);
});

export { router as signUpRouter };

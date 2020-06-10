import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { RequestValidationError } from '../errors/request-validation-error';
import { DatabaseConnectionError } from '../errors/database-connection-error';

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
(req: Request, res: Response) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new RequestValidationError(errors.array());
    // return res.status(400).send(errors.array());
  }

  const { email, password } = req.body;

  console.log('creating a user...');
  // res.status(200).send({ user: `user ${email} was created!` });
  throw new DatabaseConnectionError();
});

export { router as signUpRouter };

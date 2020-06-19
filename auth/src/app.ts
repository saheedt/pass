import express, { Request, Response } from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';

import { currentUserRouter } from './routes/current-user';
import { signInRouter } from './routes/signin';
import { signOutRouter } from './routes/signout';
import { signUpRouter } from './routes/signup';

import { errorHandler } from './middlewares/error-handler';
import { RouteNotFoundError } from './errors/route-not-found-error';

const app = express();
// tells express to trust proxy as
// service is behind ngix ingress proxy
app.set('trust proxy', true);
app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test'
  })
);

app.use(currentUserRouter);
app.use(signInRouter);
app.use(signOutRouter);
app.use(signUpRouter);

app.all('*', (req: Request, res: Response) => {
  throw new RouteNotFoundError();
});

app.use(errorHandler);

export { app };

import express, { Request, Response } from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';

import { errorHandler, RouteNotFoundError, currentUser } from '@saheedpass/common';

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
app.use(currentUser);

app.all('*', (req: Request, res: Response) => {
  throw new RouteNotFoundError();
});

app.use(errorHandler);

export { app };

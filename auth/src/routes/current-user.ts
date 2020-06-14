import express, { Request, Response } from 'express';

import { JwtManager } from '../services/jwt-manager';

const router = express.Router();

router.get('/api/v1/users/currentuser', (req: Request, res: Response)=> {
  if (!req.session?.jwt) {
    return res.send({ currentUser: null });
  }

  try {
    const payload = JwtManager.verifyToken(req.session.jwt);
    res.status(200).send({ currentUser: payload });
  } catch (error) {
    res.send({ currentUser: null });
  }

});

export { router as currentUserRouter };

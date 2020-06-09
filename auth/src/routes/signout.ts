import express, { Request, Response } from 'express';

const router = express.Router();

router.post('/api/v1/users/signout', (req: Request, res: Response)=> {
  res.send('Hi there!!!!');
});

export { router as signOutRouter };

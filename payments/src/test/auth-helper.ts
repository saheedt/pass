import mongoose from 'mongoose';
import { JwtManager } from '@saheedpass/common';

export const getCookie = (id?: string) => {
  // create payload
  const payload = {
    id: id || new mongoose.Types.ObjectId().toHexString(),
    email: 'test@test.com',
    password: 'password'
  };

  // create JWT!
  const token = JwtManager.generateToken(payload);

  //  Encode JSON session object to base64
  const base64 = Buffer.from(JSON.stringify({ jwt: token })).toString('base64');

  return [`express:sess=${base64}`];
};

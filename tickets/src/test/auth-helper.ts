import request from 'supertest';
import { JwtManager } from '@saheedpass/common';
import { app } from '../app';

export const getCookie = () => {
  // create payload
  const payload = {
    id: 'habkjabkja',
    email: 'test@test.com',
    password: 'password'
  };

  // create JWT!
  const token = JwtManager.generateToken(payload);

  //  Encode JSON session object to base64
  const base64 = Buffer.from(JSON.stringify({ jwt: token })).toString('base64');

  return [`express:sess=${base64}`];
};
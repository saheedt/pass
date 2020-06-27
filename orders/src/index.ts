import mongoose from 'mongoose';

import { app } from './app';
import { natsClientWrapper } from './nats-client-wrapper';

const start = async () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET must be defined.');
  }
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI must be defined.');
  }
  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error('NATS_CLUSTER_ID must be defined.');
  }
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error('NATS_CLIENT_ID must be defined.');
  }
  if (!process.env.NATS_URL) {
    throw new Error('NATS_URL must be defined.');
  }
  if (!process.env.EXPIRATION_WINDOW_SECONDS) {
    throw new Error('EXPIRATION_WINDOW_SECONDS must be defined.');
  }
  try {
    await natsClientWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    );
    natsClientWrapper.client.on('close', () => {
      console.log('NATS connection closed!');
      process.exit();
    });
    process.on('SIGINT', () => natsClientWrapper.client.close());
    process.on('SIGINT', () => natsClientWrapper.client.close());

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    });
    console.log('connected to mongoDb');
  } catch (err) {
    console.error(err);
  }
};
app.listen(3000, () => {
  console.log('Listening on Port 3000!!!'); 
});

start();
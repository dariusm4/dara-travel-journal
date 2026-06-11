import 'dotenv/config';

import cors from 'cors';
import express from 'express';
import { networkInterfaces } from 'node:os';

import authRouter from './routes/auth';
import entriesRouter from './routes/entries';
import photosRouter from './routes/photos';
import tripsRouter from './routes/trips';

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/', (_req, res) => {
  res.json({ ok: true, service: 'dara' });
});

app.use('/auth', authRouter);
app.use('/trips/:tripId/entries', entriesRouter);
app.use('/trips', tripsRouter);
app.use('/', photosRouter);

const PORT = Number(process.env.PORT ?? 4000);
app.listen(PORT, '0.0.0.0', () => {
  const lan = Object.values(networkInterfaces())
    .flat()
    .filter((n) => !!n && n.family === 'IPv4' && !n.internal)
    .map((n) => `http://${n!.address}:${PORT}`);
  console.log(`Dara server listening on http://localhost:${PORT}`);
  for (const url of lan) console.log(`  LAN: ${url}`);
});

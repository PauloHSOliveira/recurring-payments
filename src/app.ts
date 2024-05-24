import express from 'express';
import bodyParser from 'body-parser';
import paymentRoutes from './routes/paymentRoutes';
import limiter from './middleware/rateLimiter';
import logger from './middleware/logger';

const app = express();
const PORT = process.env.PORT || 3000;

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
});

app.use(limiter);

app.use('/api/payments/webhook', bodyParser.raw({ type: '*/*' }));
app.use(bodyParser.json());

app.use('/api/payments', paymentRoutes);

// eslint-disable-next-line @typescript-eslint/no-explicit-any

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});

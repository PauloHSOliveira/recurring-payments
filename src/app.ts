import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import paymentRoutes from './routes/paymentRoutes';
import limiter from './middleware/rateLimiter';
import logger from './middleware/logger';
import { swaggerSpec } from './config/swagger';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(helmet());

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
});

app.use(limiter);

app.use('/api/payments/webhook', bodyParser.raw({ type: '*/*' }));
app.use(bodyParser.json());

app.use('/api/payments', paymentRoutes);

app.use(`/api-docs`, swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});

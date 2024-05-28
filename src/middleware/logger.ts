import winston from 'winston';
import { loggerConfig, errorTransport } from '../config/loggerConfig';

const logger = winston.createLogger(loggerConfig);

logger.add(errorTransport);

export default logger;

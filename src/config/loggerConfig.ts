import winston from 'winston';
import 'winston-daily-rotate-file';

const { combine, timestamp, printf, colorize, label } = winston.format;

const myFormat = printf(({ label, level, message, timestamp }) => {
  return `${label} ${timestamp} ${level}: ${message}`;
});

const loggerConfig = {
  level: 'info', // Nível de log padrão
  format: combine(
    colorize({
      all: true,
    }),
    label({ label: '[LOGGER]' }),
    timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    myFormat,
  ),
  transports: [
    // Console transport para logar no console
    new winston.transports.Console(),
    // Arquivo de log diário para registrar todos os logs
    new winston.transports.DailyRotateFile({ filename: 'logs/%DATE%.log', datePattern: 'YYYY-MM-DD' }),
  ],
};

const errorTransport = new winston.transports.DailyRotateFile({
  filename: 'logs/error-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  level: 'error', // Defina o nível de log para 'error'
});

export { loggerConfig, errorTransport };

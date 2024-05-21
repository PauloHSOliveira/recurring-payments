import { Response, Request, NextFunction } from 'express';
import getRawBody from 'raw-body';

const verifyWebhook = (req: Request, res: Response, next: NextFunction) => {
  getRawBody(
    req,
    {
      length: req.headers['content-length'],
      limit: '1mb',
      encoding: req.headers['content-type']?.includes('application/json') ? 'utf-8' : undefined,
    },
    (err, body) => {
      if (err) return next(err);
      req.body = body;
      next();
    },
  );
};

export default verifyWebhook;

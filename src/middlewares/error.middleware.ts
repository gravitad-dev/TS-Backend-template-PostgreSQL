import { Request, Response, NextFunction } from 'express';

export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err.stack?.includes('SyntaxError')) {
    if (!err.message.includes('JSON')) return;
    res.status(400).send({
      message: 'SyntaxError: ' + err.message.split('JSON')[0] + 'JSON',
    });
    return;
  }
  console.error(err.stack);
  res.status(500).send('Something broke!');
  return;
};

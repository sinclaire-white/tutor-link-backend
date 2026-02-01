import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status'; // Optional: npm install http-status

const notFound = (req: Request, res: Response, next: NextFunction) => {
  return res.status(404).json({
    success: false,
    message: 'API Not Found !!',
    errorSources: [
      {
        path: req.originalUrl,
        message: 'API Not Found',
      },
    ],
  });
};

export default notFound;
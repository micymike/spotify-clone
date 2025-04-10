export class APIError extends Error {
  constructor(message, statusCode = 500, details = {}) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let details = err.details || {};

  // Log error to console
  console.error('Error:', {
    message,
    statusCode,
    stack: err.stack,
    details
  });

  // Don't expose internal errors to client in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'Internal Server Error';
    details = {};
  }

  res.status(statusCode).json({
    error: {
      message,
      ...(Object.keys(details).length > 0 && { details })
    }
  });
};
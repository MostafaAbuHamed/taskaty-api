class AppError extends Error {
  constructor(message, httpCode, isOperational) {
    super(message);
    this.name = this.constructor.name;
    this.httpCode = httpCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

exports.AppError = AppError;
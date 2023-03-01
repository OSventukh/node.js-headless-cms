export default function errorHandler(error, req, res, next) {
  const message = (!error.name || error.name === 'SequelizeDatabaseError') ? 'Something went wrong' : error.message;
  const status = error.statusCode || error.status || 500;
  res.status(status).json({
    message,
    status,
    stack: process.env.NODE_ENV === 'development' ? error.stack : {},
  });
}

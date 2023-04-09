import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import routes from './routes.js';
import errorHandler from './middlewares/error-handle.js';

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.ACCESS_DOMEN || true,
}));

await routes(app);

app.use(errorHandler);

export default app;

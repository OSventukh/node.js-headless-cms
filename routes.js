import { promises as fs } from 'fs';
import path from 'path';

import HttpError from './utils/http-error.js';

export default async function routes(app) {
  const routesDir = path.join(process.cwd(), 'routes');
  const files = await fs.readdir(routesDir);
  const createRoute = async (file) => {
    const router = await import(`./routes/${file}`);
    app.use('/', router.default);
  };
  await Promise.all(files.map(createRoute));
  // Handle 404 error if route not exist
  app.use(() => {
    throw new HttpError('This route not found', 404);
  });
}

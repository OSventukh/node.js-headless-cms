import { promises as fs} from 'fs';
import path from 'path';

export default async function routes(app) {
  const routesDir = path.join(process.cwd(), 'routes')
  const files = await fs.readdir(routesDir);
  const createRoute = async(file) => {
    const router = await import(`./routes/${file}`)
    app.use('/', router.default)
  }
  await Promise.all(files.map(createRoute))
}


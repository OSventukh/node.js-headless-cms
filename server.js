import app from './app.js';
import db from './models/index.js';
const PORT = process.env.PORT || 3000;

async function server() {
  // connnecting database
  const { sequelize } = await db;
  await sequelize.sync();
  // running server
  app.listen(PORT);
}

await server();

import app from './app.js';
import { sequelize } from './models/index.js';

const PORT = process.env.PORT || 3000;

((async function server() {
  // connnecting database
  await sequelize.sync({ force: true });
  // running server
  app.listen(PORT);
})());

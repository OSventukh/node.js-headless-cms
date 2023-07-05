import app from './app.js';
import logger from './utils/logger.js';
import { sequelize } from './models/index.js';

const PORT = process.env.PORT || 5000;

((async function server() {
  // connnecting database
  try {
    await sequelize.sync();
    // running server
    app.listen(PORT);
    
  } catch (error) {
    console.log(error)
    logger.error('server error', error)
  }
})());

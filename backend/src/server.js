import { app } from './app.js';
import { config } from './config.js';
import './db.js';

app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
});
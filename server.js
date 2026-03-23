import { config } from './src/config/index.js';
import app from './app.js';

const port = config.port;

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

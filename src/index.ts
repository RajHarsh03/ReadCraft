import { buildApp } from "./app.js";
import { loadConfig } from "./config.js";

const config = loadConfig();
const app = buildApp({ config });

app
  .listen({ port: config.port, host: "0.0.0.0" })
  .then(() => {
    console.log(`ReadCraft API listening on http://localhost:${config.port}`);
  })
  .catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });

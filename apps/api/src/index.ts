import "dotenv/config";
import { buildApp } from "./app.js";

const { app, env } = await buildApp();

app.listen({ host: "0.0.0.0", port: env.port }).catch((error) => {
  app.log.error(error);
  process.exit(1);
});

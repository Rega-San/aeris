import { createApp } from "./app.js";
import { createPool, waitForDatabase } from "./database/pool.js";
import { createRepository } from "./database/repository.js";
const pool = createPool();
pool.on("error", () =>
  console.error(
    "Connexion PostgreSQL interrompue ; les prochaines requêtes tenteront une reconnexion.",
  ),
);
try {
  await waitForDatabase(pool);
  const port = Number(process.env.PORT || 4000);
  const server = createApp(createRepository(pool)).listen(port, "0.0.0.0", () =>
    console.log(`AERIS API disponible sur le port ${port}`),
  );
  let stopping = false;
  const shutdown = () => {
    if (stopping) return;
    stopping = true;
    server.close(() => {
      void pool.end().then(() => process.exit(0));
    });
    setTimeout(() => process.exit(1), 10000).unref();
  };
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
} catch (error) {
  console.error(
    error instanceof Error ? error.message : "Échec du démarrage de l’API.",
  );
  await pool.end();
  process.exitCode = 1;
}

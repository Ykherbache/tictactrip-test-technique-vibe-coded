import { createProductionApp } from './app';

const PORT = process.env.PORT || 3000;
const DAILY_LIMIT = 80000;

async function bootstrap() {
  const app = await createProductionApp(DAILY_LIMIT);
  app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('Erreur au démarrage', err);
  process.exit(1);
});

# API de justification de texte (Node.js / TypeScript)

> Version "vibe coder" de mon projet [tictactrip-test-technique](https://github.com/Ykherbache/tictactrip-test-technique), développée dans OpenCode avec GPT-5.1 Codex Max.

## Objectif
Fournir une API REST publique qui justifie du texte à 80 caractères par ligne, avec authentification par jeton UUID et quota quotidien de 80 000 mots par jeton. Stockage du quota : mémoire en test/dev, Redis en production (survie aux crashs).

## Endpoints
- `POST /api/token`
  - Body : `{"email": "foo@bar.com"}`
  - Réponse : `{ "token": "<uuid>" }`
- `POST /api/justify`
  - Headers : `Content-Type: text/plain`, `Authorization: Bearer <token>`
  - Body : texte brut
  - Réponse : texte justifié (`text/plain`)

## Règles métier
- Largeur fixe : 80 caractères.
- Justification : toutes les lignes sauf la dernière répartissent les espaces ; dernière ligne (ou ligne à mot unique) alignée à gauche.
- Quota : 80 000 mots par jeton et par jour (UTC). Au-delà → 402 Payment Required.
- Auth : jeton requis et valide (le jeton doit exister dans le dépôt mémoire/Redis), 401/403 sinon.
- Pas de bibliothèque externe pour la justification.

## Stockage quota
- **Dev/Test** : mémoire (Map en process).
- **Prod** : Redis (clé `<token>:<YYYY-MM-DD>`, TTL 24h).

## Configuration / Environnement
- `PORT` (défaut 3000)
- `NODE_ENV` (production → Redis utilisé si `REDIS_URL` présent)
- `REDIS_URL` (URL du serveur Redis en production)
- Voir `.env.example` pour un exemple minimal.

## Scripts
- `pnpm dev` : démarrage en mode ts-node
- `pnpm build` : compilation TypeScript → `dist/`
- `pnpm start` : exécuter le build compilé
- `pnpm test -- --runInBand` : tests Jest (projets unit/integ)

## Tests
- Multi-projets Jest (unit + integ), couverture 100% (lignes, fonctions, branches, statements) :
  - Unitaires : use cases, core, utilitaires, middleware.
  - Intégration : routes Express avec Redis via Testcontainers (quota, auth, jeton inconnu, 401/400/402, body invalide).

## Déploiement
- Builder puis déployer `dist/server.js` sur une URL/IP publique.
- S’assurer que Redis est accessible et configuré avec `REDIS_URL` pour la persistance des quotas.

## Lancement rapide
1. Installer les dépendances : `pnpm install`
2. Variables d’environnement : copier `.env.example` vers `.env` et ajuster (`PORT`, `REDIS_URL`, etc.).
3. Démarrer en dev : `pnpm dev`
4. Lancer les tests : `pnpm test -- --runInBand` (l’intégration utilise Testcontainers Redis, Docker requis).

## Exemples cURL
- Obtenir un jeton :
  - `curl -X POST http://localhost:3000/api/token -H "Content-Type: application/json" -d '{"email":"foo@bar.com"}'`
- Justifier un texte :
  - `curl -X POST http://localhost:3000/api/justify -H "Authorization: Bearer <token>" -H "Content-Type: text/plain" --data "Votre texte ici"`

## Points ouverts
- Taille maximale du body acceptée.
- Politique exacte pour les séparateurs non ASCII / mots très longs (>80).
- Durée de vie et rotation des jetons (illimitée pour l’instant).

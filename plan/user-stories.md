# User Stories et Checklists

## Story 1 — Obtenir un jeton
- [x] En tant que client, je peux demander un jeton via `POST /api/token` avec mon email.
- [x] En tant que client, si l’email est absent ou invalide, je reçois une erreur 400.

## Story 2 — Justifier un texte à 80 colonnes
- [x] En tant que client, je peux envoyer un texte `text/plain` à `POST /api/justify` et recevoir le texte justifié à 80 colonnes.
- [x] Les lignes finales ou à mot unique sont alignées à gauche (pas de bourrage à 80).
- [x] Les espaces sont normalisés (runs d’espaces compressés en un espace) avant justification.
- [x] La réponse est en `text/plain`.

## Story 3 — Authentification par jeton
- [x] En tant que client, je dois fournir `Authorization: Bearer <token>` pour `/api/justify`.
- [x] En cas d’absence ou de jeton invalide, je reçois 401/403.

## Story 4 — Limitation quotidienne (80 000 mots/jour/token)
- [x] En tant que client, je suis limité à 80 000 mots par jour (UTC) sur `/api/justify`.
- [x] Si je dépasse la limite, je reçois une erreur 402 Payment Required.
- [x] Le comptage des mots se fait après normalisation des espaces.

## Story 5 — Persistance des quotas
- [x] En dev/test, les quotas sont stockés en mémoire (Map en process).
- [x] En production, les quotas sont stockés dans Redis (clé `<token>:<YYYY-MM-DD>`, TTL 24h) pour survivre aux crashs.
- [x] Bascule automatique en mémoire si Redis est indisponible.

## Story 6 — Qualité et tests
- [x] L’algorithme de justification est testé (distribution des espaces, normalisation, alignement final).
- [x] Le comptage des mots est testé.
- [x] Tests de quota et d’authentification ajoutés.

## Story 7 — Documentation (FR)
- [x] README en français décrivant endpoints, quotas, auth, config.
- [x] Exemples complets de requêtes cURL ajoutés.

# Épics et User Stories

## Épic 1 — Authentification par jeton
- En tant que client, je peux demander un jeton avec mon email pour authentifier mes requêtes de justification.
- En tant que client, je reçois une réponse d’erreur si je fournis un jeton manquant ou invalide.

## Épic 2 — Justification de texte (80 colonnes)
- En tant que client, je peux envoyer un texte brut (`text/plain`) et recevoir le texte justifié à 80 caractères par ligne.
- En tant que client, les lignes finales ou à mot unique restent alignées à gauche (pas de bourrage à 80).
- En tant que client, les espaces sont normalisés avant justification (un seul espace entre les mots).

## Épic 3 — Limitation quotidienne par jeton
- En tant que client, je suis limité à 80 000 mots par jour sur `/api/justify` pour mon jeton.
- En tant que client, si je dépasse la limite, je reçois une erreur 402 Payment Required.
- En tant qu’opérateur, je veux que les compteurs survivent à un crash serveur en production via Redis.

## Épic 4 — Opérations et qualité
- En tant qu’opérateur, je peux déployer le service sur une URL/IP publique et connaître les variables d’environnement requises.
- En tant que développeur, je dispose de tests unitaires pour l’algorithme de justification et le quota.
- En tant qu’utilisateur, je dispose d’un README en français expliquant l’usage des endpoints et des quotas.

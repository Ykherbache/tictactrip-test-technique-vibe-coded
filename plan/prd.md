# PRD — API de justification de texte

## Objectif
Fournir une API REST publique qui justifie un texte en respectant une largeur fixe de 80 caractères par ligne. L’API expose `/api/justify` pour traiter du texte brut, protégée par un jeton UUID et soumise à une limite quotidienne de mots, avec stockage des quotas en mémoire pour les tests et Redis en production pour éviter la perte d’état lors d’un crash serveur.

## Portée fonctionnelle
- **Génération de jeton** : `POST /api/token` avec corps JSON `{ "email": "foo@bar.com" }` retourne un jeton unique (UUID).
- **Justification** : `POST /api/justify` avec `Content-Type: text/plain` retourne le texte justifié à 80 caractères par ligne (dernière ligne et lignes à mot unique laissées alignées à gauche). Normalisation des espaces avant traitement (runs d’espaces compressés en un espace).
- **Authentification** : Jeton requis sur `/api/justify` (ex. `Authorization: Bearer <token>`). Rejet 401/403 si absent ou invalide.
- **Limitation de débit quotidienne** : 80 000 mots par jeton et par jour (UTC). Dépassement → 402 Payment Required. Comptage des mots à chaque appel `/api/justify`.
- **Réponses attendues** :
  - 200 : texte justifié (`text/plain`).
  - 400 : entrée invalide ou non text/plain.
  - 401/403 : authentification manquante/invalide.
  - 402 : quota de mots dépassé.
  - 429 : éventuellement pour contrôle de rafales (optionnel, distinct du quota quotidien).
  - 500 : erreur interne.

## Contraintes et règles métier
- Langage : Node.js avec TypeScript.
- Pas de bibliothèque externe pour la justification.
- Largeur fixe : 80 caractères.
- Distribution des espaces : pour toutes les lignes sauf la dernière, répartir les espaces pour atteindre 80 caractères ; si une seule séquence de mot sur la ligne, conserver l’alignement à gauche (pas de padding à 80).
- Dernière ligne : alignée à gauche avec un seul espace entre les mots.
- Comptage des mots : découpe sur espaces après normalisation (séparateurs whitespace). Les mots très longs (>80) restent non coupés, la ligne les contiendra seuls.

## Stockage et persistance des limites
- **Tests / Dev** : stockage en mémoire (simple map) pour les quotas journaliers par jeton.
- **Production** : Redis pour persister les compteurs quotidiens et éviter la réinitialisation en cas de crash/rollback. Clé par jeton + date UTC, TTL 24h.

## Non-fonctionnel
- **Déploiement** : service accessible publiquement (URL/IP) documenté dans le README.
- **Performances** : capable de traiter des paragraphes/articles standards ; pas de streaming requis.
- **Observabilité** : logs de démarrage et erreurs ; journalisation des requêtes recommandée (sans loguer les jetons en clair).
- **Sécurité** : ne pas exposer les jetons ; valider les inputs ; appliquer l’auth sur `/api/justify`.

## API
- `POST /api/token`
  - Body : `{"email": "foo@bar.com"}`
  - Retour : jeton UUID
- `POST /api/justify`
  - Headers : `Content-Type: text/plain`, `Authorization: Bearer <token>`
  - Body : texte brut à justifier
  - Retour : texte justifié

## Tests et qualité (fortement recommandés)
- Tests unitaires sur l’algorithme de justification (mots uniques, lignes exactes, mots longs, multiples espaces).
- Tests sur le quota quotidien et l’authentification.
- Coverage activé.
- README en français avec exemples d’usage, endpoints, exigences d’auth, note sur la largeur 80 et sur la limite quotidienne.

## Questions ouvertes
- Taille maximale du body acceptée ?
- Politique exacte pour les caractères non ASCII et séparateurs exotiques (comptage de mots).
- Politique de rotation/expiration des jetons (durée de vie illimitée ou TTL configurable ?).

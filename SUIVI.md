# Suivi AERIS — 25 novembre 2026

## 1. État actuel

| Élément | Statut | Explication |
| --- | --- | --- |
| Frontend | Validé | Export Next.js servi par Nginx ; 8 tests UI et 2 parcours réels Chrome réussis. |
| Backend | Validé | 15 tests réussis, types vérifiés, API réelle accessible via Nginx. |
| PostgreSQL | Validé | SELECT 1, insertion et lecture réelles ; même ligne après redémarrage Compose. |
| Docker multi-stage | Validé | Build Node → Nginx réussi ; HTML présent, Node et node_modules absents de l’image finale. |
| Docker Compose | Validé | Trois services sains après build, démarrage et redémarrage. |
| Communication entre services | Validé | Navigateur → Nginx → Express → PostgreSQL et Open-Meteo vérifiés. |
| Documentation | Validé | README pédagogique, suivi, audit et matrice mis à jour. |
| GitHub | Validé | [Rega-San/aeris](https://github.com/Rega-San/aeris), public, branche main publiée ; Compose téléchargé sans authentification. |

L’application reste démarrée sur http://localhost:8080. Le conteneur temporaire du TP1 a été arrêté. Docker Desktop doit rester actif pour utiliser Compose.

## 2. Travail déjà réalisé avant cette intervention

L’architecture `frontend/`, `backend/`, `database/` était déjà présente, mais non commitée. Recherche de villes, météo actuelle, cinq jours de prévisions, carte Leaflet, navigation responsive et historique partagé étaient implémentés. Les Dockerfiles multi-stage, le proxy Nginx, les healthchecks, le volume PostgreSQL et les scripts de vérification existaient. Les preuves du 23 novembre concernent surtout l’exécution native ; elles sont conservées comme historique, sans être présentées comme des tests Docker.

L’audit initial a distingué :

- Présent et désormais vérifié : sources, compilation statique, API, SQL paramétré et interface.
- Présent mais à vérifier au départ : images, réseau Compose, Nginx, volume et comportement en panne.
- Incomplet : suivi de reprise, définitions pédagogiques Docker, dépannage et publication.
- À corriger : lint des caches imbriqués ; documentation annonçant Docker non testé et publication non autorisée ; liens vers deux preuves inexistantes.
- À développer : aucune fonctionnalité métier supplémentaire nécessaire aux TP.

## 3. Modifications effectuées pendant cette intervention

| Fichier | Action et raison |
| --- | --- |
| [frontend/eslint.config.mjs](frontend/eslint.config.mjs) | Exclusions récursives des builds : un ancien cache imbriqué provoquait 29 erreurs sans concerner les sources. |
| [scripts/audit-public.mjs](scripts/audit-public.mjs) | Ajout du contrôle des blobs de l’historique HEAD et des signatures AWS ; les versions supprimées sont aussi publiées par Git. |
| [README.md](README.md) | Démarrage rapide, définitions image/conteneur/multi-stage, rôles des configurations, dépannage, résultats Docker actuels et nom de dépôt `aeris`. |
| [SUIVI.md](SUIVI.md) | Créé pour retrouver les décisions, tests et étapes de reprise. |
| [docs/VALIDATION.md](docs/VALIDATION.md) | Matrice finale avec les trois statuts demandés et des preuves concrètes. |
| [docs/AUDIT.md](docs/AUDIT.md) | Ajout d’un bilan daté pour distinguer l’ancienne migration de cette finalisation. |
| [docs/proofs/README.md](docs/proofs/README.md) | Retrait des liens vers les preuves 11 et 12 absentes ; lien vers les résultats actuels. |
| [docs/proofs/13-docker-final.txt](docs/proofs/13-docker-final.txt) | Créé : transcription synthétique des résultats effectivement obtenus. |
| Preuves textuelles historiques | Espaces de fin de ligne et retours chariot nettoyés pour réussir `git diff --cached --check`, sans changer les résultats. |

Aucun fichier source renommé ou supprimé pendant cette intervention. La migration des sources de la racine vers le frontend était déjà dans le dossier de travail ; elle est incluse dans le commit final. Les cinq SVG de démonstration de Next.js sont inutilisés mais inoffensifs ; ils sont conservés. Les caches locaux et la base native restent ignorés, sans suppression de données. Aucune technologie ajoutée, aucun changement visuel ou fonctionnalité métier supprimée.

## 4. Tests réalisés

Toutes les commandes partent de la racine. Pour les commandes `AERIS_URL=…`, la cible est la stack Docker sur `http://localhost:8080`.

| Commande | Résultat attendu | Résultat réel | Statut |
| --- | --- | --- | --- |
| `docker info` avant démarrage | Moteur accessible | Socket absent | Échoué, puis résolu par `docker desktop start` |
| `npm run typecheck` | Aucune erreur de types | Code 0, types backend et frontend vérifiés | Réussi |
| `npm run lint` initial | Aucun problème | 29 erreurs dans un ancien cache imbriqué | Échoué, corrigé |
| `npm run lint` après correction | Aucun problème | Code 0 | Réussi |
| `npm test` | Tests backend réussis | 15/15 | Réussi |
| `docker compose config --quiet` | Configuration valide | Code 0 | Réussi |
| `docker compose up --build -d --wait` | Images construites, services sains | Deux images construites, trois services healthy ; étapes backend déjà en cache | Réussi |
| `AERIS_URL=http://localhost:8080 npm run test:stack` | Santé DB, météo et historique | SELECT 1, Marseille enregistrée et relue | Réussi |
| `AERIS_URL=http://localhost:8080 npm run test:api` | 5 villes, erreurs prévues | 200 pour les cinq villes, 404 inconnue, 400 entrées invalides | Réussi |
| `AERIS_URL=http://localhost:8080 npm run test:e2e` | UI déterministe | 8/8 ; réponses fournisseur simulées dans ces seuls tests | Réussi |
| `AERIS_URL=http://localhost:8080 npm run test:live` | Parcours Chrome avec vraies données | 2/2 ; carte, recherches, mobile et historique | Réussi |
| `docker compose restart` puis `docker compose up -d --wait` | Retour à trois services sains | Trois services healthy | Réussi |
| `AERIS_URL=http://localhost:8080 node scripts/check-persistence.mjs` | Même identifiant et date | Ligne 13, Marseille, `2026-11-25T09:25:40.292Z` retrouvée | Réussi |
| `docker compose exec -T db … psql … SELECT …` | Lecture SQL indépendante | Lignes 13 Marseille, 12 Londres, 11 Paris | Réussi |
| `docker compose exec -T frontend … nginx -t …` | Config valide, HTML présent, Node et node_modules absents | Code 0 pour tous les contrôles | Réussi |
| `docker run --rm -d --name aeris-tp1-check -p 127.0.0.1:8081:80 aeris-frontend:local` puis `curl` | Frontend seul accessible | Premier curl trop précoce : code 52 ; après démarrage, `/healthz` = ok et `/` = HTTP 200 | Réussi après attente |
| `docker compose stop db` puis `AERIS_URL=http://localhost:8080 node scripts/check-db-outage.mjs` | Panne explicitement signalée | DB/historique 503, météo 200 avec historySaved=false | Réussi |
| `docker compose start db` puis `docker compose up -d --wait` | Récupération | Trois services healthy | Réussi |
| `node scripts/audit-public.mjs` | Aucun artefact interdit ni signature sensible | 17 blobs historiques contrôlés avant commit, exclusions actives | Réussi dans les limites d’un contrôle de motifs |

Les commandes SQL et d’inspection complètes se trouvent dans le [README](README.md). La persistance a été testée par redémarrage, pas par suppression du volume. Les tests sont une observation datée : Open-Meteo et OpenStreetMap peuvent être indisponibles ultérieurement.

## Publication vérifiée

`gh repo create Rega-San/aeris --public --source=. --remote=origin --push` a créé le dépôt et envoyé main (réussi). `gh repo view Rega-San/aeris --json url,visibility,defaultBranchRef` confirme PUBLIC et main (réussi). `curl --fail https://raw.githubusercontent.com/Rega-San/aeris/main/compose.yaml` reçoit le fichier sans authentification (réussi). Commit applicatif : `fb0b871`, suivi d’un commit documentaire. Historique conservé, aucun push forcé. Le contrôle `git diff --cached --check` a d’abord détecté des espaces dans les preuves historiques ; il réussit après nettoyage.

## 5. Travail restant

- Aucun travail obligatoire restant pour les exigences fournies ; dépôt publié et vérifié.
- Facultatif : conserver des captures de la démonstration pour le rendu du cours, selon [SCREENSHOTS.md](docs/SCREENSHOTS.md).
- Aucun ajout de CRUD ou de service nécessaire aux exigences fournies.

## 6. Comment reprendre le projet lors de ma prochaine session

1. Ouvrir ce dossier, lire ce suivi puis la [matrice](docs/VALIDATION.md).
2. Démarrer Docker Desktop. Conserver `.env` existant ; sur une autre machine, copier `.env.example` vers `.env`.
3. Exécuter `docker compose up --build -d --wait` et `docker compose ps`.
4. Ouvrir http://localhost:8080, rechercher une ville et vérifier son historique.
5. Pour une démonstration automatique : `AERIS_URL=http://localhost:8080 npm run test:stack` (Node installé et dépendances locales via `npm run setup` pour les autres tests).
6. Si besoin, lire `docker compose logs --tail=100` et le dépannage du README.
7. Après une modification des sources, relancer le build Compose et les contrôles concernés. Mettre à jour ce suivi avec les résultats réels.
8. Arrêter avec `docker compose down` sans `-v` pour conserver la base.

Pour expliquer le projet : le navigateur reçoit des fichiers statiques de Nginx ; ses appels `/api/` sont relayés à Express ; Express appelle Open-Meteo et enregistre les recherches dans PostgreSQL. Le volume garde ces recherches indépendamment de la vie des conteneurs.

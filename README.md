# AERIS — météo, cartographie et Docker

AERIS est une application météo en français : recherche de villes, conditions actuelles, prévisions sur cinq jours, carte interactive et historique partagé des recherches. Le projet réunit les **deux TP dans un seul dépôt** : frontend statique construit en multi-stage et architecture à trois services avec Docker Compose.

**Validation du 25 novembre 2026 :** les images Docker se construisent, les trois services sont sains et les parcours navigateur réels fonctionnent via Nginx, Express et PostgreSQL. Consulter [SUIVI.md](SUIVI.md) pour l’état de reprise, les tests et les limites, ainsi que la [matrice de validation](docs/VALIDATION.md).

## Démarrage rapide recommandé

Installer et démarrer Docker Desktop (Docker Engine avec Compose convient aussi sous Linux). Une connexion Internet est nécessaire pour télécharger les images, les dépendances, la météo et les tuiles de carte. Depuis la racine du dépôt :

```sh
# Seulement au premier lancement, si .env n’existe pas :
cp .env.example .env
docker compose up --build -d --wait
```

Ouvrir http://localhost:8080. Docker installe les dépendances dans les images : Node et PostgreSQL ne sont pas nécessaires sur la machine pour cette méthode. Les identifiants de l’exemple sont fictifs et réservés au TP local.

## Les notions Docker à expliquer au professeur

Une **image** est un modèle contenant le programme et les fichiers nécessaires à son exécution. Un **conteneur** est une instance démarrée de cette image : on peut arrêter et recréer le conteneur sans reconstruire l’image.

Un **Dockerfile** est la recette de construction d’une image. Le **build** exécute cette recette. Un build **multi-stage** utilise plusieurs étapes : ici Node installe les outils et compile le frontend, puis une seconde étape copie uniquement le résultat statique dans Nginx. Les outils TypeScript et les dépendances de développement restent dans l’étape de construction.

**Nginx** est le serveur web qui envoie le HTML, le CSS et le JavaScript au navigateur. Il relaie aussi les appels `/api/` à Express : c’est le rôle de proxy inverse. **Compose** décrit et démarre ensemble les trois services, leur réseau et leur stockage.

Un **port** désigne le point d’entrée réseau d’un programme. La correspondance `8080:80` envoie le port 8080 de la machine vers le port 80 de Nginx. Le **réseau** Compose permet aux conteneurs de se joindre par leur nom. Un **volume** garde les fichiers PostgreSQL même si son conteneur est supprimé puis recréé.

## Fonctionnalités et technologies

- React 19, Next.js 16, TypeScript strict et Tailwind CSS 4.
- Interface bleu ciel, responsive, navigation mobile, animations Motion et icônes Lucide.
- Température et ressenti en °C, humidité en %, vent en km/h, précipitations en mm.
- Cinq prévisions à partir de demain, selon la date locale de la destination.
- Leaflet / React Leaflet, marqueur, popup, zoom, déplacement et recentrage animé.
- Express 5 / Node.js : validation, API REST, erreurs explicites, délai fournisseur de 8 secondes.
- PostgreSQL : historique persistant, requêtes SQL paramétrées et requête de santé réelle.
- Docker multi-stage, Nginx, Docker Compose et volume nommé.
- Open-Meteo et OpenStreetMap : aucune clé API pour ce projet pédagogique.

Les conditions actuelles proviennent des modèles Open-Meteo ; l’heure affichée est celle des données dans le fuseau local de la ville. Les fixtures de tests ne sont jamais importées par l’application.

## Architecture

```text
Navigateur
    |
    | HTTP localhost:8080 — HTML, CSS, JS, polices
    v
frontend : Nginx :80
    |        sert frontend/out/, sans Node ni serveur Next.js
    |
    | /api/* — reverse proxy, réseau interne Compose
    v
backend : Express :4000
    |                    \
    | SQL paramétré       \ HTTPS — géocodage et météo
    v                      v
db : PostgreSQL :5432      Open-Meteo
    |
    v
volume postgres_data

Navigateur -- HTTPS --> tuiles OpenStreetMap (attribution visible)
```

Compose crée son réseau par défaut et les services se résolvent par leurs noms `backend` et `db`. Seul Nginx publie un port, limité à `127.0.0.1`. Les ports Express et PostgreSQL restent internes. Les trois services sont `frontend`, `backend`, `db` ; aucune base n’est exposée au navigateur.

```text
aeris/
├── frontend/
│   ├── src/app/                    # Page, métadonnées, styles, icône
│   ├── src/components/             # Interface et carte conservées
│   ├── src/lib/api.ts              # Client de l’API Express
│   ├── src/types/weather.ts
│   ├── tests/                     # Fixtures synthétiques et Playwright
│   ├── nginx/default.conf.template
│   ├── next.config.ts             # output: "export"
│   ├── Dockerfile                 # Node build -> Nginx
│   └── package.json / package-lock.json
├── backend/
│   ├── src/routes/api.ts          # Les quatre endpoints
│   ├── src/services/              # Open-Meteo, validation, cache borné
│   ├── src/database/              # Pool PostgreSQL et requêtes SQL
│   ├── src/app.ts                 # Express testable sans lancer le serveur
│   ├── src/server.ts              # Attente de la base et écoute réseau
│   ├── tests/
│   ├── Dockerfile
│   └── package.json / package-lock.json
├── database/init.sql
├── scripts/                       # Développement et vérifications réelles
├── docs/proofs/                    # Sorties textuelles réellement obtenues
├── compose.yaml
├── .env.example
├── .gitignore / .dockerignore      # Exclusions Git et contexte Docker racine
├── README.md                      # Comprendre et lancer
├── SUIVI.md                       # État, changements et reprise
└── package.json                    # Commandes communes, pas de dépendances
```

Les anciens fichiers Next.js ont été déplacés dans `frontend/`. La logique Open-Meteo a été déplacée dans le backend. L’ancienne route dynamique Next.js est retirée du frontend : elle est incompatible avec un export statique. La sauvegarde préalable des sources est locale, dans `.local/backups/`, ignorée par Git.

Cette séparation correspond directement aux trois rôles du TP. Aucun framework supplémentaire n’est nécessaire. Les fichiers `tsconfig.json` définissent la compilation TypeScript ; `frontend/eslint.config.mjs` contrôle les sources et exclut les builds ; `frontend/playwright.config.ts` configure les tests Chrome. Chaque application possède son lockfile pour reproduire l’installation et son `.dockerignore` pour exclure les dépendances locales et les secrets du contexte de build. `backend/tsconfig.tests.json` vérifie aussi les types des tests. Les scripts de la racine facilitent les vérifications ; ils ne sont pas des services supplémentaires.

## Installation des dépendances

Prérequis hors Docker : **Node.js 22.9+**, npm, PostgreSQL 15+ et, pour les tests navigateur, Google Chrome. Les images utilisent Node 22 et PostgreSQL 16. Les validations natives ont utilisé Node 25 et PostgreSQL 15 : elles ne remplacent pas la validation des images Linux.

```sh
npm run setup
```

Cette commande exécute `npm ci` séparément dans le frontend et le backend, avec leurs lockfiles. La police Geist est fournie par `@fontsource-variable/geist`, servie localement, sans téléchargement Google Fonts au build.

## Développement local

### Configurer PostgreSQL

Copier l’exemple seulement si aucun fichier `.env` n’existe déjà :

```sh
cp .env.example .env
```

Adapter les valeurs à une base **dédiée au projet**. Le backend lit ce fichier depuis la racine, jamais le navigateur. Avec PostgreSQL déjà installé, créer un rôle et une base dédiés si nécessaire :

```sh
createuser --pwprompt aeris
createdb --owner=aeris aeris
psql -h 127.0.0.1 -U aeris -d aeris -v ON_ERROR_STOP=1 -f database/init.sql
```

Ces commandes supposent que le rôle PostgreSQL local courant peut créer des rôles/bases. Ne pas les relancer si les objets existent. Le mot de passe choisi doit correspondre au fichier `.env`.

Pour l’audit sur ce Mac, une instance de test indépendante a été créée dans `.local/postgres`, avec écoute sur `127.0.0.1:55432`. Le fichier `.env` local utilise ce port. Elle n’a pas remplacé de base existante. Les commandes pour la redémarrer ou l’arrêter sont dans [le guide local](docs/LOCAL-DATABASE.md).

### Lancer AERIS

```sh
npm run dev
```

- Interface : http://localhost:3000
- API locale : http://localhost:4000/api/health
- Contrôle PostgreSQL : http://localhost:4000/api/health/db

Les deux processus peuvent aussi être lancés séparément :

```sh
npm run dev:backend
npm run dev:frontend
```

Le backend attend que la base et la table soient prêtes avant d’écouter. Après 15 tentatives, il quitte avec un message explicite. `npm run dev` nécessite donc une base démarrée et initialisée.

### Vérifier l’export sans Docker

```sh
npm run build
npm --prefix frontend run preview
```

Ouvrir http://localhost:3001. Ce serveur de prévisualisation sert uniquement les fichiers de `frontend/out/` et relaie `/api/` vers Express local. **Ce serveur Node de vérification n’est pas utilisé dans l’image frontend : la production utilise Nginx.**

### Adresse de l’API et variables de build

En développement, Next.js injecte par défaut `http://localhost:4000` comme `NEXT_PUBLIC_API_BASE_URL`. En production, la valeur est vide : le navigateur appelle `/api/...` sur la même origine, puis Nginx relaie vers le backend.

`NEXT_PUBLIC_API_BASE_URL` est **compilée dans le JavaScript**. La changer après le build ne modifie pas le bundle. Le Dockerfile force la valeur vide. En revanche `BACKEND_UPSTREAM` est une variable de **runtime Nginx**, substituée dans son template au démarrage : elle vaut `backend:4000` dans Compose. Le frontend ne reçoit aucun identifiant PostgreSQL.

## API REST et flux de données

| Endpoint                          | Réponse / rôle                                                                          |
| --------------------------------- | --------------------------------------------------------------------------------------- |
| `GET /api/health`                 | État du processus API, sans dépendre de PostgreSQL.                                     |
| `GET /api/health/db`              | Exécute `SELECT 1 AS value` ; retourne `result: 1` ou `503`.                            |
| `GET /api/weather?city=Marseille` | Géocode la ville, récupère la météo, enregistre la recherche puis retourne les données. |
| `GET /api/searches`               | Les 10 dernières recherches, par date et identifiant décroissants.                      |

La réponse météo contient `location`, `current`, `forecast` et `historySaved`. Les dates quotidiennes sont locales à la destination. Le géocodage retient le premier résultat ; la région et le pays affichés permettent de vérifier les villes homonymes.

Une recherche valide suit ces étapes :

1. Validation du paramètre : 2 à 100 caractères, au moins une lettre Unicode, rejet des entrées invalides.
2. Géocodage via `https://geocoding-api.open-meteo.com/v1/search`.
3. Prévisions via `https://api.open-meteo.com/v1/forecast`, en °C, km/h, mm et `timezone=auto`.
4. Contrôle des données reçues ; aucune mesure absente n’est remplacée par un faux zéro.
5. Insertion PostgreSQL avec `INSERT ... VALUES ($1, $2)`.
6. Retour JSON puis actualisation de l’historique affiché.

Les données du fournisseur sont mises en cache en mémoire pendant 5 minutes, avec au maximum 100 villes. **Les réponses HTTP météo ne sont pas cachées** : chaque requête valide doit encore enregistrer sa recherche. Une recherche automatique de Marseille est effectuée à l’ouverture ; l’historique est partagé entre les visiteurs, sans authentification, et limité à 10 lignes à l’affichage (les lignes stockées ne sont pas purgées automatiquement).

En cas de panne PostgreSQL après démarrage, la météo reste accessible avec `historySaved: false`, et l’interface signale l’absence d’enregistrement. L’historique et `/health/db` renvoient `503`. Ce choix évite qu’une panne de la fonctionnalité secondaire supprime la météo.

Erreurs météo : `400` entrée invalide, `404` ville inconnue, `502` fournisseur inaccessible ou données invalides, `504` délai dépassé, `500` erreur inattendue. Chaque requête fournisseur est limitée à 8 secondes. Le client annule la recherche précédente et limite l’ensemble à 25 secondes. Les erreurs sont en français et ne révèlent pas les identifiants ou détails de connexion.

## TP 1 — Docker multi-stage et frontend statique

Le [Dockerfile frontend](frontend/Dockerfile) comporte deux étapes :

1. `node:22-alpine` installe les dépendances avec `npm ci` et produit `out/` avec `next build` et `output: "export"`.
2. `nginx:stable-alpine` reçoit uniquement `out/` et le template Nginx. Aucun `node_modules`, source TypeScript ou serveur Next.js n’est copié depuis le stage de build.

À exécuter une fois Docker Desktop démarré :

```sh
docker info
docker build -t aeris-frontend:tp1 ./frontend
docker run --rm -d --name aeris-tp1 -p 127.0.0.1:8081:80 aeris-frontend:tp1
curl --fail -I http://localhost:8081/
curl --fail http://localhost:8081/healthz
docker exec aeris-tp1 sh -c 'test ! -d /app/node_modules && test ! -d /usr/share/nginx/html/node_modules && ! command -v node'
docker stop aeris-tp1
```

Le conteneur seul sert la landing page ; les appels météo indiquent une indisponibilité tant qu’aucune API ne lui est accessible. Pour l’associer à l’API locale sur Mac, utiliser un réseau Docker dédié et `host.docker.internal` :

```sh
docker network create aeris-tp1-network
docker run --rm -d --name aeris-tp1 --network aeris-tp1-network \
  -p 127.0.0.1:8081:80 -e BACKEND_UPSTREAM=host.docker.internal:4000 aeris-frontend:tp1
```

Ne pas recréer le réseau s’il existe déjà. Le backend local doit être en cours d’exécution. Compose reste la méthode recommandée pour démontrer l’ensemble.

## TP 2 — Docker Compose

### Lancement

Docker Desktop doit afficher un moteur actif. Il a été démarré et utilisé pour les validations du 25 novembre. Pour vérifier son état :

```sh
docker version
docker compose version
docker info
```

Préparer `.env` à partir de l’exemple si nécessaire, puis :

```sh
docker compose config --quiet
docker compose up --build -d
docker compose ps
```

Ouvrir http://localhost:8080. Les images ont été construites et exécutées sur Apple Silicon (`linux/arm64`), sans imposer d’émulation AMD64.

### Services, données et santé

| Service    | Port interne | Port publié                 | Santé            |
| ---------- | ------------ | --------------------------- | ---------------- |
| `frontend` | 80           | `127.0.0.1:8080` par défaut | Nginx `/healthz` |
| `backend`  | 4000         | Aucun                       | `/api/health/db` |
| `db`       | 5432         | Aucun                       | `pg_isready`     |

Le backend dépend de la santé PostgreSQL et le frontend de celle du backend, avec `condition: service_healthy`. Express vérifie aussi la présence de la table au démarrage. Nginx résout le backend à l’exécution pour supporter son redémarrage.

`database/init.sql` s’exécute automatiquement **uniquement sur un volume PostgreSQL vide**. Les recherches persistent dans `postgres_data`. Modifier ensuite le fichier SQL ou les identifiants `.env` ne modifie pas une base déjà initialisée : prévoir une migration SQL ou une modification explicite du rôle, sans effacer le volume.

Variables :

- `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` : configuration de la base et du backend. Le mot de passe est obligatoire dans Compose.
- `FRONTEND_PORT` : port HTTP publié, `8080` par défaut.
- `PGHOST`, `PGPORT`, `PORT`, `CORS_ORIGINS` : développement local ; Compose impose `db:5432` et `4000`.
- `BACKEND_UPSTREAM` : adresse interne du proxy Nginx, configurée dans Compose.

Les valeurs de `.env.example` sont fictives, destinées au TP local. Ne pas les utiliser comme identifiants de production. `.env` est exclu de Git et des contextes Docker.

### Vérifier les communications

```sh
curl --fail http://localhost:8080/
curl --fail http://localhost:8080/api/health
curl --fail http://localhost:8080/api/health/db
curl --fail 'http://localhost:8080/api/weather?city=Marseille'
curl --fail http://localhost:8080/api/searches
AERIS_URL=http://localhost:8080 npm run test:api
AERIS_URL=http://localhost:8080 npm run test:stack
```

Contrôle SQL indépendant :

```sh
docker compose exec db sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT id, city, country, searched_at FROM searches ORDER BY id DESC LIMIT 10;"'
```

### Vérifier la persistance du volume

```sh
AERIS_URL=http://localhost:8080 npm run test:stack
docker compose restart
docker compose ps
# Attendre que les trois services soient healthy, sans lancer d'autres recherches.
AERIS_URL=http://localhost:8080 node scripts/check-persistence.mjs
```

Le premier script conserve l’identifiant et la date exacts d’une ligne dans `.local/persistence-proof.json`. Le second vérifie cette même ligne après le redémarrage. Ce contrôle a été exécuté avec Compose le 25 novembre.

### Vérifier une panne de base et la récupération

```sh
# Précharger Marseille avant la panne pour isoler le test de PostgreSQL.
AERIS_URL=http://localhost:8080 npm run test:stack
docker compose stop db
AERIS_URL=http://localhost:8080 node scripts/check-db-outage.mjs
docker compose start db
# Attendre la santé PostgreSQL, puis vérifier :
curl --fail http://localhost:8080/api/health/db
```

Pour arrêter sans perdre les données : `docker compose down`. Ne pas ajouter `-v` : cette option supprimerait le volume et son historique.

## Tests et commandes de qualité

```sh
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
```

- 15 tests backend : validation, normalisation, cinq jours, erreurs HTTP et timeout, API Express, historique, SQL paramétré, cache, panne DB.
- 8 tests Playwright déterministes : fixtures météo et tuiles simulées uniquement dans les tests ; recherche, carte, erreurs, nouvelle tentative, réponse obsolète, historique, panne DB et responsive de 320 à 1440 px.
- 2 parcours réels séparés : `npm run test:live`, à lancer avec le backend et PostgreSQL actifs. Ils accèdent réellement à Open-Meteo et OpenStreetMap et peuvent échouer si ces services sont indisponibles.
- `npm run test:api` : cinq villes réelles, ville inconnue et entrées invalides.
- `npm run test:stack` : santé, véritable `SELECT 1`, météo externe, insertion et lecture PostgreSQL.

Les tests navigateur utilisent Google Chrome installé. Pour cibler l’export ou Compose :

```sh
AERIS_URL=http://localhost:3001 npm run test:e2e
AERIS_URL=http://localhost:3001 npm run test:live
# Remplacer 3001 par 8080 pour Compose.
```

Les captures et traces temporaires sont ignorées par Git. Les [preuves textuelles](docs/proofs/README.md), l’[audit](docs/AUDIT.md) et la [liste des captures à réaliser](docs/SCREENSHOTS.md) distinguent les tests simulés, les tests réseau locaux et les tests Docker non exécutés.

## Publication GitHub

Le dépôt public est [Rega-San/aeris](https://github.com/Rega-San/aeris). Les sources, Dockerfiles et documents ont été publiés sur `main` ; l’historique Git existant est conservé. La visibilité publique et l’accès sans authentification ont été vérifiés. Détails dans [SUIVI.md](SUIVI.md).

Après relecture des changements et vérification des fichiers ignorés :

```sh
git status --short
git check-ignore .env frontend/node_modules backend/node_modules frontend/.next frontend/out .local
git diff --check
git add -A
git diff --cached --stat
git commit -m "Complete AERIS with static frontend, Express, PostgreSQL and Docker TPs"
```

Si aucun dépôt distant n’existe encore, créer un dépôt public vide nommé `aeris`, puis vérifier l’URL avant l’ajout :

```sh
git branch -M main
git remote -v
# Si aucun remote origin n'existe :
git remote add origin https://github.com/VOTRE_COMPTE/aeris.git
git push -u origin main
```

Ne pas versionner `.env`, `.local/`, les dépendances, builds ou traces Playwright. Le schéma SQL, les deux lockfiles applicatifs, les Dockerfiles, les templates Nginx, Compose et les preuves textuelles doivent être inclus.

`node scripts/audit-public.mjs` contrôle les exclusions, les fichiers candidats et les anciennes versions dans l’historique HEAD. Ce contrôle de signatures doit être complété par une relecture ; il ne garantit pas la détection de tous les secrets possibles.

## Dépannage et commandes courantes

| Situation | Commande et interprétation |
| --- | --- |
| Voir l’état | `docker compose ps -a` : les trois services doivent être actifs et sains. |
| Lire les erreurs | `docker compose logs --tail=100` ; ajouter `backend`, `db` ou `frontend` pour cibler un service. |
| Suivre les logs | `docker compose logs -f` ; Ctrl+C arrête l’affichage, pas les conteneurs. |
| Reconstruire après modification | `docker compose up --build -d --wait`. |
| Arrêter en gardant les données | `docker compose down`. |
| Relancer proprement | `docker compose down`, puis `docker compose up --build -d --wait`. Ne pas ajouter `-v`. |
| Moteur inaccessible | Démarrer Docker Desktop, attendre, puis vérifier `docker info`. |
| Port 8080 occupé | Définir `FRONTEND_PORT=8082` dans `.env`, relancer Compose et ouvrir `http://localhost:8082`. |
| Frontend visible mais API inaccessible | Tester `/api/health`, puis `/api/health/db` sur le même port que le frontend ; consulter les logs backend et Nginx. |
| DB non saine | Lire les logs `db` ; un changement de mot de passe dans `.env` ne modifie pas un volume déjà initialisé. Rétablir les paramètres existants ou modifier explicitement le rôle SQL. |
| Météo indisponible malgré DB saine | Vérifier Internet et Open-Meteo ; une erreur 502/504 peut provenir du fournisseur externe. |

Le navigateur utilise `localhost:8080`, jamais `backend:4000` : ce nom n’est résolu que dans le réseau Docker. En développement local uniquement, l’API écoute directement sur `localhost:4000`.

## Intégration continue — GitHub Actions

Une **pipeline CI** (intégration continue) est une suite de vérifications automatiques appliquées au code envoyé sur le dépôt. **GitHub Actions** exécute cette suite sur une machine fournie par GitHub. Notre recette est le [workflow CI](.github/workflows/ci.yml), placé à la racine du dépôt dans `.github/workflows/`.

À chaque `git push` sur **n’importe quelle branche**, GitHub lance le job `frontend-build` sur un runner Ubuntu. Les tags seuls ne déclenchent pas ce workflow. Les étapes sont :

1. Récupérer le code du commit avec `actions/checkout`.
2. Installer Node.js 22 avec `actions/setup-node`, comme dans le Dockerfile frontend. Le cache npm utilise le lockfile du frontend.
3. Exécuter `npm ci` dans `frontend/` pour installer les versions verrouillées.
4. Exécuter `npm run build` dans ce même dossier : Next.js 16.4.6 utilise la configuration existante `output: "export"`.
5. Vérifier `out/index.html`, `out/404.html` et la présence de JavaScript et de CSS dans `out/_next/static/`. Une absence fait échouer le job.
6. Publier **`aeris-frontend-build`** avec `actions/upload-artifact`, en prenant le contenu de `frontend/out/`. L’artefact est conservé **14 jours** ; une nouvelle exécution possède son propre artefact.

Un **artefact** est un résultat de fabrication conservé après l’exécution : ici les fichiers HTML, CSS, JavaScript et ressources statiques, téléchargeables en ZIP. Les caches `.next/` et le fichier généré `frontend/frontend/.next/build/package.json` ne définissent pas le projet à compiler. Le vrai manifeste est [frontend/package.json](frontend/package.json), accompagné de son lockfile npm. Le package racine orchestre aussi le backend : la CI cible donc explicitement le frontend.

Cette CI n’effectue pas de déploiement et ne démarre ni PostgreSQL ni Express. Le build n’en a pas besoin. `NEXT_PUBLIC_API_BASE_URL` est vide comme dans Docker : les appels `/api/` restent relatifs à l’origine. L’artefact seul ne fournit pas l’API météo ou l’historique : pour utiliser toute l’application, conserver le proxy Nginx, le backend et PostgreSQL existants. Aucun secret n’est requis par ce workflow ; ses permissions sur le code sont limitées à la lecture.

### Retrouver le résultat et télécharger l’artefact

1. Ouvrir [Actions du dépôt AERIS](https://github.com/Rega-San/aeris/actions), puis **CI AERIS**.
2. Choisir l’exécution correspondant à la branche et au hash du commit envoyé.
3. Ouvrir **Build et artefact frontend** pour lire les étapes ; vérifier que le build et la publication sont verts.
4. Revenir au résumé de l’exécution, rubrique **Artifacts**, et cliquer sur **aeris-frontend-build** pour télécharger le ZIP. Se connecter à GitHub si nécessaire.
5. Décompresser : `index.html`, `404.html` et `_next/static/` doivent être présents. Il s’agit d’un site à servir en HTTP, pas d’une application complète à ouvrir simplement en `file://`.

Si aucune exécution n’apparaît, vérifier que le commit envoyé contient bien `.github/workflows/ci.yml`, que `on.push` est défini et que GitHub Actions est autorisé dans **Settings → Actions → General**. Si le job échoue, ouvrir **la première étape rouge** et lire son message : installation, compilation, fichiers manquants ou publication. Corriger, committer puis pousser de nouveau. Si l’artefact a expiré, relancer le job depuis **Re-run jobs** ou pousser un nouveau commit.

### Les mots à retenir

| Notion | Explication simple |
| --- | --- |
| Git | Outil local qui conserve les versions du code sous forme de commits. |
| GitHub | Service qui héberge le dépôt Git et facilite le travail partagé. |
| GitHub Actions | Service GitHub qui exécute les automatisations. |
| Workflow | Fichier YAML décrivant quand lancer les tâches et quelles étapes exécuter. |
| Pipeline CI | Suite automatique qui vérifie que le code envoyé peut être construit. |
| Job | Groupe d’étapes exécutées sur une même machine ; ici `frontend-build`. |
| Runner | Machine qui exécute le job ; ici Ubuntu chez GitHub. |
| Build | Transformation du code source en fichiers utilisables par le navigateur. |
| Artefact | Résultat du build conservé et téléchargeable après le job. |
| Push | Envoi des commits locaux vers le dépôt distant. |

## Sources techniques

- [Export statique Next.js](https://nextjs.org/docs/app/guides/static-exports) — configuration vérifiée aussi dans la documentation livrée avec Next.js installé.
- [Ordre de démarrage Compose et healthchecks](https://docs.docker.com/compose/how-tos/startup-order/).
- [Gestion des erreurs Express](https://expressjs.com/en/guide/error-handling/).
- [Image PostgreSQL officielle](https://hub.docker.com/_/postgres) et [image Nginx officielle](https://hub.docker.com/_/nginx).
- [Open-Meteo](https://open-meteo.com/) et [politique des tuiles OpenStreetMap](https://operations.osmfoundation.org/policies/tiles/).

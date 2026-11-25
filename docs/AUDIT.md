# Audit et décisions

## Finalisation du 25 novembre 2026

Les sections suivantes décrivent la migration historique du 23 novembre. Les trois dossiers applicatifs existaient déjà : leur architecture est conservée. Docker Desktop a été démarré ; builds, trois services sains, tests navigateur réels, lecture SQL, persistance après redémarrage et récupération après panne ont réussi. Les limites Docker décrites plus bas sont donc historiques, levées par ces vérifications.

Le lint analysait un cache imbriqué : les exclusions de builds sont maintenant récursives. L’audit public examine aussi les blobs historiques de HEAD. Le README reçoit les définitions Docker et le dépannage ; SUIVI détaille les résultats actuels. Les cinq SVG de démonstration inutilisés sont inoffensifs et conservés. Aucun code métier ou donnée locale supprimé. Voir [SUIVI](../SUIVI.md) et la [matrice actuelle](VALIDATION.md).

## État initial

Le dépôt Git existait, avec les modifications AERIS non commitées. Aucun reset ni écrasement de l’historique n’a été effectué. Une archive des sources, configurations, tests et lockfiles a été créée avant modification dans `.local/backups/aeris-before-docker.tar.gz`, sans dépendances, base ni secrets.

Le navigateur partagé ne pouvait initialement pas joindre `localhost:3000` : le serveur n’était pas démarré. Après démarrage, TypeScript, ESLint, les sept tests backend initiaux, les huit vérifications HTTP et les deux parcours navigateur réels ont réussi. Voir `02-before-migration.txt`.

## Le timeout `.current-card`

Ce sélecteur existe toujours et la carte s’affiche correctement après une réponse météo. Le code rend volontairement l’état d’erreur à sa place quand le fournisseur échoue. Les tests initiaux attendaient systématiquement la carte après un appel réel à Open-Meteo : ils ne pouvaient donc pas garantir le succès en cas de timeout fournisseur. Lors du développement précédent, un appel météo avait effectivement retourné 504 au bout de huit secondes.

Le timeout de l’ancien script ne suffit pas, seul, à prouver une panne de Leaflet ou un bug SSR. L’audit actuel n’a pas reproduit de panne déterministe de rendu. Il a confirmé le fonctionnement normal et reproduit l’état 504 par injection contrôlée. Le test vérifie maintenant le message visible, l’absence justifiée de carte puis sa réapparition après une nouvelle tentative réussie.

Les tests d’interface sont désormais indépendants des services externes. Les deux tests réels restent disponibles séparément ; aucune fonctionnalité n’a été supprimée et aucune assertion de succès n’est remplacée par une tolérance à l’échec.

## Corrections et migration

- Annonce accessible corrigée : une erreur après une recherche réussie n’annonce plus que l’ancienne météo vient d’être chargée.
- Réponse HTML de proxy indisponible traduite en message compréhensible, au lieu d’une erreur brute de parsing JSON.
- Annulation et protection contre les résultats obsolètes conservées et testées.
- Frontend déplacé, sans réécriture de son identité visuelle ; ajout discret de l’historique partagé.
- API Express indépendante, PostgreSQL réel, SQL paramétré, liste limitée à dix entrées.
- Cache déplacé au niveau des données fournisseur : un cache HTTP aurait empêché certaines recherches d’être enregistrées.
- Export Next.js statique : anciennes routes dynamiques retirées du frontend, modes de cache serveur retirés, Leaflet toujours chargé avec `ssr: false`.
- Geist empaquetée localement pour supprimer la dépendance à Google Fonts lors du build.
- Root Turbopack explicitement défini, pour éviter l’avertissement de plusieurs lockfiles après déplacement.
- Un ancien sélecteur de bouton trop large correspondait à la fois à une ville populaire et à son bouton d’historique. Le parcours réel cible maintenant la zone des villes populaires ; l’assertion sur la destination finale reste inchangée. L’échec initial et la réussite après correction sont conservés dans les preuves.

## Limites effectivement observées

Docker et Compose existent, mais le socket moteur est absent. Les manifests ARM64 et la syntaxe Compose ont pu être vérifiés sans moteur. Aucun conteneur n’a été construit ni démarré dans cette session. Les contrôles PostgreSQL natifs ne sont pas présentés comme une preuve du volume Docker.

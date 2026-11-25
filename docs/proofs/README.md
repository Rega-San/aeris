# Preuves de validation

Résultats réellement obtenus pendant l’intervention du 23 novembre 2026. Les données synthétiques des tests ne constituent pas une preuve d’accès externe. Les chemins absolus et le nom du compte local ont été masqués dans les sorties pour permettre leur publication ; les statuts, erreurs, durées, requêtes et résultats sont conservés.

| Fichier | Ce qu’il démontre |
| --- | --- |
| [01-environment.txt](01-environment.txt) | Git, Compose, architecture ARM64, PostgreSQL installé, moteur Docker inaccessible. |
| [02-before-migration.txt](02-before-migration.txt) | Application initiale : types, lint, 7 tests, villes réelles et 2 parcours réussis. |
| [03-deterministic-before-migration.txt](03-deterministic-before-migration.txt) | 5 tests UI déterministes avant réorganisation, dont timeout et récupération. |
| [04-migration-checks.txt](04-migration-checks.txt) | Types, lint, 15 tests backend, compilation Express et premier export statique ; avertissement de root Turbopack corrigé ensuite. |
| [05-local-postgres.txt](05-local-postgres.txt) | Initialisation d’un véritable cluster natif isolé, table et index. |
| [06-local-integration.txt](06-local-integration.txt) | Communications réelles et 8 tests UI réussis ; échec du sélecteur trop large dans le parcours réel, conservé pour transparence. |
| [07-compose-and-platforms.txt](07-compose-and-platforms.txt) | Configuration des trois services et manifests ARM64 officiels ; aucune exécution Docker. |
| [08-persistence-and-recovery.txt](08-persistence-and-recovery.txt) | Panne réelle de PostgreSQL, météo préservée, reconnexion, même ligne après redémarrage ; 2 parcours réels réussis après correction du sélecteur. |
| [09-static-export.txt](09-static-export.txt) | Export final compilé ; premier test HTTP révélant une erreur du serveur de prévisualisation, corrigée ensuite. |
| [10-static-export-verified.txt](10-static-export-verified.txt) | Export HTTP sans Next.js, tests déterministes et réels, proxy local vers Express et PostgreSQL. |
| [13-docker-final.txt](13-docker-final.txt) | 25 novembre : builds Docker, services, tests réels, volume, panne/récupération et audit public. |

Les fichiers 01 à 10 concernent les tests historiques : prévisualisation locale et base native ne remplacent pas Docker. Le fichier 13 décrit les nouvelles vérifications avec Docker du 25 novembre. Les références aux fichiers 11 et 12 ont été retirées car ces fichiers étaient absents.

Voir la [matrice de validation](../VALIDATION.md) et les [captures à réaliser](../SCREENSHOTS.md). La sauvegarde et les données de test restent dans `.local/`, hors du dépôt public.

# Validation des deux TP — 25 novembre 2026

Tests exécutés avec Docker Desktop. Voir les [résultats](proofs/13-docker-final.txt) et le [suivi](../SUIVI.md). VALIDÉ signifie vérifié ; NON VALIDÉ signifie exigence non remplie ; NON TESTÉ signifie absence de vérification.

| TP | Exigence | Statut | Preuve |
| --- | --- | --- | --- |
| Docker | Application web | VALIDÉ | 8 tests UI et 2 parcours réels Chrome sur localhost:8080. |
| Docker | Build statique | VALIDÉ | Build dans Docker ; HTML et assets copiés depuis `/app/out`. |
| Docker | Multi-stage | VALIDÉ | Deux étapes ; image Nginx inspectée, Node et node_modules absents. |
| Docker | Image construite | VALIDÉ | `docker compose up --build -d --wait` réussi. |
| Docker | Conteneur fonctionnel | VALIDÉ | Frontend indépendant : `/` HTTP 200 et `/healthz` ok sur 8081. |
| Docker | GitHub public | VALIDÉ | [Dépôt public](https://github.com/Rega-San/aeris), main publiée, fichier Compose accessible sans authentification. |
| Compose | Frontend | VALIDÉ | Nginx sain, interface vérifiée dans Chrome. |
| Compose | API | VALIDÉ | 15 tests backend ; requêtes réelles pour 5 villes. |
| Compose | PostgreSQL | VALIDÉ | SELECT 1, insertion, lecture SQL, persistance après redémarrage. |
| Compose | Trois services | VALIDÉ | Configuration valide ; frontend, backend, db healthy. |
| Compose | Communications | VALIDÉ | Parcours réels et test:stack via Nginx ; historySaved=true. |
| Compose | Documentation | VALIDÉ | README : installation, lancement, tests, valeurs fictives, dépannage ; SUIVI créé. |
| Compose | GitHub public | VALIDÉ | Visibilité PUBLIC confirmée par GitHub ; sources et documentation publiées. |

Contrôles supplémentaires : arrêt réel de PostgreSQL, météo préservée avec avertissement, historique et santé DB en 503 ; reprise avec trois services sains. La persistance testée est un redémarrage Compose, sans effacer le volume. Les tests externes dépendent d’Open-Meteo et OpenStreetMap.

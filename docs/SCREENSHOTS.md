# Captures à réaliser pour le rendu universitaire

Toutes les captures doivent représenter l’exécution réelle. Ne pas utiliser les tests avec fixtures comme preuves d’accès à Open-Meteo, PostgreSQL ou Docker.

1. **Frontend ordinateur** : interface complète, ville recherchée, cinq prévisions et carte chargée.
2. **Frontend mobile** : menu et cartes à une largeur de 375 px, sans débordement horizontal.
3. **Historique** : recherche d’une nouvelle ville, apparition dans « Dernières escales », puis clic sur cette ville.
4. **TP1 — build** : terminal montrant les deux stages et la fin réussie du build Docker.
5. **TP1 — conteneur** : conteneur Nginx démarré, réponse HTTP 200 et preuve de l’absence de Node/node_modules dans l’image finale.
6. **TP2 — trois services** : `docker compose ps` montrant exactement frontend, backend, db, avec leur état healthy.
7. **Frontend → API** : onglet Réseau du navigateur, appel `/api/weather?city=...` sur localhost:8080, réponse JSON 200.
8. **API → PostgreSQL** : `/api/health/db` avec `result: 1`, puis `SELECT` montrant les villes enregistrées.
9. **Persistance Docker** : même identifiant et même date de recherche avant et après `docker compose restart`, sans suppression des volumes.
10. **Gestion des erreurs** : ville inconnue, champ vide, puis panne PostgreSQL temporaire avec météo conservée et message explicite.

Les captures temporaires Playwright sont dans `frontend/test-results/`, ignorées par Git. Pour le rendu, choisir uniquement les captures réelles pertinentes et les ajouter volontairement dans `docs/proofs/` sans données personnelles. Les captures Docker restent à réaliser après démarrage du moteur.

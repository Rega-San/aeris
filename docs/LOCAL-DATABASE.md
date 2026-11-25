# Base locale utilisée pour la validation

PostgreSQL 15 était déjà installé sur le Mac. Aucune installation système ni modification d’une base personnelle n’a été réalisée. Une instance dédiée a été initialisée dans `.local/postgres`, puis la base `aeris` et la table de `database/init.sql` ont été créées.

Cette instance écoute seulement sur `127.0.0.1:55432`, avec un socket Unix dans `.local`. Le mode `trust` a été utilisé pour cette base de test locale ; ce réglage n’est pas celui de l’image Docker, qui exige le mot de passe de `.env`.

Depuis la racine du projet, redémarrer cette instance existante :

```sh
pg_ctl -D .local/postgres -l .local/postgres.log \
  -o "-p 55432 -h 127.0.0.1 -k $PWD/.local" start
npm run dev
```

Le fichier `.env` créé pour cette validation utilise `PGPORT=55432`. Pour une autre installation PostgreSQL, adapter ce port. Compose impose de son côté `db:5432` et ne dépend pas du serveur natif.

Pour arrêter uniquement l’instance de test, après avoir arrêté le frontend/backend locaux :

```sh
pg_ctl -D .local/postgres stop -m fast
```

Ne pas supprimer le dossier pour un simple arrêt : il contient l’historique utilisé dans les preuves. `.local/` n’est jamais publié sur GitHub ni copié dans les images.

-- Exécuté automatiquement par PostgreSQL uniquement sur un volume vide.
CREATE TABLE IF NOT EXISTS searches (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  city VARCHAR(200) NOT NULL,
  country VARCHAR(200) NOT NULL,
  searched_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS searches_recent_idx ON searches (searched_at DESC, id DESC);

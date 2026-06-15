#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
  DO \$\$
  BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'fidelizza_app') THEN
      CREATE ROLE fidelizza_app LOGIN PASSWORD '${POSTGRES_APP_PASSWORD:-fidelizza_app}';
    END IF;
  END\$\$;

  GRANT CONNECT ON DATABASE fidelizza TO fidelizza_app;
  GRANT USAGE ON SCHEMA public TO fidelizza_app;

  ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO fidelizza_app;
  ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT USAGE, SELECT ON SEQUENCES TO fidelizza_app;
EOSQL

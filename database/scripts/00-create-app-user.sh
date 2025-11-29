#!/bin/bash
set -euo pipefail

DB_NAME="${MYSQL_DATABASE:-template_db}"

if [[ -z "${APP_DB_USER:-}" || -z "${APP_DB_PASSWORD:-}" ]]; then
  echo "APP_DB_USER and APP_DB_PASSWORD must be set for database initialization." >&2
  exit 1
fi

# MariaDB client binary is `mariadb` in the official image (mysql alias may not exist)
mariadb --protocol=socket -uroot -p"${MYSQL_ROOT_PASSWORD}" <<-EOSQL
CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;
CREATE USER IF NOT EXISTS '${APP_DB_USER}'@'%' IDENTIFIED BY '${APP_DB_PASSWORD}';
GRANT SELECT, INSERT, UPDATE, DELETE ON \`${DB_NAME}\`.* TO '${APP_DB_USER}'@'%';
FLUSH PRIVILEGES;
EOSQL

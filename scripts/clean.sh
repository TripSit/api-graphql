#!/usr/bin/env bash
set -euo pipefail

DB_CONTAINER_NAME="tripsit_api_db"
root_dir="$(dirname "${0}")/.."

# Remove Docker containers
containers="$(docker ps -qaf name=${DB_CONTAINER_NAME})"
if [[ ! -z "${containers}" ]]; then
  echo "Removing Docker containers..."
  [[ ! -z "$(docker ps -qf name=${DB_CONTAINER_NAME})" ]] \
    && docker stop "${containers}"
  docker rm "${containers}"
fi

# Remove Docker volumes
volumes="$(docker volume ls -qf name=tripsit_api_gql_psql)"
if [[ ! -z "${volumes}" ]]; then
  echo "Removing Docker volumes..."
  docker volume rm "${volumes}"
fi

echo "Removing node_modules and reinstall..."
rm -rf "${root_dir}/node_modules"
npm i

echo "Creating containers..."
docker-compose up -d

echo "Setting databases up..."
npx knex migrate:latest
knex seed:run

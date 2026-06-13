#!/usr/bin/env bash
set -e

echo "===== IADS Backend Production Startup ====="

cd "$(dirname "$0")/.."

echo "Running database migrations..."
node build/bin/console.js migration:run --force

echo "Starting HTTP server..."
exec node build/bin/server.js

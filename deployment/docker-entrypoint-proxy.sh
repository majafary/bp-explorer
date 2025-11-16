#!/bin/sh
set -e

# Substitute environment variables in nginx config
envsubst '${STRUCTURIZR_HOST} ${STRUCTURIZR_PORT} ${CORS_ORIGIN}' \
  < /etc/nginx/nginx.conf.template \
  > /etc/nginx/nginx.conf

echo "Nginx proxy configured:"
echo "  STRUCTURIZR_HOST: ${STRUCTURIZR_HOST}"
echo "  STRUCTURIZR_PORT: ${STRUCTURIZR_PORT}"
echo "  CORS_ORIGIN: ${CORS_ORIGIN}"

# Execute the CMD
exec "$@"

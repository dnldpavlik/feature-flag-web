#!/bin/sh
# Replaces the build-time Keycloak URL placeholder in the Angular JS bundle
# with the runtime KEYCLOAK_URL environment variable.

if [ -z "$KEYCLOAK_URL" ]; then
  echo >&2 "ERROR: KEYCLOAK_URL environment variable is not set"
  exit 1
fi

find /usr/share/nginx/html -name '*.js' -exec \
  sed -i "s|https://KEYCLOAK_URL_NOT_SET|${KEYCLOAK_URL}|g" {} +

echo "Substituted Keycloak URL: $KEYCLOAK_URL"

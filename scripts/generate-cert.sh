#!/usr/bin/env bash
# Generates a self-signed TLS certificate for local development.
# Requires OpenSSL. Run from the project root: bash scripts/generate-cert.sh

set -euo pipefail

CERT_DIR="./certs"
mkdir -p "$CERT_DIR"

MSYS_NO_PATHCONV=1 openssl req -x509 \
  -newkey rsa:4096 \
  -keyout "$CERT_DIR/server.key" \
  -out    "$CERT_DIR/server.crt" \
  -days   365 \
  -nodes \
  -subj   "//CN=localhost" \
  -addext "subjectAltName=DNS:localhost,DNS:*.localhost,IP:127.0.0.1"

echo ""
echo "Certificate generated:"
echo "  Key:  $CERT_DIR/server.key"
echo "  Cert: $CERT_DIR/server.crt"
echo ""
echo "Valid until: $(openssl x509 -in $CERT_DIR/server.crt -noout -enddate | cut -d= -f2)"

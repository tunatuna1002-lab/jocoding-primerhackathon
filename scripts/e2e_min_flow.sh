#!/usr/bin/env bash
set -euo pipefail

echo "[e2e-min-flow] placeholders only: add scripted flow using curl against /health and create endpoints"
echo "1) users-svc /health"
echo "2) inputs-svc /health"
echo "3) core-svc /health"
echo "4) create claim/evidence/provenance transaction"
echo "5) create variant"
echo "6) create export-version"

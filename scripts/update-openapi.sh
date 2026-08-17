#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCAN_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
NODE_IMAGE="${NODE_IMAGE:-goldenera-node:sandbox-local}"
POSTGRES_IMAGE="${POSTGRES_IMAGE:-postgres:18.1-alpine}"
RUN_ID="$$-${RANDOM}"
NETWORK_NAME="goldenera-openapi-${RUN_ID}"
POSTGRES_CONTAINER="goldenera-openapi-postgres-${RUN_ID}"
NODE_CONTAINER="goldenera-openapi-node-${RUN_ID}"
TMP_DIR="$(mktemp -d)"
OPENAPI_TMP="$TMP_DIR/explorer-v1.json"
LOG_PID=""

cleanup() {
  if [ -n "$LOG_PID" ]; then
    kill "$LOG_PID" >/dev/null 2>&1 || true
    wait "$LOG_PID" >/dev/null 2>&1 || true
  fi
  docker rm -f "$NODE_CONTAINER" "$POSTGRES_CONTAINER" >/dev/null 2>&1 || true
  docker network rm "$NETWORK_NAME" >/dev/null 2>&1 || true
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT INT TERM

command -v docker >/dev/null || {
  echo "ERROR: docker is required" >&2
  exit 1
}
command -v curl >/dev/null || {
  echo "ERROR: curl is required" >&2
  exit 1
}
command -v openssl >/dev/null || {
  echo "ERROR: openssl is required" >&2
  exit 1
}
command -v pnpm >/dev/null || {
  echo "ERROR: pnpm is required" >&2
  exit 1
}
docker image inspect "$NODE_IMAGE" >/dev/null || {
  echo "ERROR: local node image not found: $NODE_IMAGE" >&2
  echo "Build it in goldenera-node with scripts/build-sandbox-image.sh." >&2
  exit 1
}
docker image inspect "$POSTGRES_IMAGE" >/dev/null || {
  echo "ERROR: local PostgreSQL image not found: $POSTGRES_IMAGE" >&2
  exit 1
}

HMAC_SECRET="$(openssl rand -base64 32)"
AES_SECRET="$(openssl rand -base64 32)"

docker network create "$NETWORK_NAME" >/dev/null
docker run -d --name "$POSTGRES_CONTAINER" --network "$NETWORK_NAME" \
  -e POSTGRES_DB=node_db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  "$POSTGRES_IMAGE" >/dev/null

for _ in $(seq 1 60); do
  if docker exec "$POSTGRES_CONTAINER" pg_isready -U postgres -d node_db >/dev/null 2>&1; then
    break
  fi
  if [ "$(docker inspect -f '{{.State.Running}}' "$POSTGRES_CONTAINER")" != "true" ]; then
    docker logs "$POSTGRES_CONTAINER" >&2
    exit 1
  fi
  sleep 1
done

if ! docker exec "$POSTGRES_CONTAINER" pg_isready -U postgres -d node_db >/dev/null 2>&1; then
  docker logs "$POSTGRES_CONTAINER" >&2
  echo "ERROR: PostgreSQL did not become ready" >&2
  exit 1
fi

docker run -d --name "$NODE_CONTAINER" --network "$NETWORK_NAME" \
  -p 127.0.0.1::8080 \
  -e SPRING_PROFILES_ACTIVE=prod \
  -e LISTEN_PORT=8080 \
  -e POSTGRESQL_ENABLE=true \
  -e EXPLORER_ENABLE=true \
  -e WEBHOOK_ENABLE=false \
  -e POSTGRESQL_HOST="$POSTGRES_CONTAINER" \
  -e POSTGRESQL_PORT=5432 \
  -e POSTGRESQL_DB_NAME=node_db \
  -e POSTGRESQL_USERNAME=postgres \
  -e POSTGRESQL_PASSWORD=postgres \
  -e NETWORK=TESTNET \
  -e BENEFICIARY_ADDRESS=0x0000000000000000000000000000000000000000 \
  -e NODE_IDENTITY_FILE=/tmp/goldenera-node/.node_identity \
  -e BLOCKCHAIN_DB_PATH=/tmp/goldenera-node/blockchain \
  -e PEER_REPUTATION_DB_PATH=/tmp/goldenera-node/peer-reputation \
  -e P2P_HOST=127.0.0.1 \
  -e P2P_PORT=9000 \
  -e DIRECTORY_PING_INTERVAL_IN_MS=30000 \
  -e GE_CORE_DIRECTORY_DISABLE=true \
  -e MEMPOOL_MAX_SIZE=1000 \
  -e MEMPOOL_EXPIRE_TX_IN_MINUTES=60 \
  -e MEMPOOL_MIN_ACCEPTABLE_FEE_IN_WEI=10 \
  -e MEMPOOL_MAX_NONCE_GAP_PER_SENDER=64 \
  -e MINING_ENABLE=false \
  -e MINING_HASHING_THREADS=1 \
  -e JAVA_HEAP_MB=1024 \
  -e ROCKSDB_DIRECT_READS=false \
  -e ROCKSDB_DIRECT_WRITES=false \
  -e SECURITY_HMAC_SECRET="$HMAC_SECRET" \
  -e SECURITY_AES_GCM_SECRET="$AES_SECRET" \
  -e SECURITY_CORE_API_ENABLED=false \
  -e SECURITY_EXPLORER_API_ENABLED=false \
  -e ADMIN_USERNAME=admin \
  -e ADMIN_PASSWORD=openapi-local-only \
  -e LOGGING_DIR=/tmp/goldenera-node/logs \
  -e LOGGING_FILE=openapi.log \
  -e LOGGING_LEVEL_ROOT=INFO \
  -e LOGGING_LEVEL_GLOBAL_GOLDENERA=INFO \
  -e THROTTLING_GLOBAL_CAPACITY=500 \
  -e THROTTLING_GLOBAL_REFILL_TOKENS=500 \
  -e THROTTLING_PUBLIC_CORE_CAPACITY=100 \
  -e THROTTLING_PUBLIC_CORE_REFILL_TOKENS=100 \
  -e THROTTLING_API_KEY_DEFAULT_CAPACITY=500 \
  -e THROTTLING_API_KEY_DEFAULT_REFILL_TOKENS=500 \
  -e THROTTLING_API_KEY_EXPLORER_CAPACITY=500 \
  -e THROTTLING_API_KEY_EXPLORER_REFILL_TOKENS=500 \
  -e THROTTLING_P2P_CAPACITY=1000 \
  -e THROTTLING_P2P_REFILL_TOKENS=1000 \
  "$NODE_IMAGE" >/dev/null

echo "Following node container logs while OpenAPI is generated..."
docker logs -f "$NODE_CONTAINER" &
LOG_PID=$!

HOST_PORT="$(docker port "$NODE_CONTAINER" 8080/tcp | sed -E 's/.*:([0-9]+)$/\1/')"
OPENAPI_URL="http://127.0.0.1:${HOST_PORT}/v3/api-docs/Explorer%20API"

for _ in $(seq 1 180); do
  if curl -fsS -H 'Host: 127.0.0.1:18080' "$OPENAPI_URL" -o "$OPENAPI_TMP"; then
    break
  fi
  if [ "$(docker inspect -f '{{.State.Running}}' "$NODE_CONTAINER")" != "true" ]; then
    wait "$LOG_PID" || true
    LOG_PID=""
    echo "ERROR: node container stopped before OpenAPI became available" >&2
    exit 1
  fi
  sleep 1
done

if [ ! -s "$OPENAPI_TMP" ] || ! grep -q '"openapi"' "$OPENAPI_TMP"; then
  echo "ERROR: Explorer OpenAPI document was not downloaded" >&2
  exit 1
fi

mv "$OPENAPI_TMP" "$SCAN_DIR/explorer-v1.json"
(
  cd "$SCAN_DIR"
  pnpm gen:api
)

echo "Updated explorer-v1.json and regenerated src/api/gen from $NODE_IMAGE"

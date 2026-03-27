#!/bin/bash
set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

export PATH=$HOME/.linkerd2/bin:$PATH

PIDS=()
cleanup() {
  for pid in "${PIDS[@]}"; do kill "$pid" 2>/dev/null || true; done
  kubectl delete pod cross-tenant-test -n tenant-acme --force 2>/dev/null || true
}
trap cleanup EXIT

echo -e "${BLUE}=== Tenant Isolation Test ===${NC}\n"
echo -e "${BLUE}Scenario: Acme Electronics vs Fresh Foods${NC}\n"

# Port-forward both product services
kubectl port-forward -n tenant-acme svc/acme-ecommerce-product-service 9001:80 &>/dev/null &
PIDS+=($!)
kubectl port-forward -n tenant-fresh svc/fresh-ecommerce-product-service 9002:80 &>/dev/null &
PIDS+=($!)
sleep 3

# --- Test 1: Create data in each tenant ---
echo -e "${YELLOW}Test 1: Create products in each tenant${NC}"

echo -e "${BLUE}  Creating 'Gaming Laptop' in Acme...${NC}"
ACME_PRODUCT=$(curl -s -X POST http://localhost:9001/ \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Id: acme" \
  -d '{"name":"Gaming Laptop","price":1299.99,"stock":25}')
echo "  $ACME_PRODUCT"

echo -e "${BLUE}  Creating 'Organic Apples' in Fresh Foods...${NC}"
FRESH_PRODUCT=$(curl -s -X POST http://localhost:9002/ \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Id: fresh" \
  -d '{"name":"Organic Apples","price":4.99,"stock":500}')
echo "  $FRESH_PRODUCT"

# --- Test 2: Verify data isolation ---
echo -e "\n${YELLOW}Test 2: Verify data isolation${NC}"

ACME_PRODUCTS=$(curl -s -H "X-Tenant-Id: acme" http://localhost:9001/)
FRESH_PRODUCTS=$(curl -s -H "X-Tenant-Id: fresh" http://localhost:9002/)

ACME_COUNT=$(echo "$ACME_PRODUCTS" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null)
FRESH_COUNT=$(echo "$FRESH_PRODUCTS" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null)

echo -e "  Acme products: ${ACME_COUNT}"
echo -e "  Fresh products: ${FRESH_COUNT}"

ACME_HAS_APPLES=$(echo "$ACME_PRODUCTS" | python3 -c "import sys,json; items=json.load(sys.stdin); print(any('Apples' in i.get('name','') for i in items))" 2>/dev/null)
FRESH_HAS_LAPTOP=$(echo "$FRESH_PRODUCTS" | python3 -c "import sys,json; items=json.load(sys.stdin); print(any('Laptop' in i.get('name','') for i in items))" 2>/dev/null)

if [ "$ACME_HAS_APPLES" = "False" ]; then
  echo -e "  ${GREEN}PASS: Acme cannot see Fresh Foods' products${NC}"
else
  echo -e "  ${RED}FAIL: Acme can see Fresh Foods' products!${NC}"
fi

if [ "$FRESH_HAS_LAPTOP" = "False" ]; then
  echo -e "  ${GREEN}PASS: Fresh Foods cannot see Acme's products${NC}"
else
  echo -e "  ${RED}FAIL: Fresh Foods can see Acme's products!${NC}"
fi

# --- Test 3: Cross-namespace network call ---
echo -e "\n${YELLOW}Test 3: Cross-namespace network call (pod in tenant-acme → tenant-fresh service)${NC}"
echo -e "${BLUE}  Launching test pod in tenant-acme namespace...${NC}"

kubectl run cross-tenant-test -n tenant-acme \
  --image=curlimages/curl:latest \
  --restart=Never \
  --command -- sleep 30 2>/dev/null || true

kubectl wait --for=condition=Ready pod/cross-tenant-test -n tenant-acme --timeout=30s 2>/dev/null

echo -e "${BLUE}  Attempting curl from tenant-acme pod to tenant-fresh product-service...${NC}"
CROSS_RESULT=$(kubectl exec -n tenant-acme cross-tenant-test -- \
  curl -s -o /dev/null -w "%{http_code}" \
  --max-time 5 \
  "http://fresh-ecommerce-product-service.tenant-fresh.svc.cluster.local/" \
  -H "X-Tenant-Id: fresh" 2>&1 || echo "BLOCKED")

if [[ "$CROSS_RESULT" == "BLOCKED" ]] || [[ "$CROSS_RESULT" == "000" ]] || [[ "$CROSS_RESULT" == "403" ]]; then
  echo -e "  ${GREEN}PASS: Cross-tenant call BLOCKED (result: ${CROSS_RESULT})${NC}"
else
  echo -e "  ${RED}FAIL: Cross-tenant call succeeded with HTTP ${CROSS_RESULT}${NC}"
  echo -e "  ${YELLOW}(NetworkPolicy may need a CNI that supports it, e.g., Calico)${NC}"
fi

# --- Test 4: Linkerd mesh stats ---
echo -e "\n${YELLOW}Test 4: Linkerd mesh stats per tenant${NC}"

echo -e "${BLUE}  Acme Electronics:${NC}"
linkerd viz stat deploy -n tenant-acme 2>/dev/null || echo "  (no traffic yet)"

echo -e "\n${BLUE}  Fresh Foods:${NC}"
linkerd viz stat deploy -n tenant-fresh 2>/dev/null || echo "  (no traffic yet)"

echo -e "\n${GREEN}=== Isolation test complete! ===${NC}"

#!/bin/bash
set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

RELEASE=${1:-ecommerce}
PIDS=()

cleanup() {
  echo -e "\n${BLUE}Cleaning up port-forwards...${NC}"
  for pid in "${PIDS[@]}"; do
    kill "$pid" 2>/dev/null || true
  done
}
trap cleanup EXIT

echo -e "${BLUE}=== E-Commerce Multi-Tenant Playground ===${NC}\n"

# Start port-forwards
echo -e "${BLUE}Setting up port-forwards...${NC}"
kubectl port-forward "svc/${RELEASE}-cart-service" 8001:80 &>/dev/null &
PIDS+=($!)
kubectl port-forward "svc/${RELEASE}-customer-service" 8002:80 &>/dev/null &
PIDS+=($!)
kubectl port-forward "svc/${RELEASE}-order-service" 8003:80 &>/dev/null &
PIDS+=($!)
kubectl port-forward "svc/${RELEASE}-product-service" 8004:80 &>/dev/null &
PIDS+=($!)
kubectl port-forward "svc/${RELEASE}-product-reviews-service" 8005:80 &>/dev/null &
PIDS+=($!)
sleep 3

call() {
  local method=$1 url=$2 data=$3 label=$4 tenant=$5
  echo -e "${BLUE}[$method] $label${NC}"
  local headers="-H \"Content-Type: application/json\" -H \"X-Tenant-Id: $tenant\""
  if [ -n "$data" ]; then
    RESPONSE=$(eval curl -s -w '"\n%{http_code}"' -X "$method" "$url" $headers -d "'$data'")
  else
    RESPONSE=$(eval curl -s -w '"\n%{http_code}"' -X "$method" "$url" $headers)
  fi
  HTTP_CODE=$(echo "$RESPONSE" | tail -1)
  BODY=$(echo "$RESPONSE" | sed '$d')
  if [[ "$HTTP_CODE" =~ ^2 ]]; then
    echo -e "${GREEN}  Status: $HTTP_CODE${NC}"
  else
    echo -e "${RED}  Status: $HTTP_CODE${NC}"
  fi
  echo "  $BODY"
  echo ""
}

run_tenant_flow() {
  local TENANT=$1
  echo -e "${YELLOW}========================================${NC}"
  echo -e "${YELLOW}  Running flow for: $TENANT${NC}"
  echo -e "${YELLOW}========================================${NC}\n"

  # 1. Create a product
  echo -e "${BLUE}--- Product Service (localhost:8004) ---${NC}"
  call POST http://localhost:8004/ '{"name":"Wireless Headphones","price":79.99,"stock":50}' "Create product" "$TENANT"
  PRODUCT_ID=$(curl -s -H "X-Tenant-Id: $TENANT" http://localhost:8004/ | python3 -c "import sys,json; items=json.load(sys.stdin); print(items[-1]['_id'])" 2>/dev/null)
  echo -e "  Captured PRODUCT_ID: $PRODUCT_ID\n"

  # 2. Create a customer
  echo -e "${BLUE}--- Customer Service (localhost:8002) ---${NC}"
  call POST http://localhost:8002/ '{"name":"Jane Doe"}' "Create customer" "$TENANT"
  CUSTOMER_ID=$(curl -s -H "X-Tenant-Id: $TENANT" http://localhost:8002/ | python3 -c "import sys,json; items=json.load(sys.stdin); print(items[-1]['_id'])" 2>/dev/null)
  echo -e "  Captured CUSTOMER_ID: $CUSTOMER_ID\n"

  # 3. Create a cart and add item
  echo -e "${BLUE}--- Cart Service (localhost:8001) ---${NC}"
  call POST http://localhost:8001/ '{"uuid":"playground-cart","items":[]}' "Create cart" "$TENANT"
  CART_ID=$(curl -s -H "X-Tenant-Id: $TENANT" http://localhost:8001/ | python3 -c "import sys,json; items=json.load(sys.stdin); print(items[-1]['_id'])" 2>/dev/null)
  echo -e "  Captured CART_ID: $CART_ID\n"
  call PUT "http://localhost:8001/addItem/$CART_ID" "{\"name\":\"Wireless Headphones\",\"price\":79.99,\"quantity\":2,\"productId\":\"$PRODUCT_ID\"}" "Add item to cart" "$TENANT"

  # 4. Create an order
  echo -e "${BLUE}--- Order Service (localhost:8003) ---${NC}"
  call POST http://localhost:8003/ "{\"customerId\":\"$CUSTOMER_ID\",\"items\":[{\"productId\":\"$PRODUCT_ID\",\"quantity\":2}],\"total\":159.98}" "Create order" "$TENANT"

  # 5. Create a product review
  echo -e "${BLUE}--- Product Reviews Service (localhost:8005) ---${NC}"
  call POST http://localhost:8005/ "{\"productId\":\"$PRODUCT_ID\",\"customerId\":\"$CUSTOMER_ID\",\"rating\":5,\"comment\":\"Amazing!\"}" "Create review" "$TENANT"
  call GET "http://localhost:8005/product/$PRODUCT_ID" "" "Get reviews by product" "$TENANT"
}

# Run flow for both tenants
run_tenant_flow "tenant-a"
run_tenant_flow "tenant-b"

# Demonstrate isolation
echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  Verifying Tenant Isolation${NC}"
echo -e "${YELLOW}========================================${NC}\n"

echo -e "${BLUE}Tenant A's products:${NC}"
curl -s -H "X-Tenant-Id: tenant-a" http://localhost:8004/ | python3 -c "import sys,json; items=json.load(sys.stdin); print(f'  Count: {len(items)}')"
echo -e "${BLUE}Tenant B's products:${NC}"
curl -s -H "X-Tenant-Id: tenant-b" http://localhost:8004/ | python3 -c "import sys,json; items=json.load(sys.stdin); print(f'  Count: {len(items)}')"
echo -e "\n${GREEN}=== Data is isolated per tenant! ===${NC}"

echo -e "\n${GREEN}=== Playground complete! ===${NC}"

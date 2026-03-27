#!/bin/bash
set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

CHART_DIR="./helm/ecommerce"

echo -e "${BLUE}=== ShopHost Multi-Tenant Deployment ===${NC}"
echo -e "${BLUE}Deploying 2 isolated tenants with Linkerd mesh enforcement${NC}\n"

# Ensure Linkerd is installed
if ! command -v linkerd &>/dev/null; then
  export PATH=$HOME/.linkerd2/bin:$PATH
fi

if ! linkerd version &>/dev/null 2>&1; then
  echo -e "${YELLOW}Linkerd CLI not found. Run ./scripts/install-linkerd.sh first.${NC}"
  exit 1
fi

# Remove old single-namespace deployment if present
echo -e "${BLUE}Cleaning up old single-namespace deployment...${NC}"
helm uninstall ecommerce 2>/dev/null || true
helm uninstall mongodb 2>/dev/null || true

deploy_tenant() {
  local TENANT=$1
  local NS="tenant-${TENANT}"

  echo -e "\n${YELLOW}========================================${NC}"
  echo -e "${YELLOW}  Deploying tenant: ${TENANT} (namespace: ${NS})${NC}"
  echo -e "${YELLOW}========================================${NC}\n"

  # Create namespace with Linkerd annotation
  kubectl create namespace "$NS" 2>/dev/null || true
  kubectl annotate namespace "$NS" linkerd.io/inject=enabled --overwrite

  # Deploy MongoDB for this tenant
  echo -e "${BLUE}  Installing MongoDB for ${TENANT}...${NC}"
  helm install "mongodb-${TENANT}" bitnami/mongodb \
    --namespace "$NS" \
    --set "auth.databases={ecommerce}" \
    --set "auth.usernames={ecomuser}" \
    --set "auth.passwords={ecompass}" \
    --set persistence.size=1Gi \
    --wait --timeout 120s 2>&1 | tail -1

  # Deploy ecommerce stack
  echo -e "${BLUE}  Installing ecommerce stack for ${TENANT}...${NC}"
  helm install "$TENANT" "$CHART_DIR" \
    --namespace "$NS" \
    --set "mongodb.uri=mongodb://ecomuser:ecompass@mongodb-${TENANT}.${NS}.svc.cluster.local:27017/ecommerce" \
    --set cartService.image.pullPolicy=Never \
    --set customerService.image.pullPolicy=Never \
    --set orderService.image.pullPolicy=Never \
    --set productService.image.pullPolicy=Never \
    --set productReviewsService.image.pullPolicy=Never \
    --set dashboard.image.pullPolicy=Never \
    --set linkerd.enabled=true \
    --set linkerd.authPolicy.enabled=true \
    --set networkPolicy.enabled=true \
    --set monitoring.serviceMonitor.enabled=false \
    2>&1 | tail -1

  # Wait for rollout
  echo -e "${BLUE}  Waiting for pods to be ready...${NC}"
  kubectl rollout status deployment/${TENANT}-ecommerce-cart-service -n "$NS" --timeout=120s 2>&1 | tail -1
  kubectl rollout status deployment/${TENANT}-ecommerce-product-service -n "$NS" --timeout=120s 2>&1 | tail -1
  kubectl rollout status deployment/${TENANT}-ecommerce-dashboard -n "$NS" --timeout=120s 2>&1 | tail -1

  echo -e "${GREEN}  Tenant ${TENANT} deployed successfully!${NC}"
}

# Deploy both tenants
deploy_tenant "acme"
deploy_tenant "fresh"

echo -e "\n${GREEN}=== Both tenants deployed! ===${NC}\n"

echo "Access Acme Electronics dashboard:"
echo "  kubectl port-forward -n tenant-acme svc/acme-ecommerce-dashboard 8080:80"
echo "  Open http://localhost:8080"
echo ""
echo "Access Fresh Foods dashboard:"
echo "  kubectl port-forward -n tenant-fresh svc/fresh-ecommerce-dashboard 8081:80"
echo "  Open http://localhost:8081"
echo ""
echo "View mesh stats:"
echo "  linkerd viz stat deploy -n tenant-acme"
echo "  linkerd viz stat deploy -n tenant-fresh"
echo ""
echo "Test isolation:"
echo "  ./scripts/test-isolation.sh"

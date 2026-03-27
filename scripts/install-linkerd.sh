#!/bin/bash
set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=== Installing Linkerd Service Mesh ===${NC}\n"

# Install Linkerd CLI if not present
if ! command -v linkerd &> /dev/null; then
  echo -e "${BLUE}Installing Linkerd CLI...${NC}"
  curl -fsL https://run.linkerd.io/install | sh
  export PATH=$HOME/.linkerd2/bin:$PATH
  echo 'export PATH=$HOME/.linkerd2/bin:$PATH' >> ~/.zshrc
fi

# Pre-check
echo -e "${BLUE}Running pre-installation checks...${NC}"
linkerd check --pre

# Install CRDs
echo -e "${BLUE}Installing Linkerd CRDs...${NC}"
linkerd install --crds | kubectl apply -f -

# Install control plane
echo -e "${BLUE}Installing Linkerd control plane...${NC}"
linkerd install | kubectl apply -f -

# Wait for control plane
echo -e "${BLUE}Waiting for control plane to be ready...${NC}"
linkerd check

# Install Viz extension (dashboard, metrics, tap)
echo -e "${BLUE}Installing Linkerd Viz extension...${NC}"
linkerd viz install | kubectl apply -f -

echo -e "${BLUE}Waiting for Viz extension to be ready...${NC}"
linkerd viz check

echo -e "\n${GREEN}=== Linkerd installed successfully! ===${NC}"
echo ""
echo "Open the Linkerd dashboard:"
echo "  linkerd viz dashboard"
echo ""
echo "View mesh stats:"
echo "  linkerd viz stat deploy"
echo ""
echo "Watch live traffic:"
echo "  linkerd viz tap deploy/<deployment-name>"

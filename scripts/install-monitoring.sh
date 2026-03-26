#!/bin/bash
set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=== Installing Prometheus + Grafana ===${NC}\n"

# Add Helm repo
echo -e "${BLUE}Adding prometheus-community Helm repo...${NC}"
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts 2>/dev/null || true
helm repo update

# Create namespace
kubectl create namespace monitoring 2>/dev/null || true

# Install kube-prometheus-stack
echo -e "${BLUE}Installing kube-prometheus-stack...${NC}"
helm install kube-prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --set prometheus.prometheusSpec.serviceMonitorSelectorNilUsesHelmValues=false \
  --set alertmanager.enabled=false \
  --set grafana.adminPassword=admin \
  --set grafana.service.type=ClusterIP

echo -e "\n${GREEN}=== Monitoring stack installed! ===${NC}"
echo ""
echo "Access Prometheus:"
echo "  kubectl port-forward -n monitoring svc/kube-prometheus-prometheus 9090:9090"
echo "  Open http://localhost:9090"
echo ""
echo "Access Grafana:"
echo "  kubectl port-forward -n monitoring svc/kube-prometheus-grafana 3000:80"
echo "  Open http://localhost:3000 (admin/admin)"

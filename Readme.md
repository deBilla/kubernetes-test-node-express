# E-Commerce Microservices Backend

A multi-tenant, microservices-based e-commerce backend built with Node.js, Express, TypeScript, MongoDB, and RabbitMQ. Deployed on Kubernetes via Helm with Linkerd service mesh, OpenTelemetry observability, and a React ERP dashboard.

## Services

| Service | Port | Description |
|---------|------|-------------|
| Cart Service | 3003 | Shopping cart management, publishes events to RabbitMQ |
| Customer Service | 3004 | Customer CRUD operations |
| Order Service | 3005 | Order management |
| Product Service | 3006 | Product catalog, consumes cart events from RabbitMQ |
| Product Reviews Service | 3007 | Product reviews and ratings |
| Dashboard | 3010 | React ERP dashboard (nginx + reverse proxy) |

## Prerequisites

- Node.js 20+
- Docker Desktop
- kubectl
- Helm 3+
- kind (for local Kubernetes)

## Quick Start (Multi-Tenant)

The fastest way to get everything running with full tenant isolation:

```bash
# 1. Create cluster
kind create cluster --name ecommerce

# 2. Build and load all images
docker build -t debilla/node-cart-service-test:latest ./cart-service
docker build -t debilla/node-customer-service-test:latest ./customer-service
docker build -t debilla/node-order-service-test:latest ./order-service
docker build -t debilla/node-product-service-test:latest ./product-service
docker build -t debilla/node-product-reviews-service-test:latest ./product-reviews-service
docker build -t debilla/ecommerce-dashboard:latest ./dashboard

kind load docker-image debilla/node-cart-service-test:latest \
  debilla/node-customer-service-test:latest \
  debilla/node-order-service-test:latest \
  debilla/node-product-service-test:latest \
  debilla/node-product-reviews-service-test:latest \
  debilla/ecommerce-dashboard:latest \
  --name ecommerce

# 3. Install Linkerd
./scripts/install-linkerd.sh

# 4. Deploy both tenants (Acme Electronics + Fresh Foods)
./scripts/deploy-tenants.sh

# 5. Install monitoring
./scripts/install-monitoring.sh

# 6. Access dashboards
kubectl port-forward -n tenant-acme svc/acme-ecommerce-dashboard 8080:80
kubectl port-forward -n tenant-fresh svc/fresh-ecommerce-dashboard 8081:80
```

- **Acme Electronics**: http://localhost:8080
- **Fresh Foods**: http://localhost:8081

## Multi-Tenancy

### Namespace-Per-Tenant (Production Model)

Each tenant gets a fully isolated namespace with their own services, database, and message queue. Linkerd enforces mTLS and authorization policies to block cross-tenant communication.

```bash
# Deploy both tenants
./scripts/deploy-tenants.sh

# Verify isolation
./scripts/test-isolation.sh
```

### Header-Based (Application Layer)

All services also support `X-Tenant-Id` header-based isolation at the database level. Every document includes a `tenantId` field and all queries are scoped.

```bash
curl -H "X-Tenant-Id: tenant-a" http://localhost:8004/
```

## React Dashboard

An ERP-style dashboard with:
- Sidebar navigation (Dashboard, Products, Customers, Carts, Orders, Reviews)
- Guided workflow: Create Product -> Customer -> Cart -> Add Items -> Order -> Review
- Full data tables with detail panels
- Tenant badge showing which tenant the dashboard belongs to

## Service Mesh (Linkerd)

```bash
linkerd viz dashboard              # Open dashboard
linkerd viz stat deploy -n tenant-acme   # View mesh stats
linkerd viz tap deploy/acme-ecommerce-cart-service -n tenant-acme  # Live traffic
```

## Monitoring (Prometheus + Grafana)

```bash
# Install
./scripts/install-monitoring.sh

# Grafana (admin/admin)
kubectl port-forward -n monitoring svc/kube-prometheus-grafana 3000:80
```

Open http://localhost:3000 -> Dashboards -> **E-Commerce Services** for:
- Request rate by service
- P95 latency by service
- Total requests by route (health probes excluded)
- Status code distribution
- Traffic per tenant namespace

## Running Tests

```bash
cd product-reviews-service
npm test  # 11 tests
```

## Scripts

| Script | Purpose |
|--------|---------|
| `scripts/deploy-tenants.sh` | Deploy 2 isolated tenants (Acme + Fresh) |
| `scripts/test-isolation.sh` | Verify cross-tenant isolation |
| `scripts/install-linkerd.sh` | Install Linkerd CLI + control plane + Viz |
| `scripts/install-monitoring.sh` | Install Prometheus + Grafana |
| `scripts/playground.sh` | End-to-end curl test for all services |

## Architecture

- **Multi-Tenancy**: Namespace-per-tenant with Linkerd mTLS + AuthorizationPolicy + NetworkPolicy
- **Helm Chart**: Single chart deployed per tenant (`helm/ecommerce/`)
- **Dashboard**: React + nginx reverse proxy, containerized per tenant
- **OpenTelemetry**: Auto-instrumented metrics on all services (port 9464)
- **Linkerd**: Service mesh with mTLS, identity-based auth, traffic observability
- **RabbitMQ**: Event-driven communication (cart -> product stock updates)
- **MongoDB**: Isolated instance per tenant (Bitnami Helm chart)
- **Grafana**: Custom "E-Commerce Services" dashboard with per-tenant traffic views
- **Health Checks**: Dedicated `/health` endpoint (excluded from metrics)

## Blog Post

See [blog/building-multi-tenant-microservices-on-kubernetes.md](blog/building-multi-tenant-microservices-on-kubernetes.md) for a detailed technical write-up comparing this architecture with Slack, Shopify, and AWS approaches.

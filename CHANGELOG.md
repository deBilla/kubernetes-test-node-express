# Changelog

## [Unreleased]

### Added
- **Namespace-Per-Tenant Isolation**: Full physical isolation with Linkerd enforcement
  - `scripts/deploy-tenants.sh` deploys 2 tenants (Acme Electronics, Fresh Foods) in separate namespaces
  - `scripts/test-isolation.sh` validates cross-tenant communication is blocked
  - Linkerd `Server` + `AuthorizationPolicy` + `MeshTLSAuthentication` CRDs restrict traffic to same-namespace only
  - Kubernetes `NetworkPolicy` for defense-in-depth (allows Prometheus scraping + DNS + Linkerd control plane)
  - `config.linkerd.io/skip-inbound-ports` annotation on metrics port for Prometheus access
- **React ERP Dashboard**: Full web UI for each tenant
  - Sidebar navigation: Dashboard, Products, Customers, Carts, Orders, Reviews
  - Stat cards with click-through to data tables
  - Guided workflow: Create Product -> Customer -> Cart -> Add Items -> Order -> Review
  - Detail panel on row click
  - Tenant badge auto-populated from Helm release name via nginx env var
  - nginx reverse proxy with `envsubst` templates for dynamic service hostnames (FQDN)
  - Multi-stage Dockerfile (node build + nginx serve)
  - Helm deployment + service templates
- **Grafana Dashboard**: Custom "E-Commerce Services" dashboard
  - Request rate by service (health probes excluded)
  - P95 latency by service
  - Total requests by route table
  - Status code distribution pie chart
  - Traffic per tenant namespace bar chart
  - Per-service route breakdown (cart, product)
  - Prometheus annotation-based pod scraping config (`scripts/prometheus-values.yaml`)
- **Multi-Tenancy**: Header-based tenant isolation across all 5 microservices
  - Express middleware extracts `X-Tenant-Id` header on every request
  - `tenantId` field added to all Mongoose models (Review, Cart, Customer, Order, Product)
  - All database queries filtered by tenantId for data isolation
  - Requests without `X-Tenant-Id` header return 400 error (health endpoint excluded)
- **Linkerd Service Mesh**: mTLS encryption and traffic observability
  - Install script at `scripts/install-linkerd.sh` (CLI, control plane, Viz extension)
  - Pod injection annotation (`linkerd.io/inject: enabled`) on all deployments
  - Toggleable via `linkerd.enabled` in Helm values
- **Blog Post**: Technical write-up at `blog/building-multi-tenant-microservices-on-kubernetes.md`
  - Covers architecture, Helm, OTel, Linkerd, dashboard, multi-tenant deployment
  - Comparison with Slack, Shopify, Salesforce, AWS multi-tenancy models

### Fixed
- **Cart Service**: `addItemToCart` now actually persists items to MongoDB via `$push` (was only publishing RabbitMQ event without saving)
- **Dashboard nginx**: Use `rewrite` to preserve sub-paths (e.g., `/api/carts/addItem/123` -> `/addItem/123`)
- **Dashboard nginx**: Use FQDN for service hostnames to work with kind's DNS resolver

## [0.1.0]

### Added
- **Product Reviews Service**: New microservice for product reviews and ratings (port 3007)
  - CRUD endpoints: create review, get all, get by ID, get by product ID
  - Mongoose model with rating (1-5), comment, productId, customerId
  - Unit tests with edge case coverage (11 tests)
- **Helm Chart**: Centralized Kubernetes deployment at `helm/ecommerce/`
  - Deployments, Services, ConfigMap, Secret for all 5 microservices
  - RabbitMQ StatefulSet with persistent storage
  - Ingress configuration (disabled by default)
  - ServiceMonitor CRDs for Prometheus integration
  - Security contexts on all containers (runAsNonRoot, no privilege escalation)
- **OpenTelemetry**: Auto-instrumentation on all 5 services
  - Prometheus metrics exporter on port 9464 (`/metrics`)
  - HTTP request duration histograms, MongoDB instrumentation
  - `OTEL_SERVICE_NAME` env var per service
- **Monitoring**: Prometheus + Grafana via kube-prometheus-stack
  - Install script at `scripts/install-monitoring.sh`
  - ServiceMonitors for automatic target discovery
- **Playground**: End-to-end test script (`scripts/playground.sh`)
- **Health Endpoints**: Dedicated `/health` route on all services for Kubernetes probes
- **Local MongoDB**: Support for `DB_URI` env var enabling local MongoDB alongside Atlas

### Fixed
- **Security**: Error responses no longer leak raw error objects/stack traces to clients
- **Bug**: Missing `await` on `viewCartById` in CartController
- **Naming**: Renamed `viewAllcarts` to `viewAllCarts` for consistent camelCase
- **Ports**: Corrected container ports in Kubernetes manifests (was hardcoded 3000)

### Removed
- Individual Kubernetes YAML manifests from each service directory (replaced by Helm chart)

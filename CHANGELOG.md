# Changelog

## [Unreleased]

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
  - Exercises all CRUD endpoints across all 5 services
  - Chains entity IDs across service calls
- **Health Endpoints**: Dedicated `/health` route on all services for Kubernetes probes
- **Local MongoDB**: Support for `DB_URI` env var enabling local MongoDB alongside Atlas

### Fixed
- **Security**: Error responses no longer leak raw error objects/stack traces to clients
- **Bug**: Missing `await` on `viewCartById` in CartController
- **Naming**: Renamed `viewAllcarts` to `viewAllCarts` for consistent camelCase
- **Ports**: Corrected container ports in Kubernetes manifests (was hardcoded 3000)

### Changed
- Health probes now use `/health` instead of `/` (avoids DB queries on every probe)
- Removed per-service `kubernetes/` directories in favor of centralized Helm chart
- Updated README with current architecture and deployment instructions

### Removed
- Individual Kubernetes YAML manifests from each service directory (replaced by Helm chart)

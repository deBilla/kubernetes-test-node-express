# E-Commerce Microservices Backend

A microservices-based e-commerce backend built with Node.js, Express, TypeScript, MongoDB, and RabbitMQ. Deployed on Kubernetes via Helm.

## Services

| Service | Port | Description |
|---------|------|-------------|
| Cart Service | 3003 | Shopping cart management, publishes events to RabbitMQ |
| Customer Service | 3004 | Customer CRUD operations |
| Order Service | 3005 | Order management |
| Product Service | 3006 | Product catalog, consumes cart events from RabbitMQ |
| Product Reviews Service | 3007 | Product reviews and ratings |

## Prerequisites

- Node.js 20+
- Docker Desktop
- kubectl
- Helm 3+
- kind (for local Kubernetes)

## Local Development

```bash
cd <service-name>
npm install
npm run dev
```

## Running Tests

```bash
cd product-reviews-service
npm test
```

## Deploy with Docker Compose

```bash
docker-compose up --build
```

## Deploy to Kubernetes (Local with kind)

### 1. Create a kind cluster

```bash
kind create cluster --name ecommerce
```

### 2. Build and load images

```bash
docker build -t debilla/node-cart-service-test:latest ./cart-service
docker build -t debilla/node-customer-service-test:latest ./customer-service
docker build -t debilla/node-order-service-test:latest ./order-service
docker build -t debilla/node-product-service-test:latest ./product-service
docker build -t debilla/node-product-reviews-service-test:latest ./product-reviews-service

kind load docker-image debilla/node-cart-service-test:latest debilla/node-customer-service-test:latest debilla/node-order-service-test:latest debilla/node-product-service-test:latest debilla/node-product-reviews-service-test:latest --name ecommerce
```

### 3. Install MongoDB

```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
helm install mongodb bitnami/mongodb \
  --set "auth.databases={ecommerce}" \
  --set "auth.usernames={ecomuser}" \
  --set "auth.passwords={ecompass}"
```

### 4. Deploy the application

```bash
helm install ecommerce ./helm/ecommerce \
  --set mongodb.uri="mongodb://ecomuser:ecompass@mongodb.default.svc.cluster.local:27017/ecommerce" \
  --set cartService.image.pullPolicy=Never \
  --set customerService.image.pullPolicy=Never \
  --set orderService.image.pullPolicy=Never \
  --set productService.image.pullPolicy=Never \
  --set productReviewsService.image.pullPolicy=Never
```

### 5. Install monitoring (Prometheus + Grafana)

```bash
./scripts/install-monitoring.sh
```

### 6. Run the playground

```bash
./scripts/playground.sh
```

## Accessing Services

```bash
kubectl port-forward svc/ecommerce-cart-service 8001:80
kubectl port-forward svc/ecommerce-customer-service 8002:80
kubectl port-forward svc/ecommerce-order-service 8003:80
kubectl port-forward svc/ecommerce-product-service 8004:80
kubectl port-forward svc/ecommerce-product-reviews-service 8005:80
```

## Monitoring

```bash
# Prometheus
kubectl port-forward -n monitoring svc/kube-prometheus-prometheus 9090:9090

# Grafana (admin/admin)
kubectl port-forward -n monitoring svc/kube-prometheus-grafana 3000:80
```

## Architecture

- **Helm Chart**: Centralized deployment at `helm/ecommerce/`
- **OpenTelemetry**: Auto-instrumented metrics on all services (port 9464, `/metrics`)
- **RabbitMQ**: Event-driven communication between cart and product services
- **MongoDB**: Shared database via MongoDB Atlas or local Bitnami Helm chart
- **Health Checks**: Dedicated `/health` endpoint on all services

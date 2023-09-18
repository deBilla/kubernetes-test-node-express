# Kubernetes deployment for a e-commerce backend using NodeJS and ExpressJS with Typescript

## Prerequisite
* NodeJS version 18 or higher
* Docker installed in the local environment
* Install minikube

## Running the Application
Go to each service, for example

```
cd product-service
```

```
npm install
```

```
npm run dev
```

## Building testing and pushing the docker image to docker hub

```
docker login
```

```
docker build -t <USER_NAME>/price-service .
```

```
docker run -p 3000:3000 <USER_NAME>/price-service
```

```
docker push <USER_NAME>/price-service
```

## Deploying to Kubernetes
```
minikube start
```

```
kubectl apply -f kubernetes/product-service-deployment.yaml 
```

```
kubectl apply -f kubernetes/product-service.yaml
```

```
minikube service product-service
```
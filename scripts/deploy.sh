#!/bin/bash

# Deploy NEXO to Kubernetes

set -e

echo "Deploying NEXO to Kubernetes..."

# Create namespace
kubectl apply -f k8s/namespace.yml

# Deploy services
kubectl apply -f k8s/postgres.yml
kubectl apply -f k8s/redis.yml
kubectl apply -f k8s/keycloak.yml
kubectl apply -f k8s/prometheus.yml
kubectl apply -f k8s/grafana.yml

# Build and push frontend image (assuming Docker registry)
# docker build -t nexo-frontend:latest nexo-prj/apps/nexo-prj/
# docker push nexo-frontend:latest

kubectl apply -f k8s/frontend.yml

echo "Deployment complete!"

# Get services
kubectl get services -n nexo
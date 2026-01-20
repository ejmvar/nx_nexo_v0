# NEXO Docker Setup

This document describes the Docker setup for the NEXO system, including local development with Docker Compose and production deployment with Kubernetes.

## Architecture

The system consists of the following services:

- **Frontend**: Next.js application
- **Backend**: (Planned) NestJS microservices
- **Database**: PostgreSQL
- **Cache**: Redis
- **Authentication**: Keycloak
- **Monitoring**: Prometheus and Grafana

## Local Development

### Prerequisites

- Docker and Docker Compose
- pnpm (for building the frontend)

### Running with Docker Compose

1. Navigate to the docker directory:
   ```bash
   cd docker
   ```

2. Start the services:
   ```bash
   docker-compose up -d
   ```

3. Access the services:
   - Frontend: http://localhost:3000
   - Keycloak: http://localhost:8080
   - Prometheus: http://localhost:9090
   - Grafana: http://localhost:3001

4. Stop the services:
   ```bash
   docker-compose down
   ```

### Development Mode

For development with hot reload, uncomment the volumes and command in `docker-compose.yml` for the frontend service.

## Production Deployment

### Kubernetes

1. Ensure you have a Kubernetes cluster running.

2. Build and push the frontend image:
   ```bash
   docker build -t your-registry/nexo-frontend:latest nexo-prj/apps/nexo-prj/
   docker push your-registry/nexo-frontend:latest
   ```

3. Update the image in `k8s/frontend.yml`.

4. Run the deployment script:
   ```bash
   ./scripts/deploy.sh
   ```

5. Access the services via LoadBalancer or Ingress.

### Scaling

- Scale services as needed with `kubectl scale`.
- Use Ingress for external access.
- Configure persistent volumes for data persistence.

## Raspberry Pi Compatibility

All images used are multi-architecture and support ARM64, making them compatible with Raspberry Pi.

## Monitoring

- Prometheus scrapes metrics from all services.
- Grafana provides dashboards for visualization.
- Access Grafana at http://localhost:3001 (dev) or via K8s service.

## Security Notes

- Change default passwords in production.
- Use secrets management for sensitive data.
- Configure TLS/HTTPS for production.

## Troubleshooting

- Check logs: `docker-compose logs` or `kubectl logs`.
- Verify network connectivity between services.
- Ensure ports are not conflicting.
# NEXO CRM Helm Chart

This directory contains the Helm chart for deploying NEXO CRM to Kubernetes clusters across different environments.

## Quick Start

```bash
# Install with default (development) values
helm install nexo-crm ./helm/nexo-crm

# Install with specific environment
helm install nexo-crm ./helm/nexo-crm -f helm/nexo-crm/values-staging.yaml

# Upgrade existing release
helm upgrade nexo-crm ./helm/nexo-crm -f helm/nexo-crm/values-prod.yaml
```

## Chart Structure

```
helm/nexo-crm/
├── Chart.yaml              # Chart metadata
├── values.yaml             # Default values
├── values-dev.yaml         # Development environment
├── values-staging.yaml     # Staging environment
├── values-prod.yaml        # Production environment
└── templates/              # Kubernetes manifests
    ├── _helpers.tpl        # Template helpers
    ├── namespace.yaml      # Namespace
    ├── postgresql.yaml     # Database
    ├── redis.yaml          # Cache
    ├── keycloak.yaml       # Auth
    ├── backend.yaml        # API
    ├── frontend.yaml       # UI
    ├── prometheus.yaml     # Metrics
    ├── grafana.yaml        # Visualization
    └── ingress.yaml        # Ingress rules
```

## Environments

### Development (`values-dev.yaml`)

Minimal resources for local development:
- 1 replica per service
- Small persistence (2-5Gi)
- NodePort services
- No autoscaling
- Debug logging

```bash
helm install nexo-crm ./helm/nexo-crm -f helm/nexo-crm/values-dev.yaml
```

### Staging (`values-staging.yaml`)

Medium resources for testing and QA:
- 2-3 replicas per service
- Medium persistence (10-20Gi)
- Autoscaling enabled
- Ingress with staging TLS
- Info logging

```bash
helm install nexo-crm ./helm/nexo-crm -f helm/nexo-crm/values-staging.yaml
```

### Production (`values-prod.yaml`)

High availability with full resources:
- 3-5 replicas per service
- Large persistence (50-100Gi)
- Aggressive autoscaling
- Production TLS certificates
- Pod disruption budgets
- Anti-affinity rules
- Warn logging

```bash
helm install nexo-crm ./helm/nexo-crm -f helm/nexo-crm/values-prod.yaml
```

## Common Operations

### Install

```bash
# Development
helm install nexo-crm ./helm/nexo-crm -f helm/nexo-crm/values-dev.yaml

# Staging
helm install nexo-crm ./helm/nexo-crm -f helm/nexo-crm/values-staging.yaml

# Production
helm install nexo-crm ./helm/nexo-crm -f helm/nexo-crm/values-prod.yaml
```

### Upgrade

```bash
# Upgrade with new values
helm upgrade nexo-crm ./helm/nexo-crm -f helm/nexo-crm/values-prod.yaml

# Force upgrade
helm upgrade nexo-crm ./helm/nexo-crm --force
```

### Rollback

```bash
# Rollback to previous version
helm rollback nexo-crm

# Rollback to specific revision
helm rollback nexo-crm 2
```

### Uninstall

```bash
# Uninstall release
helm uninstall nexo-crm

# Uninstall and delete namespace
helm uninstall nexo-crm && kubectl delete namespace nexo-crm
```

### Validation

```bash
# Run comprehensive Helm validation tests
bash scripts/test-helm-validate.sh

# Or using MISE/Make
mise run test:helm:validate
make test-helm-validate

# Manual validation commands
# Dry-run to see what would be installed
helm install nexo-crm ./helm/nexo-crm --dry-run --debug

# Template validation
helm template nexo-crm ./helm/nexo-crm

# Lint chart
helm lint ./helm/nexo-crm

# Validate against Kubernetes (requires kubectl)
helm template nexo-crm ./helm/nexo-crm | kubectl apply --dry-run=client -f -
```

### Testing

The Helm chart validation test suite (`scripts/test-helm-validate.sh`) includes:

- **Chart Structure Tests**: Validates all required files exist
- **Helm Lint Tests**: Lints chart with all environment value files
- **Template Rendering Tests**: Ensures templates render without errors
- **Kubernetes Validation**: Validates manifests against K8s API
- **Chart Metadata Tests**: Verifies Chart.yaml completeness
- **Values File Tests**: Confirms environment-specific configurations
- **Advanced Tests**: Checks for expected Kubernetes resources

Run the test suite before deploying to ensure chart validity.

## Configuration

### Custom Values

Create custom values file:

```yaml
# custom-values.yaml
global:
  environment: myenv
  domain: mycompany.com

backend:
  replicaCount: 5
  resources:
    requests:
      memory: "2Gi"
      cpu: "1000m"
```

Install with custom values:

```bash
helm install nexo-crm ./helm/nexo-crm -f custom-values.yaml
```

### Override Specific Values

```bash
# Override single value
helm install nexo-crm ./helm/nexo-crm --set backend.replicaCount=10

# Override multiple values
helm install nexo-crm ./helm/nexo-crm \
  --set backend.replicaCount=10 \
  --set frontend.replicaCount=5
```

### Secrets Management

For production, use external secrets management:

```bash
# Using Kubernetes Secrets
kubectl create secret generic nexo-secrets \
  --from-literal=postgres-password='your-password' \
  --from-literal=keycloak-admin='your-admin-password'

# Reference in values
postgresql:
  env:
    password: "referenced-from-secret"
```

## Resource Requirements

### Development

| Service | CPU Request | Memory Request | CPU Limit | Memory Limit |
|---------|-------------|----------------|-----------|--------------|
| PostgreSQL | 100m | 128Mi | 250m | 256Mi |
| Redis | 50m | 64Mi | 100m | 128Mi |
| Keycloak | 250m | 256Mi | 500m | 512Mi |
| Backend | 100m | 128Mi | 250m | 256Mi |
| Frontend | 100m | 128Mi | 250m | 256Mi |
| Prometheus | 100m | 256Mi | 250m | 512Mi |
| Grafana | 100m | 128Mi | 250m | 256Mi |
| **Total** | **800m** | **1.1Gi** | **1.85** | **2.3Gi** |

### Staging

| Service | CPU Request | Memory Request | CPU Limit | Memory Limit |
|---------|-------------|----------------|-----------|--------------|
| PostgreSQL | 500m | 512Mi | 1000m | 1Gi |
| Redis | 200m | 256Mi | 400m | 512Mi |
| Keycloak | 500m | 1Gi | 1000m | 2Gi |
| Backend | 500m | 512Mi | 1000m | 1Gi |
| Frontend | 500m | 512Mi | 1000m | 1Gi |
| Prometheus | 500m | 1Gi | 1000m | 2Gi |
| Grafana | 250m | 512Mi | 500m | 1Gi |
| **Total** | **2.95** | **4.3Gi** | **5.9** | **9.5Gi** |

### Production

| Service | CPU Request | Memory Request | CPU Limit | Memory Limit |
|---------|-------------|----------------|-----------|--------------|
| PostgreSQL | 1000m | 2Gi | 2000m | 4Gi |
| Redis | 500m | 1Gi | 1000m | 2Gi |
| Keycloak | 1000m | 2Gi | 2000m | 4Gi |
| Backend | 1000m | 1Gi | 2000m | 2Gi |
| Frontend | 1000m | 1Gi | 2000m | 2Gi |
| Prometheus | 2000m | 4Gi | 4000m | 8Gi |
| Grafana | 500m | 1Gi | 1000m | 2Gi |
| **Total** | **7** | **12Gi** | **14** | **24Gi** |

## Troubleshooting

### Check Installation Status

```bash
# List releases
helm list

# Get release info
helm status nexo-crm

# Get release values
helm get values nexo-crm
```

### Debug Issues

```bash
# Dry-run with debug
helm install nexo-crm ./helm/nexo-crm --dry-run --debug

# Check rendered templates
helm template nexo-crm ./helm/nexo-crm

# Get pod status
kubectl get pods -n nexo-crm

# Check pod logs
kubectl logs -n nexo-crm deployment/nexo-crm-backend
```

### Common Issues

#### Pods Not Starting

```bash
# Check events
kubectl get events -n nexo-crm --sort-by='.lastTimestamp'

# Describe pod
kubectl describe pod -n nexo-crm <pod-name>

# Check resource constraints
kubectl top pods -n nexo-crm
```

#### Service Not Accessible

```bash
# Check service
kubectl get svc -n nexo-crm

# Check endpoints
kubectl get endpoints -n nexo-crm

# Port forward for testing
kubectl port-forward -n nexo-crm svc/nexo-crm-backend 3001:3001
```

#### Storage Issues

```bash
# Check PVCs
kubectl get pvc -n nexo-crm

# Check PVs
kubectl get pv

# Describe PVC
kubectl describe pvc -n nexo-crm nexo-crm-postgres-pvc
```

## Best Practices

### Production Deployment

1. **Use specific image tags** (not `latest`)
2. **Set resource limits** for all containers
3. **Enable autoscaling** for stateless services
4. **Configure liveness/readiness probes**
5. **Use Secrets for sensitive data**
6. **Enable Pod Disruption Budgets**
7. **Configure anti-affinity rules**
8. **Set up monitoring and alerts**
9. **Regular backups** of stateful data
10. **Test rollback procedures**

### Security

1. Run as non-root user
2. Use readonly root filesystem
3. Drop unnecessary capabilities
4. Enable network policies
5. Use TLS for all traffic
6. Rotate secrets regularly
7. Scan images for vulnerabilities

### Monitoring

```bash
# Watch pod status
watch kubectl get pods -n nexo-crm

# Monitor resource usage
kubectl top pods -n nexo-crm
kubectl top nodes

# Check HPA status
kubectl get hpa -n nexo-crm
```

## Migration from Plain K8s

If migrating from plain Kubernetes manifests:

```bash
# 1. Export current configuration
kubectl get all -n nexo -o yaml > current-config.yaml

# 2. Review values.yaml and customize
vim helm/nexo-crm/values.yaml

# 3. Dry-run to compare
helm template nexo-crm ./helm/nexo-crm > helm-config.yaml
diff current-config.yaml helm-config.yaml

# 4. Install with Helm
helm install nexo-crm ./helm/nexo-crm

# 5. Clean up old resources if needed
kubectl delete -f k8s/
```

## CI/CD Integration

### GitHub Actions Example

```yaml
- name: Deploy to Staging
  run: |
    helm upgrade --install nexo-crm ./helm/nexo-crm \
      -f helm/nexo-crm/values-staging.yaml \
      --set backend.image.tag=${{ github.sha }} \
      --set frontend.image.tag=${{ github.sha }} \
      --wait --timeout 5m
```

### GitLab CI Example

```yaml
deploy:staging:
  stage: deploy
  script:
    - helm upgrade --install nexo-crm ./helm/nexo-crm
      -f helm/nexo-crm/values-staging.yaml
      --set backend.image.tag=$CI_COMMIT_SHA
      --wait
```

## Additional Resources

- [Helm Documentation](https://helm.sh/docs/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [NEXO CRM Architecture](../ARCHITECTURE.md)
- [Testing Guide](../docs/TESTING.md)

---

**Maintained by**: NEXO Development Team  
**Last Updated**: 2026-01-20

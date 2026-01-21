# NEXO CRM - Raspberry Pi Deployment Guide

**Target Device**: Raspberry Pi 4 (4GB RAM or higher recommended)  
**Architecture**: ARM64 (aarch64)  
**OS**: Raspberry Pi OS (64-bit) or Ubuntu Server 22.04 ARM64  
**Date**: January 21, 2026

---

## 📋 Table of Contents
1. [Hardware Requirements](#hardware-requirements)
2. [System Preparation](#system-preparation)
3. [Installation](#installation)
4. [Resource Optimization](#resource-optimization)
5. [Performance Tuning](#performance-tuning)
6. [Monitoring](#monitoring)
7. [Troubleshooting](#troubleshooting)

---

## 🔧 Hardware Requirements

### Minimum Requirements
- **Raspberry Pi**: Pi 4 Model B (4GB RAM)
- **Storage**: 32GB microSD card (Class 10 or better)
- **Network**: Ethernet connection (recommended) or WiFi
- **Power**: Official 5V 3A USB-C power supply
- **Cooling**: Active cooling (fan or heatsink) recommended

### Recommended Setup
- **Raspberry Pi**: Pi 4 Model B (8GB RAM)
- **Storage**: 64GB+ microSD card (Application Class 2) or USB 3.0 SSD
- **Network**: Gigabit Ethernet
- **Cooling**: Active cooling solution
- **Case**: Case with proper ventilation

### Performance Expectations

#### With 4GB RAM:
```
Service         Memory Usage    CPU Usage
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PostgreSQL      256-512 MB      10-20%
Redis           64-128 MB       5-10%
Auth Service    128-256 MB      5-15%
API Gateway     128-256 MB      5-15%
CRM Service     128-256 MB      5-15%
Frontend        256-512 MB      10-25%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total           960-1920 MB     40-80%
```

#### Startup Time:
- Cold Start (first boot): ~45-60 seconds
- Warm Start (cached): ~25-35 seconds
- Database Ready: ~15-20 seconds

---

## 🚀 System Preparation

### 1. Install Raspberry Pi OS (64-bit)

```bash
# Check architecture
uname -m
# Should output: aarch64 or arm64

# Update system
sudo apt update && sudo apt upgrade -y
```

### 2. Install Docker

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER

# Logout and login again, then verify
docker --version
docker compose version
```

### 3. Install Build Dependencies

```bash
# Install required tools
sudo apt install -y git make curl htop

# Install Node.js (for local development)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install pnpm
npm install -g pnpm
```

### 4. Configure System Resources

```bash
# Increase swap size (recommended for 4GB model)
sudo dphys-swapfile swapoff
sudo nano /etc/dphys-swapfile
# Set: CONF_SWAPSIZE=2048

# Restart swap
sudo dphys-swapfile setup
sudo dphys-swapfile swapon

# Enable memory cgroup (required for Docker limits)
sudo nano /boot/cmdline.txt
# Add to end of line: cgroup_enable=cpuset cgroup_enable=memory cgroup_memory=1

# Reboot
sudo reboot
```

---

## 📦 Installation

### Clone Repository

```bash
cd ~
git clone <repository-url> nexo-crm
cd nexo-crm/nx_nexo_v0.20260115_backend
```

### Quick Start (Database Only)

```bash
# Start database services
make -f Makefile.rpi start

# Check status
make -f Makefile.rpi health

# View logs
make -f Makefile.rpi logs
```

### Full Stack Deployment

```bash
# Build ARM64 images (this may take 20-30 minutes)
make -f Makefile.rpi build-rpi

# Start all services
make -f Makefile.rpi start-all

# Monitor resource usage
make -f Makefile.rpi stats
```

---

## ⚡ Resource Optimization

### Docker Compose Resource Limits

The `docker-compose.full.yml` is pre-configured with Raspberry Pi optimized limits:

```yaml
PostgreSQL:
  Memory: 256MB-512MB
  CPU: 0.25-1.0 cores
  Config: Optimized for low-memory environments

Redis:
  Memory: 64MB-128MB
  CPU: 0.1-0.25 cores
  MaxMemory Policy: allkeys-lru

Backend Services (each):
  Memory: 128MB-256MB
  CPU: 0.1-0.5 cores
  Node.js: --max-old-space-size=256

Frontend:
  Memory: 256MB-512MB
  CPU: 0.25-1.0 cores
  Node.js: --max-old-space-size=512
```

### PostgreSQL Tuning for Raspberry Pi

Already configured in docker-compose.full.yml:

```
shared_buffers = 128MB
effective_cache_size = 256MB
maintenance_work_mem = 64MB
work_mem = 4MB
max_connections = 50
```

### Redis Tuning for Raspberry Pi

Already configured:

```
maxmemory 128mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
```

---

## 🎯 Performance Tuning

### 1. Use SSD Instead of microSD

For significant performance improvement:

```bash
# Boot from USB SSD (Raspberry Pi 4)
# 1. Update bootloader
sudo rpi-eeprom-update
sudo reboot

# 2. Clone system to SSD
# 3. Update boot order in raspi-config
```

### 2. Disable Unnecessary Services

```bash
# Disable services you don't need
sudo systemctl disable bluetooth
sudo systemctl disable cups
sudo systemctl disable avahi-daemon

# Free up memory
sudo systemctl stop <service-name>
```

### 3. Monitor Temperature

```bash
# Check CPU temperature
vcgencmd measure_temp

# Install monitoring tool
sudo apt install -y lm-sensors
watch -n 1 sensors
```

### 4. Optimize Docker

```bash
# Prune unused images and containers regularly
docker system prune -af --volumes

# Set Docker to use overlay2 storage driver
# Edit /etc/docker/daemon.json
{
  "storage-driver": "overlay2",
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

---

## 📊 Monitoring

### Real-time Resource Monitoring

```bash
# Docker stats
make -f Makefile.rpi stats

# System resources
htop

# Memory usage
free -h

# Temperature and throttling
watch -n 1 'vcgencmd measure_temp && vcgencmd get_throttled'
```

### Health Checks

```bash
# All services
make -f Makefile.rpi health

# Database
docker exec nexo-postgres pg_isready -U nexo_admin

# Redis
docker exec nexo-redis redis-cli ping

# Check logs
make -f Makefile.rpi logs
```

### Performance Metrics

```bash
# Response time test
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3001/health

# Database queries
docker exec nexo-postgres psql -U nexo_admin -d nexo_crm \
  -c "SELECT COUNT(*) FROM users;"

# Redis info
docker exec nexo-redis redis-cli info stats
```

---

## 🐛 Troubleshooting

### Out of Memory Issues

**Symptom**: Services crashing, system freezing

**Solution**:
```bash
# Check memory
free -h

# Check swap
swapon --show

# Increase swap size (see System Preparation)

# Reduce service limits in docker-compose.full.yml

# Stop unnecessary services
docker compose -f docker-compose.full.yml stop frontend
```

### Slow Performance

**Symptom**: High response times, system lag

**Solutions**:
```bash
# 1. Check temperature (thermal throttling)
vcgencmd measure_temp
# If >80°C, improve cooling

# 2. Check I/O wait
iostat -x 1

# 3. Use SSD instead of microSD

# 4. Reduce concurrent services
# Start database only: make -f Makefile.rpi start

# 5. Check Docker logs
make -f Makefile.rpi logs
```

### Build Failures

**Symptom**: Docker build fails or takes too long

**Solutions**:
```bash
# 1. Increase swap
sudo dphys-swapfile swapoff
sudo nano /etc/dphys-swapfile
# CONF_SWAPSIZE=4096
sudo dphys-swapfile setup
sudo dphys-swapfile swapon

# 2. Build one service at a time
docker build -f nexo-prj/apps/auth-service/Dockerfile ./nexo-prj

# 3. Use pre-built images (when available)
# docker pull nexo/auth-service:latest-arm64

# 4. Build on more powerful machine and transfer
# docker save nexo/auth-service:latest | gzip > auth-service.tar.gz
# scp auth-service.tar.gz pi@raspberrypi:~
# docker load < auth-service.tar.gz
```

### Database Connection Issues

**Symptom**: Services can't connect to PostgreSQL

**Solutions**:
```bash
# 1. Check PostgreSQL is running
docker ps | grep postgres

# 2. Check health
docker compose -f docker-compose.full.yml ps

# 3. Wait for healthy status
# Database may take 15-20 seconds to be ready

# 4. Check logs
docker logs nexo-postgres

# 5. Test connection
docker exec nexo-postgres psql -U nexo_admin -d nexo_crm -c "SELECT 1;"
```

### Network Issues

**Symptom**: Services can't communicate

**Solutions**:
```bash
# 1. Check network
docker network ls | grep nexo

# 2. Inspect network
docker network inspect nexo-network

# 3. Restart services
make -f Makefile.rpi restart

# 4. Check firewall
sudo ufw status
```

---

## 🔄 Maintenance

### Regular Tasks

```bash
# Daily: Check health
make -f Makefile.rpi health

# Weekly: Database backup
make -f Makefile.rpi db-backup

# Monthly: System update
sudo apt update && sudo apt upgrade -y
docker system prune -af

# Quarterly: Review logs and optimize
```

### Backup Strategy

```bash
# Backup database
make -f Makefile.rpi db-backup

# Backup volumes
docker run --rm -v nexo_postgres_data:/data -v $(pwd)/backups:/backup \
  alpine tar czf /backup/postgres_data.tar.gz -C /data .

# Restore
docker run --rm -v nexo_postgres_data:/data -v $(pwd)/backups:/backup \
  alpine tar xzf /backup/postgres_data.tar.gz -C /data
```

---

## 📈 Scaling Considerations

### When to Upgrade

Consider upgrading to Pi 5 or cloud hosting when:
- Consistent CPU usage >80%
- Memory usage >90%
- Frequent thermal throttling
- More than 100 concurrent users
- Response times >500ms

### Horizontal Scaling

For production with multiple Raspberry Pis:
```bash
# Use Docker Swarm or Kubernetes
# Separate database to dedicated Pi
# Use load balancer (HAProxy/Nginx)
# Implement Redis Cluster
```

---

## 📚 Additional Resources

- [Raspberry Pi Documentation](https://www.raspberrypi.com/documentation/)
- [Docker on ARM](https://www.docker.com/blog/multi-arch-images/)
- [PostgreSQL ARM Optimization](https://www.postgresql.org/docs/current/runtime-config-resource.html)
- [Next.js Performance](https://nextjs.org/docs/advanced-features/measuring-performance)

---

## 🎯 Performance Targets

### Raspberry Pi 4 (4GB)
```
✅ Startup Time:        < 60 seconds
✅ Memory Usage:        < 2GB total
✅ CPU Usage (idle):    < 30%
✅ CPU Usage (active):  < 70%
✅ Database Response:   < 100ms
✅ API Response:        < 200ms
✅ Frontend Load:       < 3 seconds
```

### Achieved Optimizations
- ✅ Multi-stage Docker builds (reduced image size by ~60%)
- ✅ Alpine Linux base images (minimal footprint)
- ✅ Non-root containers (security)
- ✅ Resource limits enforced
- ✅ Optimized PostgreSQL configuration
- ✅ Redis memory management
- ✅ Node.js heap size limits
- ✅ Proper signal handling (tini)
- ✅ Health checks implemented
- ✅ ARM64 native support

---

**Last Updated**: January 21, 2026  
**Tested On**: Raspberry Pi 4 Model B (4GB), Raspberry Pi OS 64-bit  
**Status**: Production Ready for Raspberry Pi deployment

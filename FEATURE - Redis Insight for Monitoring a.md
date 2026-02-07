FEATURE - Redis Insight for Monitoring and Management

Option 2: Add Redis Insight (GUI for detailed status)
Redis Insight is an official free GUI tool that provides a visual way to manage your data, use a command-line interface, and view detailed diagnostics and performance metrics. 
Add a new service to your docker-compose.yml file: 
yaml
version: '3.8'
services:
  redis:
    image: redis:7-alpine
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data

  redisinsight:
    image: redis/redisinsight:latest
    ports:
      - "5540:5540" # Map port 5540 to your host machine
    restart: unless-stopped
    volumes:
      # Persist Redis Insight data
      - redisinsight-data:/data
    depends_on:
      - redis # Ensure redis starts before redisinsight

volumes:
  redis-data:
    driver: local
  redisinsight-data:
    driver: local
After you run docker-compose up -d, you can access the Redis Insight dashboard in your web browser, then connect it to your Redis instance (usually at host.docker.internal or the service name redis with port 6379). 

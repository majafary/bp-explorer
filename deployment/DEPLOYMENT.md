# CIAM Blueprint Viewer - ECS Deployment Guide

## Architecture Overview

The application consists of three Docker containers running on AWS ECS Fargate:

1. **bp-explorer** - React frontend application (port 80)
2. **structurizr** - Structurizr Lite with auto-generated workspace (port 8080)
3. **nginx-proxy** - Reverse proxy that strips X-Frame-Options header (port 80)

## Docker Images

### 1. React Application (`bp-explorer/Dockerfile.app`)
- Multi-stage build with Node.js 20 Alpine and Nginx Alpine
- Builds React app with Vite
- Serves static files via Nginx
- Health check on port 80

### 2. Structurizr (`bp-explorer/Dockerfile.structurizr`)
- Multi-stage build:
  - Stage 1: Node.js 20 Alpine - Generates workspace.dsl from JSON data
  - Stage 2: Amazon Corretto 21 - Runs Structurizr Lite
- Workspace generated at build time from `ciam-systems.json` and `blueprints.json`
- Runs on port 8080
- Java memory: 128MB-256MB

### 3. Nginx Proxy (`bp-explorer/Dockerfile.proxy`)
- Nginx Alpine with `envsubst` for environment variable substitution
- Strips `X-Frame-Options` header to allow iframe embedding
- Proxies requests to Structurizr container
- CORS headers configured
- Health check endpoint at `/health`

## Prerequisites

### AWS Resources
1. **ECR Repositories** (create via AWS Console or CLI):
   ```bash
   aws ecr create-repository --repository-name bp-explorer --region us-east-1
   aws ecr create-repository --repository-name structurizr --region us-east-1
   aws ecr create-repository --repository-name nginx-proxy --region us-east-1
   ```

2. **ECS Cluster**:
   ```bash
   aws ecs create-cluster --cluster-name ciam-blueprint-cluster --region us-east-1
   ```

3. **CloudWatch Log Group**:
   ```bash
   aws logs create-log-group --log-group-name /ecs/ciam-blueprint-viewer --region us-east-1
   ```

4. **IAM Roles**:
   - `ecsTaskExecutionRole` - For ECS to pull images and write logs
   - `ecsTaskRole` - For containers to access AWS services (if needed)

5. **VPC and Subnets**:
   - Public or private subnets with appropriate route tables
   - Security group allowing inbound traffic on ports 80 and 8080

### GitLab CI/CD Variables
Configure in GitLab project settings (Settings → CI/CD → Variables):
- `AWS_ACCOUNT_ID` - Your AWS account ID
- `AWS_ACCESS_KEY_ID` - IAM user access key
- `AWS_SECRET_ACCESS_KEY` - IAM user secret key
- `AWS_REGION` - AWS region (default: us-east-1)

## Local Testing

### Using Production Dockerfiles
```bash
# Build and run all containers locally
docker-compose -f docker-compose.prod.yml up --build

# Access applications:
# - React app: http://localhost:5173
# - Structurizr (via proxy): http://localhost:8080
```

### Build Individual Images
```bash
# React app (from bp-explorer directory)
cd bp-explorer
docker build -f Dockerfile.app -t bp-explorer:local .

# Structurizr
docker build -f Dockerfile.structurizr -t structurizr:local .

# Nginx proxy
docker build -f Dockerfile.proxy -t nginx-proxy:local .
```

## GitLab Pipeline

The `.gitlab-ci.yml` pipeline has three stages:

### 1. Build Stage
- Builds all three Docker images
- Runs on `main` and `develop` branches
- Tags images with commit SHA and `latest`

### 2. Push Stage
- Authenticates with AWS ECR
- Pushes images to ECR with commit SHA and `latest` tags
- Only runs on `main` branch

### 3. Deploy Stage
- **Production** (`deploy:ecs`):
  - Manual approval required
  - Updates ECS service with latest images
  - Waits for deployment to stabilize

- **Staging** (`deploy:staging`):
  - Automatic on `develop` branch
  - Updates staging ECS service

## ECS Task Definition

The `ecs-task-definition.json` file defines:
- **Network Mode**: `awsvpc` (required for Fargate)
- **CPU**: 1024 (1 vCPU)
- **Memory**: 2048 MB (2 GB)

### Container Resource Allocation
| Container | CPU | Memory |
|-----------|-----|--------|
| bp-explorer | 256 | 512 MB |
| structurizr | 512 | 1024 MB |
| nginx-proxy | 256 | 512 MB |
| **Total** | **1024** | **2048 MB** |

### Container Dependencies
- `nginx-proxy` depends on `structurizr` being HEALTHY
- All containers have health checks

### Environment Variables

**structurizr**:
- `STRUCTURIZR_WORKSPACE_FILENAME=workspace` (do not include .dsl extension)
- `STRUCTURIZR_AUTO_REFRESH_INTERVAL=0` (disable auto-refresh)

**nginx-proxy**:
- `STRUCTURIZR_HOST=localhost` (in ECS, all containers share network namespace)
- `STRUCTURIZR_PORT=8080`
- `CORS_ORIGIN=*` (or specify your domain)

## Manual Deployment Steps

### 1. Update Task Definition
```bash
# Update placeholders in ecs-task-definition.json:
# - YOUR_ACCOUNT_ID → Your AWS account ID
# - YOUR_ECR_REGISTRY → Your ECR registry URL
# - us-east-1 → Your AWS region (if different)

# Register task definition
aws ecs register-task-definition \
  --cli-input-json file://ecs-task-definition.json \
  --region us-east-1
```

### 2. Create ECS Service
```bash
aws ecs create-service \
  --cluster ciam-blueprint-cluster \
  --service-name ciam-blueprint-service \
  --task-definition ciam-blueprint-viewer \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxxxx],securityGroups=[sg-xxxxx],assignPublicIp=ENABLED}" \
  --region us-east-1
```

### 3. Create Application Load Balancer (Optional)
For production, use an ALB to distribute traffic:
```bash
# Create target group for React app
aws elbv2 create-target-group \
  --name bp-explorer-tg \
  --protocol HTTP \
  --port 80 \
  --vpc-id vpc-xxxxx \
  --target-type ip \
  --health-check-path /health

# Create ALB and listener rules
# ... (follow AWS documentation)
```

## Updating the Application

### Update Data Files
When `ciam-systems.json` or `blueprints.json` changes:
1. Commit changes to Git
2. Push to `main` or `develop` branch
3. GitLab pipeline rebuilds Structurizr image with new workspace
4. ECS deployment updates running containers

### Update React App
1. Make code changes in `bp-explorer/`
2. Test locally: `npm run dev`
3. Commit and push
4. Pipeline rebuilds and deploys

## Monitoring

### CloudWatch Logs
```bash
# View logs for specific container
aws logs tail /ecs/ciam-blueprint-viewer --follow \
  --filter-pattern "bp-explorer" \
  --region us-east-1
```

### ECS Service Status
```bash
# Check service status
aws ecs describe-services \
  --cluster ciam-blueprint-cluster \
  --services ciam-blueprint-service \
  --region us-east-1
```

### Health Checks
All containers have health checks configured:
- **React app**: `wget http://localhost:80/`
- **Structurizr**: `curl http://localhost:8080/`
- **Nginx proxy**: `wget http://localhost:80/health`

## Troubleshooting

### Container Fails to Start
```bash
# Check ECS task logs
aws ecs describe-tasks \
  --cluster ciam-blueprint-cluster \
  --tasks TASK_ID \
  --region us-east-1

# View stopped task reasons
aws logs get-log-events \
  --log-group-name /ecs/ciam-blueprint-viewer \
  --log-stream-name STREAM_NAME \
  --region us-east-1
```

### Structurizr Not Loading Workspace
- Verify `STRUCTURIZR_WORKSPACE_FILENAME=workspace` (not `workspace.dsl`)
- Check Structurizr container logs for DSL syntax errors
- Verify workspace.dsl was generated correctly at build time

### iframe Not Loading
- Check nginx-proxy logs for connection errors
- Verify `STRUCTURIZR_HOST=localhost` (in ECS with awsvpc mode)
- Confirm CORS_ORIGIN is set correctly

### Image Pull Errors
- Verify ECR repository names match task definition
- Check IAM role has `ecr:GetAuthorizationToken` and `ecr:BatchGetImage` permissions
- Ensure images were pushed successfully to ECR

## Security Considerations

1. **IAM Roles**: Use least-privilege IAM roles for ECS tasks
2. **Secrets**: Store sensitive data in AWS Secrets Manager or SSM Parameter Store
3. **Network**: Use private subnets with NAT gateway for production
4. **CORS**: Restrict `CORS_ORIGIN` to specific domains in production
5. **Health Checks**: Ensure health check endpoints don't expose sensitive data

## Cost Optimization

### Fargate Pricing (us-east-1)
- 1 vCPU: $0.04048 per hour
- 2 GB Memory: $0.004445 per GB per hour
- **Total**: ~$0.049 per hour (~$35/month for 1 task running 24/7)

### Optimization Tips
1. Use Fargate Spot for non-production environments (70% discount)
2. Scale down to 0 tasks during off-hours for dev/staging
3. Use ECR lifecycle policies to clean up old images

## References

- [ECS Task Definition Parameters](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_definition_parameters.html)
- [Fargate Task Networking](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/fargate-task-networking.html)
- [Structurizr Lite Docker](https://github.com/structurizr/lite)
- [GitLab CI/CD Docker](https://docs.gitlab.com/ee/ci/docker/using_docker_build.html)

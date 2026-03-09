# 政策跟踪器 - 部署指南

## 系统要求

- Docker >= 20.10
- Docker Compose >= 2.0
- 内存 >= 4GB
- 磁盘空间 >= 20GB

## 快速部署

### 1. 克隆代码

```bash
git clone https://github.com/jackeyunjie/ironclaw.git
cd ironclaw/科创服务/policy-tracker
```

### 2. 环境配置

```bash
# 后端环境变量
cp backend/.env.example backend/.env

# 编辑 .env 文件
vim backend/.env
```

必要的配置项：
- `DB_PASSWORD` - 数据库密码
- `JWT_SECRET` - JWT密钥（建议使用随机字符串）
- `OPENAI_API_KEY` - OpenAI API密钥（用于AI功能）
- `SMTP_USER` / `SMTP_PASS` - 邮件服务配置

### 3. 启动服务

```bash
# 构建并启动所有服务
docker-compose up -d --build

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f backend
```

### 4. 数据库迁移

```bash
# 进入后端容器
docker-compose exec backend sh

# 运行数据库迁移
npm run migration:run

# 退出容器
exit
```

### 5. 访问服务

- 前端应用：http://localhost
- 后端API：http://localhost/api
- API文档：http://localhost/api/docs
- MinIO控制台：http://localhost:9001

## 生产环境部署

### 使用 HTTPS

1. 准备 SSL 证书
```bash
mkdir -p nginx/ssl
cp your-cert.crt nginx/ssl/cert.crt
cp your-key.key nginx/ssl/key.key
```

2. 更新 nginx.conf 启用 HTTPS

### 环境变量配置

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `NODE_ENV` | 运行环境 | production |
| `DB_HOST` | 数据库主机 | postgres |
| `DB_PORT` | 数据库端口 | 5432 |
| `DB_NAME` | 数据库名称 | policy_tracker |
| `DB_USERNAME` | 数据库用户 | postgres |
| `DB_PASSWORD` | 数据库密码 | password |
| `REDIS_HOST` | Redis主机 | redis |
| `REDIS_PORT` | Redis端口 | 6379 |
| `JWT_SECRET` | JWT密钥 | - |
| `OPENAI_API_KEY` | OpenAI API密钥 | - |
| `MINIO_ENDPOINT` | MinIO地址 | minio:9000 |
| `MINIO_ACCESS_KEY` | MinIO访问密钥 | minioadmin |
| `MINIO_SECRET_KEY` | MinIO密钥 | minioadmin123 |

## 服务管理

### 启动/停止服务

```bash
# 启动
docker-compose up -d

# 停止
docker-compose down

# 停止并删除数据卷（谨慎使用）
docker-compose down -v
```

### 更新部署

```bash
# 拉取最新代码
git pull origin main

# 重新构建并启动
docker-compose up -d --build

# 运行数据库迁移
docker-compose exec backend npm run migration:run
```

### 备份数据

```bash
# 备份数据库
docker-compose exec postgres pg_dump -U postgres policy_tracker > backup.sql

# 备份文件存储
docker-compose exec minio mc mirror local/policy-tracker /backup/files
```

### 查看日志

```bash
# 所有服务日志
docker-compose logs -f

# 特定服务日志
docker-compose logs -f backend

# 最近100行日志
docker-compose logs --tail=100 backend
```

## 故障排查

### 服务无法启动

1. 检查端口是否被占用
```bash
netstat -tlnp | grep -E '80|443|3000|5432|6379|9200'
```

2. 检查磁盘空间
```bash
df -h
```

3. 查看详细错误日志
```bash
docker-compose logs backend
```

### 数据库连接失败

1. 检查数据库服务状态
```bash
docker-compose ps postgres
```

2. 测试数据库连接
```bash
docker-compose exec postgres psql -U postgres -d policy_tracker
```

### API 访问异常

1. 检查后端服务状态
```bash
curl http://localhost/api/health
```

2. 检查 Nginx 配置
```bash
docker-compose exec nginx nginx -t
```

## 监控与维护

### 设置定时备份

```bash
# 编辑 crontab
crontab -e

# 添加每日备份任务（凌晨2点执行）
0 2 * * * cd /path/to/policy-tracker && ./scripts/backup.sh
```

### 性能监控

建议安装以下工具：
- Prometheus + Grafana - 系统监控
- ELK Stack - 日志分析
- Portainer - Docker管理

## 支持

如有问题，请提交 Issue 到 GitHub 仓库。

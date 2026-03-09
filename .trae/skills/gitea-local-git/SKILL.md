---
name: "gitea-local-git"
description: "Deploy and manage Gitea as a local Git hosting platform. Invoke when user wants to set up a self-hosted GitHub alternative, manage local Git repositories, or needs Gitea administration guidance."
---

# Gitea 本地 Git 平台完全指南

## 概述

Gitea 是一个轻量级、开源的自助 Git 托管服务，类似于 GitHub/GitLab，但资源占用极低，适合个人开发者和小团队在本地或私有服务器部署。

## 快速部署

### 1. Docker Compose 部署

创建 `docker-compose.yml`:

```yaml
services:
  gitea:
    image: gitea/gitea:latest
    container_name: gitea
    environment:
      - USER_UID=1000
      - USER_GID=1000
      - GITEA__database__DB_TYPE=sqlite3
    restart: always
    volumes:
      - ./data:/data
      - /etc/timezone:/etc/timezone:ro
      - /etc/localtime:/etc/localtime:ro
    ports:
      - "3001:3000"  # Web 界面
      - "2222:22"    # SSH 端口
```

启动服务：
```bash
docker-compose up -d
```

访问：http://localhost:3001

### 2. 首次配置

1. **数据库**: 选择 SQLite（无需额外配置）
2. **基础设置**:
   - 站点标题: 您的平台名称
   - 基础 URL: `http://localhost:3001`
3. **管理员账号**: 创建首个管理员用户

---

## 日常使用

### 创建仓库

**Web 界面操作:**
1. 点击右上角 "+" → "新建仓库"
2. 填写仓库名称、描述
3. 选择公开/私有
4. 勾选初始化选项（README、.gitignore、License）

**命令行操作:**
```bash
# 创建本地仓库并推送到 Gitea
git init
git add .
git commit -m "Initial commit"
git remote add origin http://localhost:3001/username/repo.git
git push -u origin main
```

### 克隆仓库

```bash
# HTTP 方式
git clone http://localhost:3001/username/repository.git

# SSH 方式（需配置 SSH 密钥）
git clone ssh://git@localhost:2222/username/repository.git
```

### 分支管理

```bash
# 创建分支
git checkout -b feature-branch

# 推送分支
git push -u origin feature-branch

# 删除远程分支
git push origin --delete feature-branch
```

---

## 协作功能

### Pull Request (合并请求)

1. 推送分支到远程
2. 在 Web 界面点击 "Pull Request"
3. 选择源分支和目标分支
4. 填写标题和描述
5. 请求代码审查
6. 合并到主分支

### Issues (问题追踪)

- 创建 Issue 记录 Bug 或功能需求
- 使用标签分类（bug, feature, enhancement）
- 指派给团队成员
- 关联里程碑

### 代码审查

- 在 Pull Request 中逐行评论
- 要求审查者批准
- 设置分支保护规则

---

## 管理操作

### 容器管理

```bash
# 查看状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 更新到最新版本
docker-compose pull
docker-compose up -d
```

### 备份数据

```bash
# 备份数据目录
cp -r /path/to/gitea/data /path/to/backup/gitea-$(date +%Y%m%d)

# 或使用 tar
tar -czvf gitea-backup-$(date +%Y%m%d).tar.gz /path/to/gitea/data
```

### 恢复数据

```bash
# 停止容器
docker-compose down

# 恢复数据
cp -r /path/to/backup/data /path/to/gitea/

# 启动容器
docker-compose up -d
```

---

## 高级配置

### 使用 PostgreSQL 数据库（生产环境推荐）

```yaml
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: gitea
      POSTGRES_PASSWORD: gitea
      POSTGRES_DB: gitea
    volumes:
      - ./postgres:/var/lib/postgresql/data

  gitea:
    image: gitea/gitea:latest
    environment:
      - GITEA__database__DB_TYPE=postgres
      - GITEA__database__HOST=db:5432
      - GITEA__database__NAME=gitea
      - GITEA__database__USER=gitea
      - GITEA__database__PASSWD=gitea
    depends_on:
      - db
    ports:
      - "3001:3000"
```

### 配置 SSH 密钥

```bash
# 生成 SSH 密钥
ssh-keygen -t ed25519 -C "your_email@example.com"

# 复制公钥到 Gitea
cat ~/.ssh/id_ed25519.pub
# 在 Gitea 个人设置 → SSH/GPG 密钥中添加
```

### 启用 HTTPS（使用反向代理）

```yaml
# 使用 Nginx 反向代理
services:
  nginx:
    image: nginx:alpine
    ports:
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl

  gitea:
    image: gitea/gitea:latest
    expose:
      - "3000"
```

---

## 故障排除

### 端口冲突

```bash
# 检查端口占用
lsof -i :3000

# 修改 docker-compose.yml 使用其他端口
ports:
  - "3001:3000"  # 将主机 3001 映射到容器 3000
```

### 权限问题

```bash
# 修复数据目录权限
sudo chown -R 1000:1000 ./data
```

### 忘记管理员密码

```bash
# 进入容器
docker exec -it gitea sh

# 重置密码
gitea admin user change-password --username admin --password newpassword
```

---

## 常用命令速查

| 操作 | 命令 |
|------|------|
| 启动 | `docker-compose up -d` |
| 停止 | `docker-compose down` |
| 日志 | `docker-compose logs -f` |
| 更新 | `docker-compose pull && docker-compose up -d` |
| 备份 | `tar -czvf backup.tar.gz data/` |
| 进入容器 | `docker exec -it gitea sh` |

---

## 相关资源

- 官方文档: https://docs.gitea.io
- GitHub: https://github.com/go-gitea/gitea
- Docker Hub: https://hub.docker.com/r/gitea/gitea

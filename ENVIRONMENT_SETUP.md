# OpenClaw (ClawdBot) 环境配置指南

## 系统要求

### 操作系统
- ✅ macOS 13+（当前：macOS 26.2）
- 支持 Linux（内核 5.4+）
- Windows 10+（需要 WSL 2）

### 软件依赖
- Node.js: 最低 20.0.0，推荐 22 LTS
- npm: 最低 9.0.0，推荐 10+
- Docker: 可选（v24+），用于沙盒技能运行

### 硬件要求
- **最低配置**：1-2 vCPU、2 GB RAM、20 GB SSD
- **推荐配置**：2-4 vCPU、4 GB RAM、40-60 GB SSD
- **生产环境**：4+ vCPU、16 GB+ RAM、80 GB+ SSD

> 注意：内存比 CPU 更重要，预算有限时优先加内存

### 网络要求
- 出站 HTTPS（端口 443）访问 LLM API
- Web UI 默认端口：3000
- Webhook 回调需要互联网可达的入站端口

## 安装步骤

### 1. 安装 Node.js

#### 方式一：使用安装包（推荐）
```bash
# 双击运行项目目录下的 node-v22.17.0.pkg
# 或从官网下载：https://nodejs.org/
```

#### 方式二：使用 Homebrew
```bash
brew install node@22
```

#### 方式三：使用 nvm（Node Version Manager）
```bash
# 安装 nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 安装 Node.js 22
nvm install 22
nvm use 22
```

### 2. 验证 Node.js 安装
```bash
node --version   # 应显示 v22.x.x
npm --version    # 应显示 10.x.x
```

### 3. 安装 Docker（可选）

Docker 用于沙盒技能运行，如果不需要可以跳过。

#### 使用 Homebrew 安装
```bash
brew install --cask docker
```

#### 手动下载
从官网下载：https://www.docker.com/products/docker-desktop

#### 验证 Docker 安装
```bash
docker --version
docker run hello-world
```

### 4. 配置环境变量

创建 `.env` 文件配置 API 密钥和其他设置：

```bash
# LLM API 配置
ANTHROPIC_API_KEY=your_api_key_here
OPENAI_API_KEY=your_api_key_here

# 服务端口
PORT=3000

# 其他配置
NODE_ENV=production
```

### 5. 安装项目依赖
```bash
# 进入项目目录
cd /Users/lv111101/Documents/traecn

# 安装依赖
npm install
```

## 验证环境

运行以下命令验证环境配置：

```bash
# 检查 Node.js 版本
node --version

# 检查 npm 版本
npm --version

# 检查 Docker（如果安装）
docker --version

# 检查系统资源
sysctl -n hw.memsize      # 内存大小（字节）
sysctl -n hw.ncpu         # CPU 核心数
df -h .                   # 磁盘空间
```

## 常见问题

### 1. Node.js 安装后命令找不到
重启终端或运行：
```bash
source ~/.zshrc  # 或 source ~/.bash_profile
```

### 2. 权限问题
如果遇到 npm 权限问题：
```bash
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

### 3. 端口被占用
检查端口占用：
```bash
lsof -i :3000
```

## 下一步

环境配置完成后，可以：
1. 配置 LLM API 密钥
2. 启动服务：`npm start` 或 `npm run dev`
3. 访问 Web UI：http://localhost:3000

## 资源链接

- Node.js 官网：https://nodejs.org/
- Docker 官网：https://www.docker.com/
- Homebrew：https://brew.sh/
- nvm：https://github.com/nvm-sh/nvm

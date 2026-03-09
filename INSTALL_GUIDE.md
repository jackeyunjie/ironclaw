# OpenClaw (ClawdBot) 完整安装指南

## 当前环境状态

✅ macOS 26.2 (满足要求)
❌ Node.js 未安装
❌ npm 未安装
❌ Homebrew 未安装
❌ Docker 未安装

## 安装步骤

### 第一步：安装 Homebrew（包管理器）

**在终端中运行以下命令**（需要输入密码）：

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

安装完成后，根据提示运行（将用户名替换为你的用户名）：

```bash
# Apple Silicon Mac (M1/M2/M3)
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> /Users/lv111101/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"

# Intel Mac
echo 'eval "$(/usr/local/bin/brew shellenv)"' >> /Users/lv111101/.zprofile
eval "$(/usr/local/bin/brew shellenv)"
```

验证安装：
```bash
brew --version
```

---

### 第二步：安装 Node.js 22 LTS

使用 Homebrew 安装 Node.js：

```bash
brew install node@22
```

安装完成后，验证：

```bash
node --version   # 应显示 v22.x.x
npm --version    # 应显示 10.x.x
```

---

### 第三步：安装 Docker（可选）

Docker 用于沙盒技能运行，如果不需要可以跳过。

```bash
brew install --cask docker
```

安装后打开 Docker Desktop 应用，验证：

```bash
docker --version
```

---

### 第四步：配置项目

1. 进入项目目录：
```bash
cd /Users/lv111101/Documents/traecn
```

2. 创建环境配置文件：
```bash
# 创建 .env 文件
cat > .env << 'EOF'
# LLM API 配置（选择一个或多个）
ANTHROPIC_API_KEY=your_anthropic_key_here
OPENAI_API_KEY=your_openai_key_here

# 服务端口
PORT=3000

# 运行环境
NODE_ENV=development
EOF
```

3. 编辑 `.env` 文件，填入你的 API 密钥：
```bash
nano .env
# 或使用你喜欢的编辑器
```

---

### 第五步：安装项目依赖

```bash
npm install
```

---

### 第六步：验证环境

运行环境检查脚本：

```bash
./check-environment.sh
```

或手动检查：

```bash
# 检查 Node.js
node --version

# 检查 npm
npm --version

# 检查 Docker（如果安装）
docker --version

# 检查系统资源
sysctl -n hw.memsize      # 内存（字节）
sysctl -n hw.ncpu         # CPU 核心数
df -h .                   # 磁盘空间
```

---

## 快速命令参考

```bash
# 安装 Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 配置 Homebrew (Apple Silicon)
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"

# 安装 Node.js
brew install node@22

# 安装 Docker
brew install --cask docker

# 验证安装
node --version && npm --version

# 安装项目依赖
npm install

# 启动服务
npm start
```

---

## 常见问题

### 1. Homebrew 安装慢
可以使用国内镜像：
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 2. Node.js 安装后找不到命令
重启终端或运行：
```bash
source ~/.zprofile
```

### 3. npm 权限问题
```bash
sudo chown -R $(whoami) ~/.npm
```

### 4. 端口被占用
```bash
# 查找占用端口的进程
lsof -i :3000

# 终止进程（PID 从上一步获取）
kill -9 <PID>
```

---

## 下一步

环境配置完成后：

1. **配置 API 密钥**：编辑 `.env` 文件
2. **安装依赖**：`npm install`
3. **启动服务**：`npm start` 或 `npm run dev`
4. **访问 Web UI**：http://localhost:3000

---

## 需要帮助？

如果遇到问题，请提供：
- 运行 `./check-environment.sh` 的输出
- 具体的错误信息

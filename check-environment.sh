#!/bin/bash

echo "======================================"
echo "OpenClaw (ClawdBot) 环境检查脚本"
echo "======================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查函数
check_pass() {
    echo -e "${GREEN}✓ $1${NC}"
}

check_fail() {
    echo -e "${RED}✗ $1${NC}"
}

check_warn() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# 检查操作系统
echo ">>> 检查操作系统"
OS_TYPE=$(uname -s)
if [ "$OS_TYPE" = "Darwin" ]; then
    OS_VERSION=$(sw_vers -productVersion)
    MAJOR_VERSION=$(echo $OS_VERSION | cut -d. -f1)
    if [ "$MAJOR_VERSION" -ge 13 ]; then
        check_pass "macOS $OS_VERSION (满足要求)"
    else
        check_fail "macOS $OS_VERSION (需要 13+)"
    fi
elif [ "$OS_TYPE" = "Linux" ]; then
    check_pass "Linux 系统"
else
    check_fail "不支持的操作系统: $OS_TYPE"
fi
echo ""

# 检查 Node.js
echo ">>> 检查 Node.js"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v | cut -d'v' -f2)
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d. -f1)
    if [ "$NODE_MAJOR" -ge 22 ]; then
        check_pass "Node.js $NODE_VERSION (推荐版本)"
    elif [ "$NODE_MAJOR" -ge 20 ]; then
        check_warn "Node.js $NODE_VERSION (满足最低要求，推荐升级到 22 LTS)"
    else
        check_fail "Node.js $NODE_VERSION (需要 20.0.0+)"
    fi
else
    check_fail "Node.js 未安装"
    echo "    安装方式："
    echo "    1. 双击运行 node-v22.17.0.pkg"
    echo "    2. 或运行: brew install node@22"
fi
echo ""

# 检查 npm
echo ">>> 检查 npm"
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    NPM_MAJOR=$(echo $NPM_VERSION | cut -d. -f1)
    if [ "$NPM_MAJOR" -ge 10 ]; then
        check_pass "npm $NPM_VERSION (推荐版本)"
    elif [ "$NPM_MAJOR" -ge 9 ]; then
        check_warn "npm $NPM_VERSION (满足最低要求)"
    else
        check_fail "npm $NPM_VERSION (需要 9.0.0+)"
    fi
else
    check_fail "npm 未安装"
fi
echo ""

# 检查 Docker
echo ">>> 检查 Docker (可选)"
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version | grep -oE '[0-9]+\.[0-9]+\.[0-9]+')
    check_pass "Docker $DOCKER_VERSION (已安装)"
else
    check_warn "Docker 未安装 (可选，用于沙盒技能)"
    echo "    安装方式: brew install --cask docker"
fi
echo ""

# 检查系统资源
echo ">>> 检查系统资源"
if [ "$OS_TYPE" = "Darwin" ]; then
    # 内存（GB）
    MEM_BYTES=$(sysctl -n hw.memsize)
    MEM_GB=$((MEM_BYTES / 1073741824))
    
    # CPU
    CPU_CORES=$(sysctl -n hw.ncpu)
    
    # 磁盘
    DISK_AVAIL=$(df -h . | awk 'NR==2 {print $4}')
    
    if [ "$MEM_GB" -ge 16 ]; then
        check_pass "内存: ${MEM_GB}GB (生产环境配置)"
    elif [ "$MEM_GB" -ge 4 ]; then
        check_pass "内存: ${MEM_GB}GB (推荐配置)"
    elif [ "$MEM_GB" -ge 2 ]; then
        check_warn "内存: ${MEM_GB}GB (最低配置)"
    else
        check_fail "内存: ${MEM_GB}GB (不足，建议至少 2GB)"
    fi
    
    if [ "$CPU_CORES" -ge 4 ]; then
        check_pass "CPU: ${CPU_CORES} 核心 (推荐配置)"
    elif [ "$CPU_CORES" -ge 2 ]; then
        check_warn "CPU: ${CPU_CORES} 核心 (最低配置)"
    else
        check_fail "CPU: ${CPU_CORES} 核心 (不足)"
    fi
    
    check_pass "磁盘可用空间: $DISK_AVAIL"
fi
echo ""

# 检查网络端口
echo ">>> 检查网络端口"
PORT_3000=$(lsof -i :3000 2>/dev/null)
if [ -z "$PORT_3000" ]; then
    check_pass "端口 3000 可用"
else
    check_warn "端口 3000 已被占用"
fi
echo ""

# 总结
echo "======================================"
echo "环境检查完成"
echo "======================================"
echo ""
echo "下一步操作："
echo "1. 如果 Node.js 未安装，请运行安装包或使用 Homebrew"
echo "2. 安装项目依赖: npm install"
echo "3. 配置 API 密钥到 .env 文件"
echo "4. 启动服务: npm start"
echo ""

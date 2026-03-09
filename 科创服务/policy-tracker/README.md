# 政策跟踪器 (Policy Tracker)

企业政策申报智能管理系统，帮助企业自动发现可申请的政府政策、跟踪申报窗口期、管理申报材料。

## 功能特性

- 🔍 **智能政策匹配** - 根据企业信息自动匹配可申报政策
- 📅 **申报窗口跟踪** - 实时跟踪政策申报时间，倒计时提醒
- 📋 **材料清单管理** - 自动生成申报材料清单，支持AI辅助撰写
- 🔔 **智能提醒** - 多渠道提醒（微信/短信/邮件/APP推送）
- 🤖 **AI能力** - 政策解析、材料生成、智能问答
- 📊 **数据可视化** - 申报统计、政策分析看板
- 📱 **微信小程序** - 随时随地跟踪政策动态

## 技术栈

### 后端
- **框架**: NestJS + TypeScript
- **数据库**: PostgreSQL + TypeORM
- **缓存**: Redis
- **搜索**: Elasticsearch
- **文件存储**: MinIO
- **AI**: OpenAI GPT-4

### 前端
- **框架**: React 18 + TypeScript
- **UI库**: Ant Design
- **状态管理**: React Query
- **路由**: React Router
- **图表**: Recharts

### 小程序
- **框架**: 微信小程序原生

## 项目结构

```
policy-tracker/
├── backend/              # 后端服务
│   ├── src/
│   │   ├── modules/      # 功能模块
│   │   │   ├── auth/     # 认证模块
│   │   │   ├── enterprise/  # 企业模块
│   │   │   ├── policy/   # 政策模块
│   │   │   ├── application/  # 申报模块
│   │   │   ├── ai/       # AI模块
│   │   │   ├── notification/ # 通知模块
│   │   │   └── scraper/  # 政策爬虫模块
│   │   ├── entities/     # 数据库实体
│   │   └── config/       # 配置文件
│   └── package.json
├── frontend/             # 前端应用
│   ├── src/
│   │   ├── pages/        # 页面组件
│   │   ├── layouts/      # 布局组件
│   │   ├── services/     # API服务
│   │   └── types/        # TypeScript类型
│   └── package.json
├── mini-app/             # 微信小程序
│   ├── pages/            # 小程序页面
│   └── app.json
├── nginx/                # Nginx配置
├── scripts/              # 脚本工具
└── docker-compose.yml    # Docker编排
```

## 快速开始

### Docker一键部署（推荐）

```bash
# 克隆项目
git clone https://github.com/jackeyunjie/ironclaw.git
cd ironclaw/科创服务/policy-tracker

# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 导入初始政策数据
docker-compose exec backend npm run seed
```

访问地址：
- 前端应用：http://localhost
- API文档：http://localhost/api/docs
- MinIO控制台：http://localhost:9001

### 本地开发

#### 环境要求
- Node.js >= 18
- PostgreSQL >= 14
- Redis >= 6

#### 1. 启动后端服务

```bash
cd backend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件

# 运行数据库迁移
npm run migration:run

# 启动开发服务器
npm run start:dev
```

后端服务：http://localhost:3000

#### 2. 启动前端应用

```bash
cd frontend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env

# 启动开发服务器
npm run dev
```

前端应用：http://localhost:5173

#### 3. 导入政策数据

```bash
cd scripts
node import-data.js
```

## 核心功能模块

### 政策管理
- 政策CRUD操作
- 政策状态自动更新（即将开始/申报中/即将截止/已截止）
- 政策分类和标签
- 政策搜索和筛选
- 政策爬虫自动采集

### 企业管理
- 企业信息管理
- 企业资质管理
- 知识产权管理
- 财务信息管理

### 智能匹配
- 基于企业画像的政策匹配
- 匹配度评分算法
- 个性化推荐

### 申报任务
- 申报流程管理
- 材料上传和审核
- 进度跟踪
- 结果反馈

### 通知系统
- 政策截止提醒
- 申报结果通知
- 多渠道推送（邮件/微信/短信）

### AI能力
- 政策自动解析（从PDF/网页提取信息）
- 材料智能生成
- 智能问答机器人

## API接口

详细API文档请访问：`http://localhost/api/docs` (Swagger UI)

主要接口：

### 认证
- `POST /api/v1/auth/login` - 用户登录
- `POST /api/v1/auth/register` - 用户注册
- `POST /api/v1/auth/wechat-login` - 微信登录

### 政策
- `GET /api/v1/policies` - 获取政策列表
- `GET /api/v1/policies/match` - 匹配政策
- `GET /api/v1/policies/upcoming` - 即将开始
- `GET /api/v1/policies/closing` - 即将截止

### 企业
- `GET /api/v1/enterprises/:id` - 获取企业详情
- `PUT /api/v1/enterprises/:id` - 更新企业信息
- `GET /api/v1/enterprises/:id/statistics` - 获取统计

### 申报
- `POST /api/v1/applications` - 创建申报
- `GET /api/v1/applications` - 获取申报列表
- `PATCH /api/v1/applications/:id/status` - 更新状态

### AI
- `POST /api/v1/ai/parse-policy` - 解析政策
- `POST /api/v1/ai/generate-material` - 生成材料
- `POST /api/v1/ai/chat` - 智能问答

## 部署指南

详细部署说明请查看 [DEPLOY.md](./DEPLOY.md)

### 生产环境部署步骤

1. **准备服务器**
   ```bash
   # 安装 Docker 和 Docker Compose
   curl -fsSL https://get.docker.com | sh
   ```

2. **克隆代码**
   ```bash
   git clone https://github.com/jackeyunjie/ironclaw.git
   cd ironclaw/科创服务/policy-tracker
   ```

3. **配置环境**
   ```bash
   # 编辑环境变量
   vim backend/.env

   # 配置SSL证书（如需HTTPS）
   mkdir -p nginx/ssl
   cp your-cert.crt nginx/ssl/
   cp your-key.key nginx/ssl/
   ```

4. **启动服务**
   ```bash
   docker-compose up -d --build
   ```

5. **运行迁移**
   ```bash
   docker-compose exec backend npm run migration:run
   ```

6. **导入数据**
   ```bash
   docker-compose exec backend npm run seed
   ```

## 数据备份

```bash
# 手动备份
./scripts/backup.sh

# 自动备份（添加到crontab）
0 2 * * * /path/to/policy-tracker/scripts/backup.sh
```

## 开发计划

- [x] 基础架构搭建
- [x] 后端API开发
- [x] 前端Web应用
- [x] 微信小程序
- [x] AI能力集成
- [x] Docker部署
- [ ] 移动端App（Flutter）
- [ ] 数据大屏可视化
- [ ] 智能推荐算法优化

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 许可证

[MIT](LICENSE)

## 联系方式

- GitHub Issues: https://github.com/jackeyunjie/ironclaw/issues
- 项目地址: https://github.com/jackeyunjie/ironclaw

---

Made with ❤️ by Policy Tracker Team

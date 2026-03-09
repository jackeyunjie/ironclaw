# 政策跟踪器 (Policy Tracker)

企业政策申报智能管理系统，帮助企业自动发现可申请的政府政策、跟踪申报窗口期、管理申报材料。

## 功能特性

- 🔍 **智能政策匹配** - 根据企业信息自动匹配可申报政策
- 📅 **申报窗口跟踪** - 实时跟踪政策申报时间，倒计时提醒
- 📋 **材料清单管理** - 自动生成申报材料清单，支持AI辅助撰写
- 🔔 **智能提醒** - 多渠道提醒（微信/短信/邮件/APP推送）
- 🤖 **AI能力** - 政策解析、材料生成、智能问答

## 技术栈

### 后端
- **框架**: NestJS + TypeScript
- **数据库**: PostgreSQL + TypeORM
- **缓存**: Redis
- **搜索**: Elasticsearch
- **AI**: OpenAI GPT-4 / 文心一言

### 前端
- **框架**: React 18 + TypeScript
- **UI库**: Ant Design
- **状态管理**: React Query
- **路由**: React Router

### 小程序
- **框架**: Taro 3.x
- **UI库**: Taro UI

## 项目结构

```
policy-tracker/
├── backend/              # 后端服务
│   ├── src/
│   │   ├── modules/      # 功能模块
│   │   │   ├── auth/     # 认证模块
│   │   │   ├── enterprise/  # 企业模块
│   │   │   ├── policy/   # 政策模块
│   │   │   └── ai/       # AI模块
│   │   ├── entities/     # 数据库实体
│   │   ├── dto/          # 数据传输对象
│   │   └── config/       # 配置文件
│   └── package.json
├── frontend/             # 前端应用
│   ├── src/
│   │   ├── pages/        # 页面组件
│   │   ├── components/   # 公共组件
│   │   ├── services/     # API服务
│   │   └── types/        # TypeScript类型
│   └── package.json
└── mini-app/             # 微信小程序
    └── src/
```

## 快速开始

### 环境要求
- Node.js >= 18
- PostgreSQL >= 14
- Redis >= 6

### 1. 克隆项目

```bash
git clone <repository-url>
cd policy-tracker
```

### 2. 启动后端服务

```bash
cd backend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，配置数据库等参数

# 启动开发服务器
npm run start:dev
```

后端服务将在 http://localhost:3000 启动
API文档: http://localhost:3000/api/docs

### 3. 启动前端应用

```bash
cd frontend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，配置API地址

# 启动开发服务器
npm run dev
```

前端应用将在 http://localhost:5173 启动

### 4. 数据库迁移

```bash
cd backend

# 生成迁移文件
npm run migration:generate -- -n InitialMigration

# 执行迁移
npm run migration:run
```

## 核心功能模块

### 政策管理
- 政策CRUD操作
- 政策状态自动更新（即将开始/申报中/即将截止/已截止）
- 政策分类和标签
- 政策搜索和筛选

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

### AI能力
- 政策自动解析（从PDF/网页提取信息）
- 材料智能生成
- 智能问答机器人

## API接口

### 认证接口
- POST /api/v1/auth/login - 用户登录
- POST /api/v1/auth/register - 用户注册
- POST /api/v1/auth/change-password - 修改密码

### 政策接口
- GET /api/v1/policies - 获取政策列表
- GET /api/v1/policies/:id - 获取政策详情
- POST /api/v1/policies - 创建政策
- PUT /api/v1/policies/:id - 更新政策
- DELETE /api/v1/policies/:id - 删除政策
- GET /api/v1/policies/match - 匹配政策
- GET /api/v1/policies/upcoming - 即将开始
- GET /api/v1/policies/closing - 即将截止

### 企业接口
- GET /api/v1/enterprises - 获取企业列表
- GET /api/v1/enterprises/:id - 获取企业详情
- POST /api/v1/enterprises - 创建企业
- PUT /api/v1/enterprises/:id - 更新企业
- DELETE /api/v1/enterprises/:id - 删除企业
- POST /api/v1/enterprises/:id/track-policy - 关注政策
- POST /api/v1/enterprises/:id/untrack-policy - 取消关注

## 部署

### Docker部署

```bash
# 构建镜像
docker-compose build

# 启动服务
docker-compose up -d
```

### 生产环境部署

1. 配置生产环境变量
2. 构建前端资源
3. 配置Nginx反向代理
4. 配置SSL证书
5. 启动后端服务

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 许可证

[MIT](LICENSE)

## 联系方式

如有问题或建议，欢迎提交 Issue 或联系开发团队。

# 微服务架构监控平台 - 规格说明

## 项目概述
- **项目名称**: MicroService Monitoring Platform
- **类型**: Web应用 (React + React Flow) + NestJS Backend
- **核心功能**: 拖拽式绘制微服务架构图，实时监控组件状态和连线指标
- **目标用户**: 架构师、开发人员、运维人员

## 项目结构
```
├── frontend/              # React 前端 (Vite)
│   ├── src/
│   │   ├── App.jsx       # 主应用组件
│   │   ├── components/
│   │   │   ├── Sidebar.jsx    # 组件面板
│   │   │   ├── CustomNode.jsx # 自定义节点
│   │   │   └── Preview.jsx    # 预览页面
│   │   └── index.css     # 全局样式
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
├── backend/               # NestJS 后端
│   ├── src/
│   │   ├── main.ts       # 应用入口
│   │   ├── app.module.ts # 根模块
│   │   ├── architecture/ # 架构 CRUD 模块
│   │   │   ├── architecture.entity.ts
│   │   │   ├── architecture.service.ts
│   │   │   └── architecture.controller.ts
│   │   └── webhook/     # Webhook 模块
│   │       ├── webhook.service.ts
│   │       └── webhook.controller.ts
│   ├── package.json
│   └── tsconfig.json
├── docker-compose.yml    # PostgreSQL 配置
├── SPEC.md
└── README.md
```

## 技术栈

### 前端
- React 18
- React Flow (拖拽式流程图)
- Vite (构建工具)
- CSS3 (深色主题)

### 后端
- NestJS
- TypeORM
- PostgreSQL
- Server-Sent Events (SSE)

## 后端 API

### 架构 API (`/architecture`)
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/architecture` | 获取当前架构 |
| POST | `/architecture` | 保存架构 |
| PUT | `/architecture/:id` | 更新架构 |

### Webhook API (`/webhook`)
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/webhook/stream` | SSE 实时流 (接收指标更新) |
| POST | `/webhook/metrics` | 接收节点指标上报 |
| POST | `/webhook/connection-metrics` | 接收连线指标上报 |
| GET | `/webhook/events` | 获取事件列表 |
| POST | `/webhook/subscribe` | 订阅事件通知 |
| DELETE | `/webhook/subscribe/:id` | 取消订阅 |

### 节点指标上报格式
```json
POST /webhook/metrics
{
  "nodeId": "node-xxx",
  "podIndex": 0,
  "cpu": 45,
  "memory": 60,
  "disk": 30
}
```

### 连线指标上报格式
```json
POST /webhook/connection-metrics
{
  "sourceNodeId": "gateway-xxx",
  "targetNodeId": "microservice-xxx",
  "responseTime": 85,
  "status": 200
}
```

## UI/UX 规格

### 页面结构

#### 编辑页面
- **左侧面板**: 组件列表 + 使用说明 + Webhook 上报说明
- **右侧画布**: 拖拽式架构编辑区
- **顶部工具栏**: 页面标题 + 功能按钮

#### 预览页面
- 全屏架构图展示
- 返回编辑按钮

### 视觉设计

#### 色彩方案
| 用途 | 颜色 | 说明 |
|------|------|------|
| 背景色 | `#0d1117` | 主背景 |
| 画布背景 | `#161b22` | 编辑区背景 |
| 主色调 | `#58a6ff` | 蓝色高亮 |
| 成功色 | `#22c55e` | 绿色 |
| 警告色 | `#eab308` | 黄色 |
| 错误色 | `#ef4444` | 红色 |
| 边框色 | `#30363d` | 分隔线 |
| 文字色 | `#e6edf3` | 主文字 |

#### 节点类型颜色
| 组件类型 | 颜色 |
|----------|------|
| 前端 | `#14b8a6` (青色) |
| API Gateway | `#8b5cf6` (紫色) |
| 微服务 | `#22c55e` (绿色) |
| 数据库 | `#3b82f6` (蓝色) |
| 缓存 | `#f59e0b` (橙色) |
| 消息队列 | `#ec4899` (粉色) |
| 负载均衡 | `#06b6d4` (青色) |

#### 连线样式
| 协议类型 | 样式 |
|----------|------|
| HTTP | 实线 + 蓝色 `#58a6ff` |
| gRPC | 实线 + 绿色 `#22c55e` |
| GraphQL | 虚线 + 紫色 `#a855f7` |

#### HTTP 状态码颜色
| 状态码 | 颜色 |
|--------|------|
| 2xx | 绿色 `#22c55e` |
| 4xx | 黄色 `#eab308` |
| 5xx | 红色 `#ef4444` |

### 字体
- 主字体: `'JetBrains Mono', 'Fira Code', monospace`
- 标题: 24px bold
- 节点标题: 14px semibold
- 标签: 12px regular

## 功能规格

### 可拖拽组件
1. **Frontend** - 前端应用
2. **API Gateway** - 网关服务 (支持多 Pod)
3. **Microservice** - 微服务 (支持多 Pod)
4. **Database** - 数据库
5. **Cache** - 缓存
6. **Message Queue** - 消息队列
7. **Load Balancer** - 负载均衡

### 编辑功能
- **拖拽添加**: 从左侧面板拖拽到画布
- **节点编辑**: 双击编辑节点名称、Pod 数量 (Gateway/Microservice 专用)
- **连线编辑**: 双击编辑通信协议、响应时间、状态码
- **删除**: 选中后按 Delete 删除

### 节点显示
- 节点 ID (只读，蓝色 monospace)
- 节点名称
- Pod 数量 (Gateway/Microservice 可编辑)
- Pod 状态指示器 (绿色=运行中, 灰色=停止)
- 资源使用率 (CPU/内存/磁盘)
- 使用率颜色: 绿色<70%, 黄色70-90%, 红色>90%

### 连线显示
- 通信协议 (HTTP/gRPC/GraphQL)
- 响应时间 (ms)
- HTTP 状态码
- 格式: `85ms [200]`

### 状态自动管理
- 节点初始化时默认状态为 `on`
- 超过 1 分钟未收到 Webhook 上报，状态自动变为 `off`

### 实时监控
- SSE 连接实时接收指标更新
- 节点指标通过 `/webhook/metrics` 上报
- 连线指标通过 `/webhook/connection-metrics` 上报

## 启动说明

### 前端
```bash
cd frontend
npm install
npm run dev
```

### 后端
```bash
cd backend
npm install
npm run start:dev
```

### 数据库 (Docker)
```bash
docker-compose up -d
```

## 验收标准
1. ✅ 拖拽组件到画布
2. ✅ 节点自由移动
3. ✅ 创建节点间连线
4. ✅ 删除节点和连线
5. ✅ 双击编辑节点 (ID只读, 名称可编辑, Pod数量仅Gateway/Microservice可编辑)
6. ✅ 双击编辑连线 (显示源/目标节点ID, 编辑协议/响应时间/状态码)
7. ✅ 预览页面完整显示架构
8. ✅ 深色主题视觉效果
9. ✅ NestJS 后端提供架构保存 API
10. ✅ Webhook 接收节点指标上报
11. ✅ Webhook 接收连线指标上报
12. ✅ SSE 实时推送指标更新
13. ✅ 连线显示响应时间和状态码
14. ✅ 状态码颜色区分 (2xx绿/4xx黄/5xx红)

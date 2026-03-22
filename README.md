# 微服务架构监控平台

一个可视化的微服务架构图编辑和实时监控平台。

## 功能特性

- 拖拽式绘制微服务架构图
- 支持 7 种组件类型: 前端、API Gateway、微服务、数据库、缓存、消息队列、负载均衡
- 节点间连线支持 HTTP、gRPC、GraphQL 协议
- 双击编辑节点名称和 Pod 数量
- 实时监控组件状态 (CPU/内存/磁盘使用率)
- Webhook 接口接收外部监控数据
- SSE 实时推送指标更新
- 深色主题 UI

## 技术栈

**前端**: React + React Flow + Vite  
**后端**: NestJS + TypeORM + PostgreSQL  
**实时通信**: Server-Sent Events (SSE)

## 快速开始

### 1. 启动数据库

```bash
docker-compose up -d
```

### 2. 启动后端

```bash
cd backend
npm install
npm run start:dev
```

后端运行在 http://localhost:3000

### 3. 启动前端

```bash
cd frontend
npm install
npm run dev
```

前端运行在 http://localhost:5173

## API 接口

### 架构管理

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/architecture` | 获取架构 |
| POST | `/architecture` | 保存架构 |
| PUT | `/architecture/:id` | 更新架构 |

### Webhook 监控

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/webhook/stream` | SSE 实时流 |
| POST | `/webhook/metrics` | 上报指标 |

### 指标上报示例

```bash
curl -X POST http://localhost:3000/webhook/metrics \
  -H "Content-Type: application/json" \
  -d '{
    "nodeId": "gateway-1",
    "podIndex": 0,
    "status": "on",
    "cpu": 45,
    "memory": 60,
    "disk": 30
  }'
```

## 使用说明

1. 从左侧面板拖拽组件到画布
2. 从节点上方拖到下方创建连线
3. 双击节点编辑名称和 Pod 数量
4. 双击连线修改通信协议
5. 按 Delete 键删除选中元素
6. 点击"预览"按钮查看完整架构
7. 点击"保存"按钮保存到数据库

## 项目结构

```
├── frontend/          # React 前端
│   ├── src/
│   │   ├── App.jsx           # 主组件
│   │   ├── components/
│   │   │   ├── Sidebar.jsx  # 组件面板
│   │   │   ├── CustomNode.jsx # 自定义节点
│   │   │   └── Preview.jsx  # 预览页
│   │   └── index.css        # 样式
│   └── package.json
├── backend/           # NestJS 后端
│   ├── src/
│   │   ├── architecture/    # 架构 API
│   │   └── webhook/         # Webhook API
│   └── package.json
└── docker-compose.yml       # PostgreSQL
```

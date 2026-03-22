# Microservice Monitoring Platform

[中文](./README.md) | English

A visual microservice architecture diagram editor and real-time monitoring platform.

## Features

- Drag-and-drop microservice architecture diagram
- 7 component types: Frontend, API Gateway, Microservice, Database, Cache, Message Queue, Load Balancer
- Connection protocols: HTTP, gRPC, GraphQL
- Double-click to edit node name and Pod count
- Double-click to edit connection protocol, response time, and status code
- Real-time monitoring of component status (CPU/Memory/Disk usage)
- Real-time monitoring of connection response time and HTTP status code
- Webhook interface for external monitoring data
- SSE real-time push for metrics updates
- Dark theme UI

## Tech Stack

**Frontend**: React + React Flow + Vite  
**Backend**: NestJS + TypeORM + PostgreSQL  
**Real-time**: Server-Sent Events (SSE)

## Quick Start

### 1. Start Database

```bash
docker-compose up -d
```

### 2. Start Backend

```bash
cd backend
npm install
npm run start:dev
```

Backend runs on http://localhost:3000

### 3. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on http://localhost:5173

## API Endpoints

### Architecture Management

| Method | Path | Description |
|--------|------|-------------|
| GET | `/architecture` | Get architecture |
| POST | `/architecture` | Save architecture |
| PUT | `/architecture/:id` | Update architecture |

### Webhook Monitoring

| Method | Path | Description |
|--------|------|-------------|
| GET | `/webhook/stream` | SSE real-time stream |
| POST | `/webhook/metrics` | Report node metrics (CPU/Memory/Disk) |
| POST | `/webhook/connection-metrics` | Report connection metrics (response time/status) |

### Node Metrics Example

```bash
curl -X POST http://localhost:3000/webhook/metrics \
  -H "Content-Type: application/json" \
  -d '{
    "nodeId": "gateway-xxx",
    "podIndex": 0,
    "cpu": 45,
    "memory": 60,
    "disk": 30
  }'
```

### Connection Metrics Example

```bash
curl -X POST http://localhost:3000/webhook/connection-metrics \
  -H "Content-Type: application/json" \
  -d '{
    "sourceNodeId": "gateway-xxx",
    "targetNodeId": "microservice-xxx",
    "responseTime": 85,
    "status": 200
  }'
```

## Usage

1. Drag components from the left panel to the canvas
2. Drag from top to bottom of nodes to create connections
3. Double-click a node to edit name and Pod count
4. Double-click a connection to edit protocol
5. Press Delete to remove selected elements
6. Click "Preview" to view the complete architecture
7. Click "Save" to save to database

## Project Structure

```
├── frontend/          # React Frontend
│   ├── src/
│   │   ├── App.jsx           # Main component
│   │   ├── components/
│   │   │   ├── Sidebar.jsx  # Component panel
│   │   │   ├── CustomNode.jsx # Custom node
│   │   │   └── Preview.jsx  # Preview page
│   │   └── index.css        # Styles
│   └── package.json
├── backend/           # NestJS Backend
│   ├── src/
│   │   ├── architecture/    # Architecture API
│   │   └── webhook/         # Webhook API
│   └── package.json
└── docker-compose.yml       # PostgreSQL
```

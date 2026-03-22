import { useState, useCallback, useEffect, useRef } from 'react'
import ReactFlow, {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  Background,
  Controls,
  MiniMap,
} from 'reactflow'
import 'reactflow/dist/style.css'
import Sidebar from './components/Sidebar'
import CustomNode from './components/CustomNode'
import Preview from './components/Preview'

const nodeTypes = {
  custom: CustomNode,
}

const API_BASE = 'http://localhost:3000'

function App() {
  const [nodes, setNodes] = useState([])
  const [edges, setEdges] = useState([])
  const [selectedNode, setSelectedNode] = useState(null)
  const [editingNode, setEditingNode] = useState(null)
  const [editingEdge, setEditingEdge] = useState(null)
  const [viewMode, setViewMode] = useState('edit')
  const [saveMessage, setSaveMessage] = useState('')
  const nodesRef = useRef(nodes)

  useEffect(() => {
    fetch(`${API_BASE}/architecture`)
      .then(res => res.json())
      .then(data => {
        if (data.data) {
          setNodes(data.data.nodes || [])
          setEdges(data.data.edges || [])
        } else if (data.nodes && data.edges) {
          setNodes(data.nodes)
          setEdges(data.edges)
        }
      })
      .catch(err => console.log('No saved architecture yet'))
  }, [])

  useEffect(() => {
    const eventSource = new EventSource(`${API_BASE}/webhook/stream`)

    eventSource.onopen = () => {
      console.log('SSE connected')
    }

    eventSource.onmessage = (event) => {
      try {
        const metrics = JSON.parse(event.data)
        console.log('SSE received:', metrics)
        if (metrics.nodeId && metrics.podIndex !== undefined) {
          setNodes((nds) => {
            const updated = nds.map((node) => {
              if (node.id === metrics.nodeId) {
                const podData = { ...(node.data.podData || {}) }
                const podIndex = metrics.podIndex
                podData[podIndex] = {
                  ...(podData[podIndex] || { status: 'on', cpu: 0, memory: 0, disk: 0 }),
                  status: metrics.status || podData[podIndex]?.status || 'on',
                  cpu: metrics.cpu ?? podData[podIndex]?.cpu ?? 0,
                  memory: metrics.memory ?? podData[podIndex]?.memory ?? 0,
                  disk: metrics.disk ?? podData[podIndex]?.disk ?? 0,
                }
                return {
                  ...node,
                  data: { ...node.data, podData }
                }
              }
              return node
            })
            return updated
          })
        }
      } catch (e) {
        console.error('Failed to parse metrics:', e)
      }
    }

    eventSource.onerror = (error) => {
      console.log('SSE error, reconnecting...', error)
    }

    return () => {
      eventSource.close()
    }
  }, [])

  useEffect(() => {
    nodesRef.current = nodes
  }, [nodes])

  const onNodesChange = useCallback(
    (changes) => {
      setNodes((nds) => {
        const updated = applyNodeChanges(changes, nds)
        nodesRef.current = updated
        return updated
      })
    },
    []
  )

  const onEdgesChange = useCallback(
    (changes) => {
      setEdges((eds) => applyEdgeChanges(changes, eds))
    },
    []
  )

  const onConnect = useCallback(
    (params) => {
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: 'default',
            data: { protocol: 'HTTP', label: 'HTTP' },
            style: { stroke: '#58a6ff' },
          },
          eds
        )
      )
    },
    []
  )

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node)
  }, [])

  const onNodeDoubleClick = useCallback((event, node) => {
    setEditingNode(node)
  }, [])

  const onEdgeDoubleClick = useCallback((event, edge) => {
    setEditingEdge(edge)
  }, [])

  const onDragOver = useCallback((event) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event) => {
      event.preventDefault()

      const type = event.dataTransfer.getData('application/reactflow')
      if (!type) return

      const position = {
        x: event.clientX - 280,
        y: event.clientY - 50,
      }

      const nodeConfig = {
        'api-gateway': { label: 'API Gateway', icon: '⚡', color: '#8b5cf6', nodeType: 'api-gateway', desc: '网关服务' },
        'microservice': { label: 'Microservice', icon: '📦', color: '#22c55e', nodeType: 'microservice', desc: '微服务' },
        'database': { label: 'Database', icon: '💾', color: '#3b82f6', nodeType: 'database', desc: '数据库' },
        'cache': { label: 'Cache', icon: '⚡', color: '#f59e0b', nodeType: 'cache', desc: '缓存' },
        'frontend': { label: 'Frontend', icon: '🌐', color: '#14b8a6', nodeType: 'frontend', desc: '前端应用' },
        'message-queue': { label: 'Message Queue', icon: '📬', color: '#ec4899', nodeType: 'message-queue', desc: '消息队列' },
        'load-balancer': { label: 'Load Balancer', icon: '⚖️', color: '#06b6d4', nodeType: 'load-balancer', desc: '负载均衡' },
      }

      const config = nodeConfig[type] || { label: type, icon: '📦', color: '#666', nodeType: type, desc: '' }

      const newNode = {
        id: `${type}-${Date.now()}`,
        type: 'custom',
        position,
        data: {
          ...config,
          podCount: config.nodeType === 'api-gateway' || config.nodeType === 'microservice' ? 3 : 1,
          podData: config.nodeType === 'api-gateway' || config.nodeType === 'microservice'
            ? { 0: { status: 'on', cpu: 0, memory: 0, disk: 0 }, 1: { status: 'on', cpu: 0, memory: 0, disk: 0 }, 2: { status: 'on', cpu: 0, memory: 0, disk: 0 } }
            : { 0: { status: 'on', cpu: 0, memory: 0, disk: 0 } },
        },
      }

      setNodes((nds) => nds.concat(newNode))
    },
    []
  )

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === 'Delete' && selectedNode) {
        if (editingNode || editingEdge) return
        setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id))
        setEdges((eds) => eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id))
        setSelectedNode(null)
      }
    },
    [selectedNode, editingNode, editingEdge]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const handleSave = async () => {
    try {
      const response = await fetch(`${API_BASE}/architecture`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes, edges }),
      })
      if (response.ok) {
        setSaveMessage('保存成功!')
        setTimeout(() => setSaveMessage(''), 2000)
      }
    } catch (error) {
      setSaveMessage('保存失败')
      setTimeout(() => setSaveMessage(''), 2000)
    }
  }

  const handleClear = () => {
    setNodes([])
    setEdges([])
  }

  if (viewMode === 'preview') {
    return <Preview nodes={nodes} edges={edges} onBack={() => setViewMode('edit')} />
  }

  return (
    <div className="app">
      <header className="header">
        <h1>微服务架构监控平台</h1>
        <div className="header-actions">
          <span className="save-message">{saveMessage}</span>
          <button className="btn" onClick={handleClear}>清空</button>
          <button className="btn" onClick={handleSave}>保存</button>
          <button className="btn btn-primary" onClick={() => setViewMode('preview')}>预览</button>
        </div>
      </header>
      <div className="main-container">
        <Sidebar />
        <div className="flow-container" onDrop={onDrop} onDragOver={onDragOver}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onNodeDoubleClick={onNodeDoubleClick}
            onEdgeDoubleClick={onEdgeDoubleClick}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background color="#30363d" gap={16} />
            <Controls />
            <MiniMap nodeColor={(node) => node.data?.color || '#666'} />
          </ReactFlow>
        </div>
      </div>
      {editingNode && (
        <>
          <div className="overlay" onClick={() => setEditingNode(null)} />
          <div className="edit-dialog">
            <h3>编辑节点</h3>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', color: '#8b949e', display: 'block', marginBottom: '6px' }}>节点ID</label>
              <input
                type="text"
                value={editingNode.id}
                readOnly
                style={{ width: '100%', padding: '10px 12px', background: '#0d1117', border: '1px solid #30363d', borderRadius: '6px', color: '#58a6ff', fontSize: '14px', fontFamily: 'monospace' }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', color: '#8b949e', display: 'block', marginBottom: '6px' }}>节点名称</label>
              <input
                type="text"
                id="nodeLabelInput"
                defaultValue={editingNode.data.label}
                style={{ width: '100%', padding: '10px 12px', background: '#161b22', border: '1px solid #30363d', borderRadius: '6px', color: '#e6edf3', fontSize: '14px' }}
                autoFocus
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', color: '#8b949e', display: 'block', marginBottom: '6px' }}>Pod 数量</label>
              <input
                type="number"
                min="1"
                max="100"
                id="podCountInput"
                defaultValue={editingNode.data.podCount || 1}
                style={{ width: '100%', padding: '10px 12px', background: '#161b22', border: '1px solid #30363d', borderRadius: '6px', color: '#e6edf3', fontSize: '14px' }}
              />
            </div>
            <div className="edit-dialog-buttons">
              <button className="btn" onClick={() => setEditingNode(null)}>
                取消
              </button>
              <button className="btn btn-primary" onClick={() => {
                const label = document.getElementById('nodeLabelInput').value || editingNode.data.label
                const podCount = parseInt(document.getElementById('podCountInput')?.value) || 1
                setNodes((nds) => {
                  const updated = nds.map((n) =>
                    n.id === editingNode.id ? { ...n, data: { ...n.data, label, podCount } } : n
                  )
                  nodesRef.current = updated
                  return updated
                })
                setEditingNode(null)
              }}>
                确定
              </button>
            </div>
          </div>
        </>
      )}
      {editingEdge && (
        <>
          <div className="overlay" onClick={() => setEditingEdge(null)} />
          <div className="edit-dialog">
            <h3>编辑连接</h3>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', color: '#8b949e', display: 'block', marginBottom: '6px' }}>通信协议</label>
              <select
                id="protocolSelect"
                defaultValue={editingEdge.data?.protocol || 'HTTP'}
                style={{ width: '100%', padding: '10px 12px', background: '#161b22', border: '1px solid #30363d', borderRadius: '6px', color: '#e6edf3', fontSize: '14px' }}
              >
                <option value="HTTP">HTTP - 同步调用</option>
                <option value="gRPC">gRPC - 高效RPC</option>
                <option value="GraphQL">GraphQL - 查询语言</option>
              </select>
            </div>
            <div className="edit-dialog-buttons">
              <button className="btn" onClick={() => setEditingEdge(null)}>
                取消
              </button>
              <button className="btn btn-primary" onClick={() => {
                const protocol = document.getElementById('protocolSelect').value
                setEdges((eds) => eds.map((e) =>
                  e.id === editingEdge.id
                    ? {
                        ...e,
                        data: { ...e.data, protocol, label: protocol },
                        style: {
                          stroke: protocol === 'GraphQL' ? '#a855f7' : protocol === 'gRPC' ? '#22c55e' : '#58a6ff',
                          strokeDasharray: protocol === 'GraphQL' ? '5,5' : undefined,
                        },
                      }
                    : e
                ))
                setEditingEdge(null)
              }}>
                确定
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default App

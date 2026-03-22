const components = [
  { type: 'frontend', name: 'Frontend', desc: '前端应用', icon: '🌐', color: '#14b8a6' },
  { type: 'api-gateway', name: 'API Gateway', desc: '网关服务', icon: '⚡', color: '#8b5cf6' },
  { type: 'microservice', name: 'Microservice', desc: '微服务', icon: '📦', color: '#22c55e' },
  { type: 'database', name: 'Database', desc: '数据库', icon: '💾', color: '#3b82f6' },
  { type: 'cache', name: 'Cache', desc: '缓存', icon: '⚡', color: '#f59e0b' },
  { type: 'message-queue', name: 'Message Queue', desc: '消息队列', icon: '📬', color: '#ec4899' },
  { type: 'load-balancer', name: 'Load Balancer', desc: '负载均衡', icon: '⚖️', color: '#06b6d4' },
]

function Sidebar() {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }

  return (
    <aside>
      <h2>组件库</h2>
      <div className="component-list">
        {components.map((comp) => (
          <div
            key={comp.type}
            className="component-item"
            draggable
            onDragStart={(e) => onDragStart(e, comp.type)}
          >
            <div className="component-icon" style={{ backgroundColor: `${comp.color}20`, color: comp.color }}>
              {comp.icon}
            </div>
            <div className="component-info">
              <div className="component-name">{comp.name}</div>
              <div className="component-desc">{comp.desc}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="usage-guide">
        <h3>使用说明</h3>
        <ul>
          <li>从左侧拖拽组件到画布</li>
          <li>从节点上方拖到下方连线</li>
          <li>双击节点编辑属性</li>
          <li>双击连线修改协议</li>
          <li>按 Delete 删除</li>
        </ul>
        <strong style={{ marginTop: '12px', display: 'block' }}>Webhook 上报:</strong>
        <pre style={{ marginTop: '6px', fontSize: '10px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
{`POST /webhook/metrics
{"nodeId":"xxx","podIndex":0,"cpu":80,"memory":60,"disk":40}`}
        </pre>
      </div>
    </aside>
  )
}

export default Sidebar

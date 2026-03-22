import { Handle, Position } from 'reactflow'

function CustomNode({ data, selected }) {
  const isGatewayOrService = data.nodeType === 'api-gateway' || data.nodeType === 'microservice' || data.label?.includes('Gateway') || data.label?.includes('服务')
  const isStorage = data.nodeType === 'database' || data.nodeType === 'cache' || data.label?.includes('数据库') || data.label?.includes('缓存')
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'on': return '#22c55e'
      case 'off': return '#6b7280'
      case 'warning': return '#eab308'
      default: return '#22c55e'
    }
  }
  
  const getUsageColor = (value) => {
    if (value >= 90) return '#ef4444'
    if (value >= 70) return '#eab308'
    return '#22c55e'
  }
  
  const showMetrics = (isGatewayOrService && data.podCount > 0) || isStorage
  const itemCount = isGatewayOrService ? Math.min(data.podCount, 6) : 1
  const itemLabel = (i) => isStorage ? data.label : `Pod ${i + 1}`
  
  return (
    <div 
      className={`custom-node ${selected ? 'selected' : ''}`}
      style={{ borderColor: selected ? data.color : undefined }}
    >
      <Handle 
        type="target" 
        position={Position.Top} 
        style={{ 
          background: data.color, 
          width: 14, 
          height: 14,
          borderRadius: '50%',
          border: '2px solid #21262d',
          top: -7
        }} 
      />
      <div className="custom-node-header">
        <div 
          className="custom-node-icon"
          style={{ backgroundColor: `${data.color}20`, color: data.color }}
        >
          {data.icon}
        </div>
        <div className="custom-node-title">{data.label}</div>
      </div>
      <div className="custom-node-desc">{data.desc}</div>
      {showMetrics && (
        <div className="pod-status" style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {Array.from({ length: itemCount }).map((_, i) => {
            const podData = data.podData?.[i] || { status: 'on', cpu: 0, memory: 0, disk: 0 }
            const status = podData.status || 'on'
            return (
              <div 
                key={i}
                style={{ 
                  background: `${getStatusColor(status)}15`,
                  border: `1px solid ${getStatusColor(status)}40`,
                  borderRadius: '6px',
                  padding: '6px 8px',
                  fontSize: '10px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {isGatewayOrService && (
                      <>
                        <span style={{ 
                          width: '8px', 
                          height: '8px', 
                          borderRadius: '50%', 
                          backgroundColor: getStatusColor(status),
                          boxShadow: `0 0 4px ${getStatusColor(status)}`
                        }} />
                        <span style={{ fontWeight: '600', color: '#e6edf3' }}>{itemLabel(i)}</span>
                        {status === 'warning' && (
                          <span style={{ color: '#ef4444', fontSize: '10px' }}>!</span>
                        )}
                      </>
                    )}
                    {isStorage && (
                      <span style={{ fontWeight: '600', color: '#e6edf3' }}>{itemLabel(i)}</span>
                    )}
                  </div>
                  <span style={{ color: '#8b949e', fontSize: '9px' }}>
                    <span style={{ color: getUsageColor(podData.cpu) }}>C</span>:{podData.cpu}% 
                    <span style={{ color: getUsageColor(podData.memory), marginLeft: '4px' }}>M</span>:{podData.memory}% 
                    <span style={{ color: getUsageColor(podData.disk), marginLeft: '4px' }}>D</span>:{podData.disk}%
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {['cpu', 'memory', 'disk'].map((type) => {
                    const value = podData[type] || 0
                    return (
                      <div key={type} style={{ flex: 1, height: '4px', background: '#30363d', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ 
                          width: `${value}%`, 
                          height: '100%', 
                          backgroundColor: getUsageColor(value),
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
          {isGatewayOrService && data.podCount > 6 && (
            <div style={{ fontSize: '10px', color: '#8b949e', textAlign: 'center' }}>
              +{data.podCount - 6} more pods
            </div>
          )}
        </div>
      )}
      <Handle 
        type="source" 
        position={Position.Bottom} 
        style={{ 
          background: data.color, 
          width: 14, 
          height: 14,
          borderRadius: '50%',
          border: '2px solid #21262d',
          bottom: -7
        }} 
      />
    </div>
  )
}

export default CustomNode

import ReactFlow, { Background, Controls, MiniMap } from 'reactflow'
import 'reactflow/dist/style.css'
import CustomNode from './CustomNode'

const nodeTypes = {
  custom: CustomNode,
}

const getStatusColor = (status) => {
  if (status >= 500) return '#ef4444'
  if (status >= 400) return '#eab308'
  return '#22c55e'
}

const getEdgeLabelStyle = (data) => {
  if (!data?.responseTime && !data?.status) return {}
  return {
    fontSize: 10,
    fill: data.status ? getStatusColor(data.status) : '#8b949e',
    fontWeight: 500,
  }
}

const getEdgeLabelBgStyle = () => ({
  fill: '#161b22',
  fillOpacity: 0.95,
})

function Preview({ nodes, edges, onBack }) {
  return (
    <div className="preview-container">
      <div className="preview-header">
        <h1>架构预览</h1>
        <button className="btn btn-primary" onClick={onBack}>
          返回编辑
        </button>
      </div>
      <div className="preview-flow">
        <ReactFlow
          nodes={nodes}
          edges={edges.map(e => ({
            ...e,
            labelStyle: getEdgeLabelStyle(e.data),
            labelBgStyle: getEdgeLabelBgStyle(),
            labelShowBg: true,
          }))}
          nodeTypes={nodeTypes}
          fitView
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
        >
          <Background color="#30363d" gap={16} />
          <Controls />
          <MiniMap 
            nodeColor={(node) => node.data?.color || '#666'}
            style={{ background: '#161b22' }}
          />
        </ReactFlow>
      </div>
      <div style={{ 
        position: 'absolute', 
        bottom: 20, 
        right: 20, 
        background: '#161b22', 
        padding: '12px 16px', 
        borderRadius: '8px',
        border: '1px solid #30363d',
        fontSize: '12px',
        color: '#8b949e'
      }}>
        <span style={{ color: '#58a6ff' }}>节点数:</span> {nodes.length} | <span style={{ color: '#58a6ff' }}>连接数:</span> {edges.length}
      </div>
    </div>
  )
}

export default Preview

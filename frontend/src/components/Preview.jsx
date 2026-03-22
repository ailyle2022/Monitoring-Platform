import ReactFlow, { Background, Controls, MiniMap } from 'reactflow'
import 'reactflow/dist/style.css'
import CustomNode from './CustomNode'

const nodeTypes = {
  custom: CustomNode,
}

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
          edges={edges}
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


export default function checkCycle(fromId: string, toId: string, graph: any) {
    if (fromId === toId) return true//自环

    const visited = new Set()
    //深度优先遍历
    const dfs = (nodeId: string) => {
        if (visited.has(nodeId)) return false
        visited.add(nodeId)
        //获取当前节点的所有上游边
        const incomingEdges = graph.getNodeIncomingEdges(nodeId)
        for (const edge of incomingEdges) {
            const sourceNodeId = edge.sourceNodeId
            if (sourceNodeId === fromId) return true
            if (dfs(sourceNodeId)) return true
        }
        return false
    }
    return dfs(toId)
}
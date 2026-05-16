
// 排他网关引擎
function executeExclusiveGateway(flowData, gatewayNodeId, inputValue) {
    const gatewayNode = flowData.nodes.find(n => n.id === gatewayNodeId);
    const edges = flowData.edges || [];

    // 1. 获取网关所有出线
    const outgoings = edges.filter(e => e.sourceNodeId === gatewayNodeId);
    if (!outgoings.length) return null;

    const inputNum = Number(inputValue);
    let defaultEdge = null;

    // 2. 遍历判断
    for (const edge of outgoings) {
        // 标记默认分支
        if (edge.properties?.isDefault) {
            defaultEdge = edge;
            continue;
        }

        // 条件：用户写在连线上的文本，如 >3
        const condition = edge.text?.value || edge.properties?.condition;
        if (!condition) continue;

        try {
            // 后端执行判断：5 >3 → true
            const result = new Function(`return ${inputNum} ${condition}`)();
            if (result) {
                return edge; // 命中条件
            }
        } catch (e) {}
    }

    // 3. 都不满足 → 返回默认线
    return defaultEdge;
}
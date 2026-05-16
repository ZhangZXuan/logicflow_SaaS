import type { LogicNode } from './flow';

export interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
}

export interface ValidationError {
    code: string;
    message: string;
    nodeId?: string;
    edgeId?: string;
}

export interface ValidationWarning {
    code: string;
    message: string;
    nodeId?: string;
}

// ====================================
// 节点类型校验
// ====================================
function validateNodeTypes(nodes: LogicNode[], edges: any[]): ValidationError[] {
    const errors: ValidationError[] = [];

    for (const node of nodes) {
        const nodeType = node.properties?.nodeType || node.type;
        const validTypes = ['start', 'end', 'approval', 'condition', 'exclusiveGateway', 'custom-circle', 'custom-rect'];
        if (!validTypes.includes(nodeType)) {
            errors.push({
                code: 'INVALID_NODE_TYPE',
                message: `节点 "${getNodeLabel(node)}"(ID: ${node.id}) 类型 "${nodeType}" 无效`,
                nodeId: node.id,
            });
        }

        // 审批节点必须指定审批角色
        if (nodeType === 'approval' && !node.properties?.approveRole) {
            errors.push({
                code: 'APPROVAL_MISSING_ROLE',
                message: `审批节点 "${getNodeLabel(node)}" 未指定审批角色`,
                nodeId: node.id,
            });
        }

        // 条件节点必须有 label
        if (nodeType === 'condition' && !node.properties?.approveRole) {
            errors.push({
                code: 'CONDITION_MISSING_ROLE',
                message: `条件节点 "${getNodeLabel(node)}" 未指定处理角色`,
                nodeId: node.id,
            });
        }
    }

    return errors;
}

// ====================================
// 流程结构校验
// ====================================
function validateFlowStructure(nodes: LogicNode[], edges: any[]): ValidationError[] {
    const errors: ValidationError[] = [];

    // 1. 必须有节点
    if (nodes.length === 0) {
        errors.push({ code: 'NO_NODES', message: '流程图中没有任何节点' });
        return errors;
    }

    // 2. 开始节点校验：必须有且仅有一个
    const startNodes = nodes.filter(n => n.properties?.nodeType === 'start' || n.text === '开始' || (typeof n.text === 'object' && n.text?.value === '开始'));
    if (startNodes.length === 0) {
        errors.push({ code: 'NO_START_NODE', message: '流程必须包含一个【开始】节点' });
    } else if (startNodes.length > 1) {
        errors.push({ code: 'MULTI_START_NODES', message: '流程只能有一个【开始】节点' });
    }

    // 3. 结束节点校验：至少有一个
    const endNodes = nodes.filter(n => n.properties?.nodeType === 'end' || n.text === '结束' || (typeof n.text === 'object' && n.text?.value === '结束'));
    if (endNodes.length === 0) {
        errors.push({ code: 'NO_END_NODE', message: '流程必须至少包含一个【结束】节点' });
    }

    // 4. 开始节点不能有入边
    for (const start of startNodes) {
        const incomingEdges = edges.filter(e => e.targetNodeId === start.id);
        if (incomingEdges.length > 0) {
            errors.push({
                code: 'START_NODE_HAS_INCOMING',
                message: '【开始】节点不能有入边',
                nodeId: start.id,
            });
        }
    }

    // 5. 结束节点不能有出边
    for (const end of endNodes) {
        const outgoingEdges = edges.filter(e => e.sourceNodeId === end.id);
        if (outgoingEdges.length > 0) {
            errors.push({
                code: 'END_NODE_HAS_OUTGOING',
                message: '【结束】节点不能有出边',
                nodeId: end.id,
            });
        }
    }

    // 6. 所有节点必须有连线
    const connectedNodeIds = new Set<string>();
    for (const edge of edges) {
        if (edge.sourceNodeId) connectedNodeIds.add(edge.sourceNodeId);
        if (edge.targetNodeId) connectedNodeIds.add(edge.targetNodeId);
    }
    for (const node of nodes) {
        if (!connectedNodeIds.has(node.id)) {
            errors.push({
                code: 'ISOLATED_NODE',
                message: `节点 "${getNodeLabel(node)}" 未与其他节点连线，请连接或删除`,
                nodeId: node.id,
            });
        }
    }

    // 7. 开始节点到结束节点必须连通（路径可达）
    if (startNodes.length > 0 && endNodes.length > 0) {
        for (const start of startNodes) {
            for (const end of endNodes) {
                if (!hasPath(start.id, end.id, edges)) {
                    errors.push({
                        code: 'NO_PATH_TO_END',
                        message: '【开始】节点到【结束】节点之间路径不完整，存在无法到达结束节点的分支',
                        nodeId: start.id,
                    });
                    break;
                }
            }
            break; // 只检查第一个开始节点
        }
    }

    return errors;
}

// ====================================
// 边/条件校验
// ====================================
function validateEdges(nodes: LogicNode[], edges: any[]): ValidationError[] {
    const errors: ValidationError[] = [];

    for (const edge of edges) {
        // 边的起止节点都存在
        if (!edge.sourceNodeId || !edge.targetNodeId) {
            errors.push({
                code: 'INCOMPLETE_EDGE',
                message: '存在不完整的连线（缺少起点或终点），请删除后重新连接',
                edgeId: edge.id,
            });
            continue;
        }

        const sourceNode = nodes.find(n => n.id === edge.sourceNodeId);
        const targetNode = nodes.find(n => n.id === edge.targetNodeId);

        if (!sourceNode) {
            errors.push({
                code: 'EDGE_SOURCE_NOT_FOUND',
                message: `连线起点(ID: ${edge.sourceNodeId}) 不存在`,
                edgeId: edge.id,
            });
        }
        if (!targetNode) {
            errors.push({
                code: 'EDGE_TARGET_NOT_FOUND',
                message: `连线终点(ID: ${edge.targetNodeId}) 不存在`,
                edgeId: edge.id,
            });
        }

        // 重复边检测
        const duplicateCount = edges.filter(
            e => e.sourceNodeId === edge.sourceNodeId && e.targetNodeId === edge.targetNodeId
        ).length;
        if (duplicateCount > 1 && edge === edges.find(
            e => e.sourceNodeId === edge.sourceNodeId && e.targetNodeId === edge.targetNodeId
        )) {
            errors.push({
                code: 'DUPLICATE_EDGE',
                message: `节点 "${getNodeLabel(sourceNode)}" 到 "${getNodeLabel(targetNode)}" 存在重复连线`,
                edgeId: edge.id,
            });
        }
    }

    return errors;
}

// ====================================
// 排他网关校验
// ====================================
function validateExclusiveGateways(nodes: LogicNode[], edges: any[]): ValidationError[] {
    const errors: ValidationError[] = [];
    const gatewayNodes = nodes.filter(
        n => n.properties?.nodeType === 'exclusiveGateway' || n.type === 'exclusiveGateway'
    );

    for (const gateway of gatewayNodes) {
        const outgoingEdges = edges.filter(e => e.sourceNodeId === gateway.id);
        const incomingEdges = edges.filter(e => e.targetNodeId === gateway.id);

        // 必须有入边
        if (incomingEdges.length === 0) {
            errors.push({
                code: 'GATEWAY_NO_INPUT',
                message: `判断节点 "${getNodeLabel(gateway)}" 没有输入连线`,
                nodeId: gateway.id,
            });
        }

        // 必须有出边
        if (outgoingEdges.length === 0) {
            errors.push({
                code: 'GATEWAY_NO_OUTPUT',
                message: `判断节点 "${getNodeLabel(gateway)}" 没有输出连线`,
                nodeId: gateway.id,
            });
        }

        if (outgoingEdges.length < 2) {
            errors.push({
                code: 'GATEWAY_INSUFFICIENT_BRANCHES',
                message: `判断节点 "${getNodeLabel(gateway)}" 至少需要 2 条分支连线`,
                nodeId: gateway.id,
            });
        }

        // 默认流校验：最多1条
        const defaultEdges = outgoingEdges.filter((e: any) => e.properties?.isDefault);
        if (defaultEdges.length > 1) {
            errors.push({
                code: 'GATEWAY_MULTI_DEFAULT',
                message: `判断节点 "${getNodeLabel(gateway)}" 只能有 1 条默认连线，当前有 ${defaultEdges.length} 条`,
                nodeId: gateway.id,
            });
        }

        // 每条出线必须有条件（除默认流外）
        for (const edge of outgoingEdges) {
            if (edge.properties?.isDefault) continue;
            const condition = edge.text?.value || edge.properties?.condition;
            if (!condition || condition.trim() === '') {
                const targetNode = nodes.find(n => n.id === edge.targetNodeId);
                errors.push({
                    code: 'GATEWAY_BRANCH_NO_CONDITION',
                    message: `判断节点 "${getNodeLabel(gateway)}" 到 "${getNodeLabel(targetNode)}" 的连线缺少条件表达式`,
                    edgeId: edge.id,
                });
            } else {
                // 校验条件表达式格式：必须包含比较运算符
                const validCondition = /^\s*[><=!]+\s*\d+(\.\d+)?\s*$/.test(condition.trim());
                if (!validCondition) {
                    errors.push({
                        code: 'GATEWAY_INVALID_CONDITION',
                        message: `判断节点 "${getNodeLabel(gateway)}" 的条件 "${condition}" 格式无效，请使用例如 ">3", "<=5", "==1" 的格式`,
                        edgeId: edge.id,
                    });
                }
            }
        }
    }

    return errors;
}

// ====================================
// 循环依赖检测（增强版）
// ====================================
export function detectCycle(graph: any): { hasCycle: boolean; cyclePath?: string[] } {
    try {
        const nodes = graph.nodes || [];
        const edges = graph.edges || [];

        // 构建邻接表
        const adjacency = new Map<string, string[]>();
        for (const node of nodes) {
            adjacency.set(node.id, []);
        }
        for (const edge of edges) {
            const list = adjacency.get(edge.sourceNodeId);
            if (list) list.push(edge.targetNodeId);
        }

        // DFS 检测
        const visited = new Set<string>();
        const recStack = new Set<string>();
        const path: string[] = [];

        function dfs(nodeId: string): boolean {
            if (recStack.has(nodeId)) {
                // 找到循环路径
                const cycleStart = path.indexOf(nodeId);
                const cyclePath = path.slice(cycleStart).concat(nodeId);
                return true;
            }
            if (visited.has(nodeId)) return false;

            visited.add(nodeId);
            recStack.add(nodeId);
            path.push(nodeId);

            const neighbors = adjacency.get(nodeId) || [];
            for (const neighbor of neighbors) {
                if (dfs(neighbor)) return true;
            }

            recStack.delete(nodeId);
            path.pop();
            return false;
        }

        for (const node of nodes) {
            if (!visited.has(node.id)) {
                path.length = 0;
                if (dfs(node.id)) {
                    const nodeMap = new Map(nodes.map((n: any) => [n.id, n]));
                    const cycleLabels = path.map(id => {
                        const n = nodeMap.get(id);
                        return n ? getNodeLabelFromObj(n) : id;
                    });
                    return { hasCycle: true, cyclePath: cycleLabels };
                }
            }
        }

        return { hasCycle: false };
    } catch {
        return { hasCycle: false };
    }
}

// ====================================
// 主校验入口
// ====================================
export function validateProcess(nodes: LogicNode[], edges: any[]): ValidationResult {
    const errors: ValidationError[] = [
        ...validateNodeTypes(nodes, edges),
        ...validateFlowStructure(nodes, edges),
        ...validateEdges(nodes, edges),
        ...validateExclusiveGateways(nodes, edges),
    ];

    const warnings: ValidationWarning[] = [];

    // 检查：审批节点建议配置超时时间
    for (const node of nodes) {
        if (node.properties?.nodeType === 'approval' && !node.properties?.limitTime) {
            warnings.push({
                code: 'APPROVAL_NO_TIMEOUT',
                message: `审批节点 "${getNodeLabel(node)}" 建议配置超时时间`,
                nodeId: node.id,
            });
        }
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings,
    };
}

// ====================================
// 工具函数
// ====================================
function getNodeLabel(node: LogicNode | undefined): string {
    if (!node) return '未知节点';
    return getNodeLabelFromObj(node);
}

function getNodeLabelFromObj(node: any): string {
    if (typeof node.text === 'string' && node.text) return node.text;
    if (node.text?.value) return node.text.value;
    if (node.label) return node.label;
    if (node.name) return node.name;
    return node.id || '未命名节点';
}

function hasPath(fromId: string, toId: string, edges: any[]): boolean {
    const adjacency = new Map<string, string[]>();
    const allNodes = new Set<string>();

    for (const edge of edges) {
        if (!adjacency.has(edge.sourceNodeId)) {
            adjacency.set(edge.sourceNodeId, []);
        }
        adjacency.get(edge.sourceNodeId)!.push(edge.targetNodeId);
        allNodes.add(edge.sourceNodeId);
        allNodes.add(edge.targetNodeId);
    }

    // 确保目标节点在邻接表中
    if (!adjacency.has(toId)) adjacency.set(toId, []);

    const visited = new Set<string>();
    const queue = [fromId];
    visited.add(fromId);

    while (queue.length > 0) {
        const current = queue.shift()!;
        if (current === toId) return true;

        for (const neighbor of adjacency.get(current) || []) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                queue.push(neighbor);
            }
        }
    }

    return false;
}

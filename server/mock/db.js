let flowTemplates = []//流程模板
let flowInstances = []//流程实例
let users = []//用户
let templateId = 1
let instanceId = 1
let userId = 1
let approvalEvents = []//一个数组存所有审批事件
module.exports = {
    // 排他网关引擎
    executeExclusiveGateway(flowData, gatewayNodeId, inputValue) {
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
            } catch (e) { }
        }

        // 3. 都不满足 → 返回默认线
        return defaultEdge;
    },
    approvalEvents,
    //发起流程
    pushApproval(data) {
        approvalEvents.push(data)
        console.log('approvalEvents', approvalEvents)
    },
    //根据ID获取事件
    getInfo(eventId) {
        return approvalEvents.find(item => item.eventId === eventId)
    },
    //保存流程模板
    saveTemplate(data) {
        const item = {
            templateId: templateId++,
            title: data.title,
            flowData: data.flowData,
            nodeFormConfig: data.nodeFormConfig || {}
        }
        flowTemplates.push(item)
        console.log('item', item)
        return item
    },
    //获取模板
    getTemplate(tid) {
        return flowTemplates.find(t => t.templateId == tid)
    },
    //员工创建审批实例
    createInstance(data) {
        const item = {
            instanceId: instanceId++,
            templateId: data.templateId,
            title: data.title,
            formData: data.formData,
            currentNodeId: data.currentNodeId,
            status: 'pending'
        }
        flowInstances.push(item)
        return item
    },
    //获取员工的审批单
    getInstance(iid) {
        return flowInstances.find(i => i.instanceId == iid)
    },
    // 创建用户
    createUser(data) {
        const item = {
            userId: userId++,
            username: data.username,
            phone: data.phone,
            email: data.email,
            password: data.password,
            fullName: data.fullName,
            role: data.role
        }
        users.push(item)
        return item
    },
    // 根据手机号获取用户
    getUserByPhone(phone) {
        return users.find(u => u.phone == phone)
    },
    // 根据用户名获取用户
    getUserByUsername(username) {
        return users.find(u => u.username == username)
    },
    // 根据用户ID获取用户
    getUserById(id) {
        return users.find(u => u.userId == id)
    },
    // 获取所有流程模板
    getTemplates() {
        return flowTemplates
    }
}

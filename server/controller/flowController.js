const db = require('../mock/db.js')

const getNextNode = (currentNodeId, edges, nodes) => {
    const edge = edges.find(e => e.sourceNodeId === currentNodeId)
    if (!edge) return null
    return nodes.find(n => n.id === edge.targetNodeId)
}
//管理员保存流程模板
module.exports.saveTemplate = (req, res) => {
    const { title, flowData, nodeFormConfig } = req.body
    const tpl = db.saveTemplate({ title, flowData, nodeFormConfig })
    res.json({ code: 200, data: { templateId: tpl.templateId, flowData: tpl.flowData } })
}

//员工发起流程实例
//员工发起流程实例
module.exports.createInstance = (req, res) => {
    try {
        const { templateId, formData, title, userId } = req.body;

        // 安全判断：防止前端传空导致崩溃
        if (!formData || !formData.nodes || !formData.edges) {
            return res.json({
                code: 500,
                data: {

                    msg: "表单数据格式错误"
                }

            });
        }

        const { nodes, edges } = formData;

        //找到流程图的开始节点
        const startNode = nodes.find(item => item.properties?.nodeType === 'start');
        if (!startNode) {
            return res.json({
                code: 500,
                data: {

                    msg: "未找到开始节点"
                }

            });
        }

        //找到第一个审批节点
        const firstApprovalNode = getNextNode(startNode.id, edges, nodes);
        if (!firstApprovalNode) {
            return res.json({
                code: 500,
                data: {
                    msg: "未找到第一个审批节点"
                }

            });
        }

        //创建审批事件
        const newEvent = {
            eventId: Date.now(), // 事件唯一id
            title: title,
            userId: userId,
            content: title || '',//申请内容
            suggestion: [],// 意见
            formData: formData,
            currentNode: firstApprovalNode, // 当前节点（必须存id！）
            currentNodeId: firstApprovalNode.id, // 当前节点（必须存id！）
            currentApproverRole: firstApprovalNode.properties?.approveRole || "admin",
            status: 'running', // 流程状态
            createTime: new Date()
        };

        //把事件push进数组
        db.pushApproval(newEvent);

        console.log('创建成功，事件ID：', newEvent.eventId);

        // 返回正确格式，前端能拿到 instanceId
        res.json({
            code: 200,
            data: {

                instanceId: newEvent.eventId, // 👈 关键！前端要用这个
                msg: "发起成功",
                status: newEvent.status,
                formData: formData
            }

        });

    } catch (err) {
        console.error("创建流程实例错误：", err);
        res.json({
            code: 500,
            data: {

                msg: "服务器异常：" + err.message
            }

        });
    }
};
//根据userId获取我的申请
module.exports.getMyApply = (req, res) => {
    const userId = req.query.userId
    const list = db.approvalEvents.filter(item => {
        return item.userId === userId
    })
    console.log('我的申请列表：', list)
    res.json({
        code: 200,
        data: {
            list: list
        }
    })
}

// 根据审批ID获取事件信息
module.exports.idGetInfo = (req, res) => {
    try {
        // 1. 从 req.query 中获取参数
        const { eventId } = req.query;

        // 2. 参数校验：防止 undefined、空值、非数字
        if (!eventId) {
            return res.json({
                code: 400,
                data: {
                    msg: '参数错误：eventId 不能为空'
                }
            });
        }

        // 3. 转成数字类型，和你存储的类型保持一致
        const id = Number(eventId);
        if (isNaN(id)) {
            return res.json({
                code: 400,
                data: {
                    msg: '参数错误：eventId 必须是数字'
                }
            });
        }

        // 4. 调用数据库方法查询
        const event = db.getInfo(id);

        // 5. 判断是否找到数据
        if (!event) {
            return res.json({
                code: 404,
                data: {
                    msg: '未找到该审批事件'
                }
            });
        }

        // 6. 成功返回数据
        res.json({
            code: 200,
            data: {
                event: event,
                msg: '获取成功'
            }
        });

    } catch (err) {
        // 7. 捕获所有异常，防止接口崩溃 500
        console.error('获取审批事件出错：', err);
        res.json({
            code: 500,
            data: {
                msg: '服务器内部错误：' + err.message
            }
        });
    }
};

//根据角色获取待审批事件
module.exports.getPendingList = (req, res) => {
    const { useRole } = req.query
    const list = db.approvalEvents.filter(item => {
        return item.status === 'running' && item.currentApproverRole === useRole
    })
    console.log('待审批事件列表：', list)
    console.log('useRole:', useRole)
    console.log('approvalEvents:', db.approvalEvents)
    res.json({ code: 200, data: { list } })
}

// 提交申请
module.exports.handleSubmit = (req, res) => {
    try {
        const { eventId, textValue, inputValue } = req.body;

        // 1. 校验参数
        if (!eventId) {
            return res.json({ code: 400, data: { msg: 'eventId 不能为空' } });
        }
        const id = Number(eventId);
        if (isNaN(id)) {
            return res.json({ code: 400, data: { msg: 'eventId 必须是数字' } });
        }

        // 2. 校验数组
        if (!db.approvalEvents || !Array.isArray(db.approvalEvents)) {
            return res.json({ code: 500, data: { msg: '数据库未初始化' } });
        }
        // 3. 查找事件
        const event = db.approvalEvents.find(item => item.eventId === id);
        if (!event) {
            return res.json({ code: 404, data: { msg: '事件不存在' } });
        }
        // 4. 从 event 里拿流程图数据
        const { nodes, edges } = event.formData;
        if (!nodes || !edges) {
            return res.json({ code: 500, data: { msg: '流程数据不存在' } });
        }

        // 5. 获取下一个节点
        const nextNode = getNextNode(event.currentNodeId, edges, nodes);
        if (!nextNode) {
            event.status = 'finished';
            event.currentApproverRole = null;
            return res.json({ code: 200, data: { msg: '已到达流程结束' } });
        }
        if (nextNode.properties?.nodeType === 'exclusiveGateway') {
            // 执行网关判断
            const targetEdge = db.executeExclusiveGateway(
                flowData,
                nextNode.id,
                inputValue // 学生输入的天数
            );
            if (targetEdge) {
                // 网关判断后 → 真正的下一个节点
                const realNextNode = flowData.nodes.find(
                    n => n.id === targetEdge.targetNodeId
                );
                // 6. 更新节点信息
                event.currentNodeId = realNextNode.id;
                event.currentNode = realNextNode;
                event.status = 'running';
                event.createTime = new Date();
                event.currentApproverRole = realNextNode.properties?.approveRole || null;
                event.content = `${textValue}: ${inputValue}`;
                console.log(event)
            }
        }
        event.currentNodeId = nextNode.id;
        event.currentNode = nextNode;
        event.status = 'running';
        event.createTime = new Date();
        event.currentApproverRole = nextNode.properties?.approveRole || null;
        event.content = `${textValue}: ${inputValue}`;
        console.log(event)
        // 7. 如果是结束节点
        if (nextNode.properties?.nodeType === 'end') {
            event.status = 'finished';
            event.currentApproverRole = null;
        }
        res.json({ code: 200, data: { msg: '提交成功' } });

    } catch (err) {
        console.error('handleSubmit 错误:', err);
        res.json({ code: 500, data: { msg: '服务器错误: ' + err.message } });
    }
};
module.exports.getNextContinuousStudentNode = (req, res) => {
    const { eventId, currentRole } = req.query;

    // 1. 找到事件
    const event = db.approvalEvents.find(e => e.eventId == eventId);
    if (!event) {
        return res.json({ code: 404, msg: "事件不存在" });
    }

    const flowData = event.flowData;
    const allNodes = flowData?.nodes || [];
    const startNode = event.currentNode;

    const resultNodes = [];
    let targetNode = startNode;

    // 2. 核心：只按节点顺序，找连续同角色节点
    while (true) {
        if (!targetNode) break;

        // 判断当前节点角色是否匹配
        const nodeRole = targetNode.properties?.approveRole;
        if (nodeRole !== currentRole) break;

        // 是连续节点 → 加入结果
        resultNodes.push(targetNode);

        // 取下一个节点（按你的节点顺序）
        const currentIndex = allNodes.findIndex(n => n.id === targetNode.id);
        if (currentIndex === -1 || currentIndex >= allNodes.length - 1) {
            break;
        }

        // 取下一个
        targetNode = allNodes[currentIndex + 1];
    }

    // 3. 返回连续节点数组
    res.json({
        code: 200,
        data: {
            nextlist: resultNodes
        }
    });
};
//审批流转---通过
module.exports.approvePass = (req, res) => {
    const { eventId } = req.body
    const event = db.approvalEvents.find(item => item.eventId === eventId)
    if (!event) return res.json({ code: 404, data: { msg: "事件不存在" } })
    const { nodes, edges } = event.formData
    const nextNode = getNextNode(event.currentNodeId, edges, nodes)
    if (nextNode.properties.nodeType === 'end') {
        event.status = 'finished'
        event.currentApproverRole = null
    }
    else {
        event.currentNodeId = nextNode.id
        event.currentNode = nextNode
        event.status = 'running'
        event.createTime = new Date()
        event.currentApproverRole = nextNode.properties.approveRole
        db.pushApproval(event)
    }
    res.json({ code: 200, data: { msg: '审批通过' } })
}

//审批流转---驳回
module.exports.approveReject = (req, res) => {
    const { eventId } = req.body
    const event = approvalEvents.find(item => item.eventId === eventId)
    if (!event) return res.json({ code: 404, data: { msg: "事件不存在" } })
    event.status = "rejected"
    event.currentApproverRole = null
    res.json({ code: 200, data: { msg: "已驳回" } })
}
//员工查看自己的审批单
module.exports.getInstance = (req, res) => {
    const { instanceId } = req.query
    const ins = db.getInstance(instanceId)
    if (!ins)
        return res.json({ code: 404, data: { msg: '实例不存在' } })
    const tpl = db.getTemplate(ins.templateId)
    res.json({
        code: 200,
        data: {
            instanceId: ins.instanceId,
            title: ins.title,
            status: ins.status,
            flowData: tpl.flowData,
            currentNodeId: ins.currentNodeId,
            formData: ins.formData,
            currentForm: tpl.nodeFormConfig[ins.currentNodeId] || []
        }
    })
}

//获取所有流程模板（管理员接口）
module.exports.getAllTemplates = (req, res) => {
    res.json({
        code: 200,
        data: db.getTemplates()
    })
}
import { Input, InputNumber, Card, Space, Modal } from 'antd'
import { useEffect, useState, useRef } from 'react'
import { lf, flowname, type LogicNode } from './flow'
import { useDispatch } from 'react-redux'
import { setFlowData } from '../utils/redux'
import { submit } from '../utils/request'
import { validateProcess, detectCycle } from './validation'

interface RightPropertyProps {
    onSubmit: () => void;
}

export const callbacks = {
    onNodeSelected: null as ((node: any) => void) | null,
    onBlankClick: null as (() => void) | null
};
//草稿结构
export interface FlowDraft {
    id: string;
    name: string;
    nodes: any[];
    edges: any[];
    updateAt: string;//保存时间
}
//暂时保存按钮
const handleTempSave = async () => {
    const result = await checkValidate();
    if (!result) return;
    const { nodes, edges } = result;
    const draft: FlowDraft = {
        id: Date.now().toString(),
        name: `${flowname}草稿${new Date().toLocaleString()}`,
        nodes: nodes,
        edges: edges,
        updateAt: new Date().toISOString()
    }
    //保存到本地
    const existDrafts: FlowDraft[] = JSON.parse(localStorage.getItem('flowDrafts') || '[]')
    existDrafts.push(draft)
    localStorage.setItem('flowDrafts', JSON.stringify(existDrafts))
    window.dispatchEvent(new CustomEvent('draftUpdate'));
    lf.current.clearData()
    alert('草稿已保存')
}


// 显示校验错误详情
function showValidationErrors(errors: { code: string; message: string; nodeId?: string }[]) {
    Modal.error({
        title: '流程校验未通过',
        width: 520,
        content: (
            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                <p style={{ color: '#ff4d4f', marginBottom: 12 }}>
                    发现 {errors.length} 个问题，请逐一修复：
                </p>
                <ul style={{ paddingLeft: 20, margin: 0 }}>
                    {errors.map((err, idx) => (
                        <li key={idx} style={{
                            marginBottom: 8,
                            padding: '8px 12px',
                            background: '#fff2f0',
                            borderRadius: 4,
                            border: '1px solid #ffccc7',
                            fontSize: 13,
                            lineHeight: 1.5,
                            listStyle: 'none',
                        }}>
                            {err.message}
                        </li>
                    ))}
                </ul>
            </div>
        ),
        okText: '知道了',
    });
}

//显示校验警告
function showValidationWarnings(warnings: { code: string; message: string }[], onConfirm: () => void) {
    if (warnings.length === 0) {
        onConfirm();
        return;
    }
    Modal.confirm({
        title: '流程优化建议',
        width: 480,
        content: (
            <div>
                <p style={{ color: '#faad14', marginBottom: 12 }}>
                    以下问题不影响提交，但建议优化：
                </p>
                <ul style={{ paddingLeft: 20, margin: 0 }}>
                    {warnings.map((w, idx) => (
                        <li key={idx} style={{
                            marginBottom: 6,
                            padding: '6px 10px',
                            background: '#fffbe6',
                            borderRadius: 4,
                            border: '1px solid #ffe58f',
                            fontSize: 13,
                            listStyle: 'none',
                        }}>
                            {w.message}
                        </li>
                    ))}
                </ul>
            </div>
        ),
        okText: '仍然提交',
        cancelText: '返回修改',
        onOk: onConfirm,
    });
}

//提交校验函数
export async function checkValidate() {
    // 1. 校验流程名称
    if (!flowname || flowname.trim() === '') {
        Modal.warning({ title: '提示', content: '请输入流程名称' });
        return false;
    }

    // 2. 获取画布真实数据
    const graphData = lf.current?.getGraphData();
    if (!graphData) {
        Modal.warning({ title: '提示', content: '画布未初始化' });
        return false;
    }

    const { nodes, edges } = graphData;

    // 3. 使用统一的校验引擎
    const result = validateProcess(nodes, edges);

    if (!result.valid) {
        showValidationErrors(result.errors);
        return false;
    }

    // 4. 循环依赖检测（二次确认）
    const cycleResult = detectCycle({ nodes, edges });
    if (cycleResult.hasCycle) {
        Modal.error({
            title: '检测到循环依赖',
            content: (
                <div>
                    <p>流程中存在循环路径：</p>
                    <p style={{
                        color: '#ff4d4f',
                        fontWeight: 'bold',
                        padding: 8,
                        background: '#fff2f0',
                        borderRadius: 4,
                    }}>
                        {cycleResult.cyclePath?.join(' → ')}
                    </p>
                    <p>请检查并删除循环连线后重新提交。</p>
                </div>
            ),
        });
        return false;
    }

    try {
        const res = await submit.post('/saveTemplate', {
            title: `${flowname}`,
            flowData: { nodes, edges }
        })
        console.log('res', res)
    } catch (e: any) {
        console.log(e.status)
    }

    // 5. 警告确认
    return new Promise<{ nodes: any[]; edges: any[] } | false>((resolve) => {
        showValidationWarnings(result.warnings, () => resolve({ nodes, edges }));
    });
}
export default function RightProperty({ onSubmit }: RightPropertyProps) {
    const dispatch = useDispatch();
    //选中节点
    const [selectedNode, setSelectedNode] = useState<LogicNode | null>(null)

    useEffect(() => {
        const timer = setInterval(() => {
            if (!lf.current) return
            clearInterval(timer)
            // 把事件绑定 抽成一个函数
            const bindEvents = () => {
                // 先清掉旧事件，防止重复
                lf.current!.off('node:click')
                lf.current!.off('node:delete')
                lf.current!.off('blank:click')

                // 点击节点
                lf.current!.on('node:click', (e: any) => {
                    console.log('点击节点', e.data)
                    setSelectedNode(e.data)
                })

                // 空白点击
                lf.current!.on('blank:click', () => {
                    setSelectedNode(null)
                })
                // 删除后 → 重新绑定所有事件！！！
                lf.current!.on('node:delete', () => {
                    setSelectedNode(null)
                    // 删除后立刻重新绑定事件
                    setTimeout(() => {
                        bindEvents()
                    }, 0)
                })
            }

            // 第一次绑定
            bindEvents()

        }, 100)

        return () => clearInterval(timer)
    }, [])

    //修改名称
    const timerRef = useRef<number | null>(null)
    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!selectedNode || !lf) return
        const newValue = e.target.value
        if (timerRef.current) {
            clearTimeout(timerRef.current)
        }
        timerRef.current = setTimeout(() => {
            lf.current.graphModel.updateAttributes(selectedNode.id, { text: newValue });
            setSelectedNode({ ...selectedNode })
            timerRef.current = null
        }, 1000)
    }
    //修改宽高颜色
    const handleWidthChange = (val: number | null) => {
        if (!selectedNode || !lf.current || val === null) return
        if (timerRef.current) {
            clearTimeout(timerRef.current)
        }
        timerRef.current = setTimeout(() => {
            lf.current.graphModel.updateAttributes(selectedNode.id, { width: val });
            setSelectedNode({ ...selectedNode })
            timerRef.current = null
        }, 1000)
    }
    const handleHeightChange = (val: number | null) => {
        if (!selectedNode || !lf.current || val === null) return
        if (timerRef.current) {
            clearTimeout(timerRef.current)
        }
        timerRef.current = setTimeout(() => {
            lf.current.graphModel.updateAttributes(selectedNode.id, { height: val });
            setSelectedNode({ ...selectedNode })
            timerRef.current = null
        }, 1000)

    }
    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!selectedNode || !lf.current) return
        const newColor = e.target.value
        lf.current.updateAttributes(selectedNode.id, {
            style: {
                ...selectedNode.style,
                fill: newColor
            }
        })
    }

    return (
        <div style={{
            width: 200,
            borderLeft: '1px solid #e5e7eb',
            padding: '16px',
            background: '#fafafa',
            overflowY: 'auto'
        }}>
            <Card size='small' title='节点属性设置'>
                {
                    selectedNode ? (
                        <Space orientation="vertical" style={{ width: '100%' }} size="middle">

                            <div>
                                <div style={{ marginBottom: 4, fontSize: 14 }}>
                                    节点名称
                                </div>
                                <Input
                                    value={typeof selectedNode.text === 'string' ? selectedNode.text : selectedNode.text.value || ''}
                                    onChange={handleTextChange}
                                />
                            </div>

                            <div>
                                <div style={{
                                    marginBottom: 4, fontSize: 12
                                }}>
                                    宽度
                                </div>
                                <InputNumber
                                    style={{ width: '100%' }}
                                    value={selectedNode.properties.width}
                                    onChange={handleWidthChange}
                                />
                            </div>

                            <div>
                                <div style={{
                                    marginBottom: 4, fontSize: 12
                                }}>
                                    高度
                                </div>
                                <InputNumber
                                    style={{ width: '100%' }}
                                    value={selectedNode.properties.height}
                                    onChange={handleHeightChange}
                                />
                            </div>

                            <div>
                                <div style={{
                                    marginBottom: 4, fontSize: 12
                                }}>
                                    颜色
                                </div>
                                <Input
                                    placeholder='#fff/red/rgba(...)'

                                    onChange={handleColorChange}
                                />
                            </div>
                        </Space>
                    ) :
                        <div style={{ textAlign: 'center', color: '#999', padding: '40px 0' }}>
                            请点击画布中的节点
                        </div>
                }
            </Card>

            <div style={{ marginTop: '20px' }}>
                <button
                    style={{
                        width: '100%',
                        padding: '10px',
                        backgroundColor: '#1890ff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px'
                    }}
                    onClick={async () => {
                        const result = await checkValidate();
                        if (result) {
                            const { nodes, edges } = result;
                            dispatch(setFlowData({ flowName: flowname, nodes, edges }));
                            console.log("nodes", nodes);
                            console.log("edges", edges);
                            // 提交成功后重置流程
                            onSubmit();
                        }
                    }}
                >
                    提交申请
                </button>
                <button
                    style={{
                        width: '100%',
                        padding: '10px',
                        marginTop: '10px',
                        backgroundColor: '#1890ff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px'
                    }}
                    onClick={() => handleTempSave()}
                >
                    保存草稿
                </button>
            </div>
        </div>
    )
}
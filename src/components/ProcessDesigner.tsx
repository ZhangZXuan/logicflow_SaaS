import './ProcessDesigner.css'
import Flow from '../logicFlow/flow'
import RightProperty from '../logicFlow/rightProperty'
import { useState, useEffect } from 'react'
import type { FlowDraft } from '../logicFlow/rightProperty'
import { lf, resetFlowname } from '../logicFlow/flow'

export default function ProcessDesigner() {
    const [draft, setDraft] = useState<FlowDraft[]>([])
    const [beginCreate, setBeginCreate] = useState(false)
    //页面加载时读取草稿

    useEffect(() => {
        const data = localStorage.getItem('flowDrafts');
        setDraft(data ? JSON.parse(data) : []);
        // 刷新方法
        const refreshList = () => {
            const data = localStorage.getItem('flowDrafts');
            setDraft(data ? JSON.parse(data) : []);
        };

        // 监听事件
        window.addEventListener('draftUpdate', refreshList);

        // 清理
        return () => {
            window.removeEventListener('draftUpdate', refreshList);
        };
    }, []);


    const loadDraft = (draft: FlowDraft) => {
        console.log('lf', lf);
        // 1. 先判断实例是否存在
        if (!lf || !lf.current) {
            console.warn("LogicFlow 实例未就绪，无法清空画布");
            return;
        }
        // 2. 清空数据（仅清空节点/连线，不销毁实例）
        lf.current.clearData();

        // 3. 加载新草稿数据
        lf.current.render({
            nodes: draft.nodes,
            edges: draft.edges,
        });
    }

    // 重置流程设计
    const handleResetFlow = () => {
        setBeginCreate(false)
        // 清空画布
        if (lf.current) {
            lf.current.clearData()
        }
        // 重置流程名称
        resetFlowname()
    }

    // 删除草稿
    const deleteDraft = (id: string, e: React.MouseEvent) => {
        e.stopPropagation(); // 防止触发点击加载草稿的事件
        if (window.confirm('确定要删除这个草稿吗？')) {
            const updatedDrafts = draft.filter(item => item.id !== id);
            setDraft(updatedDrafts);
            localStorage.setItem('flowDrafts', JSON.stringify(updatedDrafts));
        }
    }

    return (
        <div className="container">
            <div className="designer">
                {
                    draft.map(draft => (
                        <div
                            key={draft.id}
                            className="draft_item"
                            onClick={() => loadDraft(draft)}//点击加载草稿
                        >
                            <div className="draft_name">{draft.name}</div>
                            <button
                                className="delete_btn"
                                onClick={(e) => deleteDraft(draft.id, e)}
                                title="删除草稿"
                            >
                                ×
                            </button>
                        </div>
                    ))
                }
            </div>
            <div className="designer-content">
                <Flow beginCreate={beginCreate} setBeginCreate={setBeginCreate} />
            </div>
            <div className="node-properties">
                <RightProperty onSubmit={handleResetFlow} />
            </div>
        </div>
    )
}
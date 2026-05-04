import { submit } from "../utils/request"
import { useState, useEffect } from 'react'
import './ProcessInstance.css'

export default function ProcessInstance() {
    const useRole = 'college'
    // 用 useState 来存列表数据
    const [list, setList] = useState<any[]>([])

    useEffect(() => {
        const getList = async () => {
            try {
                const res = await submit.get("/getPendingList", {
                    params: { useRole }
                })
                // 把数据存到 state 里，组件就能拿到了
                setList(res.list)
                console.log('list', res.list)
            } catch (err) {
                console.error('获取列表失败', err)
            }
        }
        getList()
    }, [])

    // 处理审批通过
    async function handleApprove(eventId: number) {
        try {
            await submit.post('/approvePass', { eventId });
            // 重新获取列表
            const res = await submit.get("/getPendingList", {
                params: { useRole }
            });
            setList(res.list);
            alert('审批通过');
        } catch (err) {
            console.error('审批失败', err);
            alert('审批失败，请稍后重试');
        }
    }

    // 处理审批驳回
    async function handleReject(eventId: number) {
        try {
            await submit.post('/approveReject', { eventId });
            // 重新获取列表
            const res = await submit.get("/getPendingList", {
                params: { useRole }
            });
            setList(res.list);
            alert('已驳回');
        } catch (err) {
            console.error('驳回失败', err);
            alert('驳回失败，请稍后重试');
        }
    }

    // 格式化时间
    function formatTime(timeStr: string) {
        const date = new Date(timeStr);
        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    return (
        <div className="process-instance-container">
            <h2>待审批流程</h2>

            {list.length === 0 ? (
                <div className="no-processes">
                    暂无待审批流程
                </div>
            ) : (
                <div className="process-list">
                    {list.map((item) => (
                        <div key={item.eventId} className="process-card">
                            <div className="process-header">
                                <h3 className="process-title">{item.title}</h3>
                                <span className="process-status">待审批</span>
                            </div>

                            <div className="process-info">
                                <div className="info-item">
                                    <span className="info-label">发起人：</span>
                                    <span className="info-value">{item.userId}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">发起时间：</span>
                                    <span className="info-value">{formatTime(item.createTime)}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">状态：</span>
                                    <span className="info-value">{item.status === 'running' ? '运行中' : item.status}</span>
                                </div>
                            </div>

                            {item.content && (
                                <div className="process-content">
                                    <div className="content-label">审批内容：</div>
                                    <div className="content-value">{item.content}</div>
                                </div>
                            )}

                            <div className="process-actions">
                                <button
                                    className="action-btn reject-btn"
                                    onClick={() => handleReject(item.eventId)}
                                >
                                    驳回
                                </button>
                                <button
                                    className="action-btn approve-btn"
                                    onClick={() => handleApprove(item.eventId)}
                                >
                                    审批通过
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
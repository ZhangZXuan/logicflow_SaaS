import './ApprovalModal.css'
import { useParams, useNavigate } from 'react-router-dom'
import { submit } from '../utils/request'
import { useEffect, useState } from 'react'
import type { LogicNode } from '../logicFlow/flow'
import { useRef } from 'react'


export default function ApprovalModal() {
    const inputEl = useRef<HTMLInputElement>(null);
    const { eventId } = useParams()//获取审批id
    const navigate = useNavigate()
    const [approveRole, setApproveRole] = useState<string | null>(null);
    const [status, setStatus] = useState<string | null>(null);
    const [currentNode, setCurrentNode] = useState<LogicNode | null>(null);
    const [title, setTitle] = useState<any | null>(null)
    //根据审批ID获取事件信息

    useEffect(() => {
        const getEvent = async (eventId: string | undefined) => {
            const res = await submit.get('/getInfo', {
                params: { eventId: eventId }
            })
            console.log(res)

            const event = res.event
            setApproveRole(event.currentApproverRole);//当前审批角色
            setStatus(event.status);//当前状态
            setCurrentNode(event.currentNode);//当前节点
            setTitle(event.title)

            console.log('currentNode:', event.currentNode)
            console.log('nodeType:', event.currentNode?.properties?.nodeType)
            console.log('title:', event.title)
        }
        getEvent(eventId)
    }, [eventId])
    //关闭弹窗-路由返回
    function closeModal() {
        navigate(-1)
    }

    //审批通过
    async function handlePass() {
        await submit.post('approvePass', { eventId })
        closeModal()
    }
    //审批驳回
    async function handleReject() {
        await submit.post('approveReject', { eventId })
    }
    //提交申请
    async function handleSubmit(eventId: string | undefined, textValue: string, inputValue: string) {
        if (!eventId) return;
        try {
            await submit.post('/handleSubmit', { eventId, textValue, inputValue });
            alert('提交成功');

            console.log('eventId:', eventId)
            const res = await submit.get('/getNextContinuousStudentNode', {
                params: { eventId: eventId, currentRole: approveRole }

            });
            const newList = res.nextlist || []
            console.log(newList)
            console.log(approveRole)
            // 如果还有学生待办 → 自动渲染下一个卡片
            if (newList.length > 0) {
                // 取第一个待办
                const nextItem = newList[0];
                // 直接设置为当前节点 → 弹窗自动出来
                setCurrentNode(nextItem);
            } else {
                alert('流程全部完成！');
                setCurrentNode(null);
                closeModal();
            }
        } catch (err) {
            console.error('提交失败:', err);
            alert('提交失败，请稍后重试');
        }
    }
    // 根据不同的 nodeType 展示不同的内容
    const renderContent = () => {
        if (!currentNode) return <div>加载中...</div>;

        const { nodeType } = currentNode.properties;

        switch (nodeType) {
            case 'condition':
                const textValue =
                    (currentNode as any).properties?._label?.[0]?.value ||
                    (currentNode as any)?.text?.value ||
                    '输入内容';
                // ||
                // (typeof currentNode.text === 'object' ? currentNode.text?.value : currentNode.text) ||
                // '输入申请';
                return (
                    <div className='condition-content'>
                        <h3>{textValue || '输入申请'}</h3>
                        <input
                            ref={inputEl}
                            type='text'
                            placeholder={`请输入${textValue || '申请内容'}`}
                            className='condition-input'
                        />
                        <button onClick={() => handleSubmit(eventId, textValue, inputEl?.current?.value || '')}>提交</button>
                    </div>
                );
            case 'start':
                return (
                    <div className='start-content'>
                        <h3>流程开始</h3>
                        <p>这是流程的起始节点</p>
                    </div>
                );
            case 'approval':
                return (
                    <div className='approval-content'>
                        <h3>审批节点</h3>
                        <p>审批角色：{approveRole || '未指定'}</p>
                        <p>审批状态：{status || '未知'}</p>
                        <div className='approval-info'>
                            <label>审批意见：</label>
                            <textarea placeholder='请输入审批意见'></textarea>
                        </div>
                    </div>
                );
            case 'end':
                return (
                    <div className='end-content'>
                        <h3>流程结束</h3>
                        <p>这是流程的结束节点</p>
                    </div>
                );
            default:
                return <div>未知节点类型</div>;
        }
    };

    // 根据不同的 nodeType 决定是否显示操作按钮
    const showButtons = currentNode?.properties?.nodeType === 'approval';

    return (
        <div className='modal-overlay' onClick={closeModal}>

            <div className='modal-card' onClick={(e) => e.stopPropagation()}>
                <h2>{title || ''}${eventId}</h2>
                <div className='content'>
                    {renderContent()}
                </div>
                {showButtons && (
                    <div className='btns'>
                        <button onClick={handleReject}>驳回</button>
                        <button onClick={handlePass}>通过</button>
                    </div>
                )}
            </div>


        </div>
    )

}


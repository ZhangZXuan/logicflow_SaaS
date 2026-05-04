import React from 'react'
//单个申请卡片
interface ApprovalCardProps {
    node: {
        id: string,
        text: { value: string },
        icon: string,
        properties: {
            nodeType: 'start' | 'approval' | 'conition' | 'end',
            type: 'custom-circle',
            approveRole?: string,
            formId?: string,
            limitTime?: number,
            className: string
        }
    }
}

const ApprovalCard: React.FC<ApprovalCardProps> = ({ node }) => {
    const { text, properties, icon } = node
    const {
        nodeType,
        approveRole,
        formId,
        limitTime,
        className
    } = properties
    const getCardStyle = () => {
        switch (nodeType) {
            case 'start':
                return { bg: '#e6f7ff', border: '#1890ff', label: '发起节点' };
            case 'approval':
                return { bg: '#f6ffed', border: '#52c41a', label: '审批节点' };
            case 'conition':
                return { bg: '#fff7e6', border: '#faad14', label: '判断节点' };
            case 'end':
                return { bg: '#f0f0f0', border: '#8c8c8c', label: '结束节点' };
            default:
                return { bg: '#ffffff', border: '#d9d9d9', label: '未知节点' }
        }
    }
    const style = getCardStyle()

    return (
        <div
            className={`approval-card ${className || ''}`}
            style={{
                border: `2px solid ${style.border}`,
                backgroundColor: style.bg,
                borderRadius: 8,
                padding: 16,
                margin: 8,
                width: 280,
            }}
        >
            {/* 卡片头部：图标+名称 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                {icon && (
                    <img
                        src={icon}
                        alt="节点图标"
                        style={{ width: 32, height: 32, borderRadius: 4 }}
                    />
                )}
                <div>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>{text.value}</div>
                    <div style={{ fontSize: 12, color: '#666' }}>{style.label}</div>
                </div>
            </div>

            {/* 卡片内容：审批信息 */}
            <div style={{ fontSize: 14, color: '#333' }}>
                {approveRole && (
                    <div style={{ marginBottom: 8 }}>
                        <span style={{ color: '#666' }}>审批角色：</span>
                        {approveRole}
                    </div>
                )}
                {formId && (
                    <div style={{ marginBottom: 8 }}>
                        <span style={{ color: '#666' }}>绑定表单ID：</span>
                        {formId}
                    </div>
                )}
                {limitTime && (
                    <div>
                        <span style={{ color: '#666' }}>审批时限：</span>
                        {limitTime} 天
                    </div>
                )}
            </div>
        </div>
    )
}

export default ApprovalCard;
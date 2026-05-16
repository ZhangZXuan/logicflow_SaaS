import './Dashboard.css'
import ApprovalMetrics from '../card/ApprovalMetrics'

export default function Dashboard() {
    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1 className="dashboard-title">数据看板</h1>
                <p className="dashboard-subtitle">实时监控流程数据与统计分析</p>
            </div>

            <ApprovalMetrics />
        </div>
    )
}

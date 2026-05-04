import './Dashboard.css'
import EchartsDemo from '../card/echart'
import * as echarts from 'echarts';

export default function Dashboard() {
    const option = {
        xAxis: {
            type: 'category',
            data: ['申请1', '申请2', '申请3', '申请4', '申请5', '申请6', '申请7'],
            axisLine: {
                lineStyle: {
                    color: '#d9d9d9'
                }
            },
            axisLabel: {
                color: '#666',
                fontSize: 12
            }
        },
        yAxis: {
            type: 'value',
            axisLine: {
                show: false
            },
            axisTick: {
                show: false
            },
            splitLine: {
                lineStyle: {
                    color: '#f0f0f0',
                    type: 'dashed'
                }
            },
            axisLabel: {
                color: '#666',
                fontSize: 12
            }
        },
        series: [{
            type: 'line',
            data: [10, 20, 30, 40, 50, 60, 70],
            smooth: true,
            symbol: 'circle',
            symbolSize: 8,
            lineStyle: {
                width: 3,
                color: '#1890ff'
            },
            itemStyle: {
                color: '#1890ff',
                borderWidth: 2,
                borderColor: '#fff'
            },
            areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
                    { offset: 1, color: 'rgba(24, 144, 255, 0.05)' }
                ])
            }
        }],
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            top: '10%',
            containLabel: true
        }
    } as echarts.EChartsOption

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1 className="dashboard-title">数据看板</h1>
                <p className="dashboard-subtitle">实时监控流程数据与统计分析</p>
            </div>

            {/* 统计卡片 */}
            <div className="stats-grid">
                <div className="stat-card primary">
                    <div className="stat-icon">📊</div>
                    <p className="stat-value">128</p>
                    <p className="stat-label">总申请数</p>
                </div>
                <div className="stat-card success">
                    <div className="stat-icon">✅</div>
                    <p className="stat-value">89</p>
                    <p className="stat-label">已完成</p>
                </div>
                <div className="stat-card warning">
                    <div className="stat-icon">⏳</div>
                    <p className="stat-value">23</p>
                    <p className="stat-label">审批中</p>
                </div>
                <div className="stat-card danger">
                    <div className="stat-icon">❌</div>
                    <p className="stat-value">16</p>
                    <p className="stat-label">已驳回</p>
                </div>
            </div>

            {/* 图表卡片 */}
            <div className="chart-card">
                <div className="chart-header">
                    <h2 className="chart-title">申请趋势</h2>
                    <div className="chart-actions">
                        <button className="action-btn active">本周</button>
                        <button className="action-btn">本月</button>
                        <button className="action-btn">全年</button>
                    </div>
                </div>
                <div className="chart-content">
                    <EchartsDemo option={option} />
                </div>
            </div>
        </div>
    )
}

import { useEffect, useRef, useState, useMemo } from 'react';
import * as echarts from 'echarts';
import './ApprovalMetrics.css';
import { submit } from '../utils/request';

// ====================================
// 类型定义
// ====================================
interface MetricsData {
    totalApplications: number;
    completed: number;
    pending: number;
    rejected: number;
    avgProcessTime: number; // 平均处理时长（小时）
    trendData: { date: string; count: number }[];
    roleDistribution: { role: string; count: number }[];
    statusDistribution: { status: string; count: number }[];
    dailyDetail: { date: string; completed: number; pending: number; rejected: number }[];
}

type TimeRange = 'week' | 'month' | 'quarter' | 'year';
type FilterRole = 'all' | 'student' | 'teacher' | 'college';

// ====================================
// 工具函数
// ====================================
function formatRole(role: string): string {
    const map: Record<string, string> = {
        student: '学生',
        teacher: '导员',
        college: '学院',
        admin: '管理员',
    };
    return map[role] || role;
}

function formatStatus(status: string): string {
    const map: Record<string, string> = {
        running: '审批中',
        finished: '已完成',
        rejected: '已驳回',
        pending: '待审批',
    };
    return map[status] || status;
}

// ====================================
// 模拟数据生成（后期可替换为真实API）
// ====================================
async function fetchMetricsData(
    timeRange: TimeRange,
    role: FilterRole
): Promise<MetricsData> {
    try {
        // 尝试从后端获取数据
        const res = await submit.get('/getMetricsData', {
            params: { timeRange, role }
        });
        if (res) return res as MetricsData;
    } catch {
        console.log('使用模拟数据');
    }
    return generateMockData(timeRange, role);
}

function generateMockData(timeRange: TimeRange, _role: FilterRole): MetricsData {
    const now = new Date();
    const dayCount = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : timeRange === 'quarter' ? 90 : 365;
    const step = timeRange === 'week' ? 1 : timeRange === 'month' ? 1 : timeRange === 'quarter' ? 7 : 30;

    const trendData: { date: string; count: number }[] = [];
    const dailyDetail: { date: string; completed: number; pending: number; rejected: number }[] = [];

    for (let i = dayCount; i >= 0; i -= step) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateStr = `${d.getMonth() + 1}/${d.getDate()}`;
        trendData.push({ date: dateStr, count: Math.floor(Math.random() * 15) + 1 });
        dailyDetail.push({
            date: dateStr,
            completed: Math.floor(Math.random() * 8),
            pending: Math.floor(Math.random() * 5),
            rejected: Math.floor(Math.random() * 3),
        });
    }

    return {
        totalApplications: 128 + Math.floor(Math.random() * 50),
        completed: 89 + Math.floor(Math.random() * 20),
        pending: 23 + Math.floor(Math.random() * 10),
        rejected: 16 + Math.floor(Math.random() * 10),
        avgProcessTime: 24 + Math.floor(Math.random() * 48),
        trendData,
        roleDistribution: [
            { role: 'student', count: 45 },
            { role: 'teacher', count: 38 },
            { role: 'college', count: 55 },
        ],
        statusDistribution: [
            { status: 'running', count: 23 },
            { status: 'finished', count: 89 },
            { status: 'rejected', count: 16 },
        ],
        dailyDetail,
    };
}

// ====================================
// ECharts Hook
// ====================================
function useECharts(
    domRef: React.RefObject<HTMLDivElement | null>,
    option: echarts.EChartsOption,
    deps: any[] = []
) {
    const chartRef = useRef<echarts.ECharts | null>(null);

    useEffect(() => {
        if (!domRef.current) return;
        if (!chartRef.current) {
            chartRef.current = echarts.init(domRef.current, undefined, { renderer: 'canvas' });
        }
        chartRef.current.setOption(option, true);
    }, deps);

    useEffect(() => {
        const handleResize = () => chartRef.current?.resize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        return () => {
            chartRef.current?.dispose();
            chartRef.current = null;
        };
    }, []);

    return chartRef;
}

// ====================================
// 主组件
// ====================================
export default function ApprovalMetrics() {
    const [timeRange, setTimeRange] = useState<TimeRange>('month');
    const [roleFilter, setRoleFilter] = useState<FilterRole>('all');
    const [data, setData] = useState<MetricsData | null>(null);
    const [loading, setLoading] = useState(true);

    const trendChartRef = useRef<HTMLDivElement>(null);
    const distributionChartRef = useRef<HTMLDivElement>(null);
    const dailyChartRef = useRef<HTMLDivElement>(null);

    // 获取数据
    useEffect(() => {
        setLoading(true);
        fetchMetricsData(timeRange, roleFilter).then(res => {
            setData(res);
            setLoading(false);
        });
    }, [timeRange, roleFilter]);

    // ====== 趋势图配置 ======
    const trendOption = useMemo((): echarts.EChartsOption => {
        if (!data) return {};
        return {
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(255,255,255,0.95)',
                borderColor: '#e8e8e8',
                borderWidth: 1,
                textStyle: { color: '#333', fontSize: 12 },
            },
            grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
            xAxis: {
                type: 'category',
                data: data.trendData.map(d => d.date),
                axisLine: { lineStyle: { color: '#d9d9d9' } },
                axisLabel: { color: '#666', fontSize: 11 },
            },
            yAxis: {
                type: 'value',
                splitLine: { lineStyle: { color: '#f0f0f0', type: 'dashed' as const } },
                axisLabel: { color: '#666', fontSize: 11 },
            },
            series: [{
                type: 'line',
                data: data.trendData.map(d => d.count),
                smooth: true,
                symbol: 'circle',
                symbolSize: 8,
                lineStyle: { width: 3, color: '#1890ff' },
                itemStyle: { color: '#1890ff', borderWidth: 2, borderColor: '#fff' },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
                        { offset: 1, color: 'rgba(24, 144, 255, 0.02)' },
                    ]),
                },
            }],
        };
    }, [data]);

    // ====== 角色分布饼图 ======
    const distributionOption = useMemo((): echarts.EChartsOption => {
        if (!data) return {};
        const colors = ['#1890ff', '#52c41a', '#faad14', '#ff4d4f'];
        return {
            tooltip: {
                trigger: 'item',
                formatter: '{b}: {c} ({d}%)',
            },
            legend: {
                bottom: 0,
                textStyle: { color: '#666', fontSize: 12 },
                data: data.roleDistribution.map(d => formatRole(d.role)),
            },
            series: [{
                type: 'pie',
                radius: ['40%', '65%'],
                center: ['50%', '45%'],
                avoidLabelOverlap: true,
                label: { show: false },
                emphasis: {
                    label: { show: true, fontSize: 14, fontWeight: 'bold' as const },
                },
                data: data.roleDistribution.map((d, i) => ({
                    name: formatRole(d.role),
                    value: d.count,
                    itemStyle: { color: colors[i % colors.length] },
                })),
            }],
        };
    }, [data]);

    // ====== 每日详情堆叠柱状图 ======
    const dailyOption = useMemo((): echarts.EChartsOption => {
        if (!data) return {};
        // 采样：数据点太多时取最近30条
        const detail = data.dailyDetail.length > 30
            ? data.dailyDetail.slice(-30)
            : data.dailyDetail;
        return {
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(255,255,255,0.95)',
                borderColor: '#e8e8e8',
                borderWidth: 1,
            },
            legend: {
                data: ['已完成', '审批中', '已驳回'],
                textStyle: { color: '#666', fontSize: 12 },
                top: 0,
            },
            grid: { left: '3%', right: '4%', bottom: '3%', top: '20%', containLabel: true },
            xAxis: {
                type: 'category',
                data: detail.map(d => d.date),
                axisLabel: { color: '#666', fontSize: 10, rotate: 45 },
                axisLine: { lineStyle: { color: '#d9d9d9' } },
            },
            yAxis: {
                type: 'value',
                splitLine: { lineStyle: { color: '#f0f0f0', type: 'dashed' as const } },
                axisLabel: { color: '#666', fontSize: 11 },
            },
            series: [
                {
                    name: '已完成',
                    type: 'bar',
                    stack: 'daily',
                    data: detail.map(d => d.completed),
                    itemStyle: { color: '#52c41a', borderRadius: [0, 0, 0, 0] },
                },
                {
                    name: '审批中',
                    type: 'bar',
                    stack: 'daily',
                    data: detail.map(d => d.pending),
                    itemStyle: { color: '#1890ff' },
                },
                {
                    name: '已驳回',
                    type: 'bar',
                    stack: 'daily',
                    data: detail.map(d => d.rejected),
                    itemStyle: { color: '#ff4d4f', borderRadius: [0, 0, 0, 0] },
                },
            ],
        };
    }, [data]);

    // 渲染图表
    useECharts(trendChartRef, trendOption, [data]);
    useECharts(distributionChartRef, distributionOption, [data]);
    useECharts(dailyChartRef, dailyOption, [data]);

    if (loading || !data) {
        return <div className="metrics-loading">加载中...</div>;
    }

    return (
        <div className="approval-metrics">
            {/* 筛选栏 */}
            <div className="metrics-filters">
                <div className="filter-group">
                    <span className="filter-label">时间范围</span>
                    <div className="filter-buttons">
                        {([
                            { value: 'week', label: '本周' },
                            { value: 'month', label: '本月' },
                            { value: 'quarter', label: '本季度' },
                            { value: 'year', label: '全年' },
                        ] as const).map(item => (
                            <button
                                key={item.value}
                                className={`filter-btn ${timeRange === item.value ? 'active' : ''}`}
                                onClick={() => setTimeRange(item.value)}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="filter-group">
                    <span className="filter-label">审批角色</span>
                    <div className="filter-buttons">
                        {([
                            { value: 'all', label: '全部' },
                            { value: 'student', label: '学生' },
                            { value: 'teacher', label: '导员' },
                            { value: 'college', label: '学院' },
                        ] as const).map(item => (
                            <button
                                key={item.value}
                                className={`filter-btn ${roleFilter === item.value ? 'active' : ''}`}
                                onClick={() => setRoleFilter(item.value)}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* 核心指标卡片 */}
            <div className="metrics-kpi-grid">
                <div className="kpi-card primary">
                    <div className="kpi-icon">
                        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                        </svg>
                    </div>
                    <div className="kpi-value">{data.totalApplications}</div>
                    <div className="kpi-label">总申请数</div>
                </div>
                <div className="kpi-card success">
                    <div className="kpi-icon">
                        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 6L9 17l-5-5" />
                        </svg>
                    </div>
                    <div className="kpi-value">{data.completed}</div>
                    <div className="kpi-label">已完成</div>
                </div>
                <div className="kpi-card warning">
                    <div className="kpi-icon">
                        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 6v6l4 2" />
                        </svg>
                    </div>
                    <div className="kpi-value">{data.pending}</div>
                    <div className="kpi-label">审批中</div>
                </div>
                <div className="kpi-card danger">
                    <div className="kpi-icon">
                        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M15 9l-6 6M9 9l6 6" />
                        </svg>
                    </div>
                    <div className="kpi-value">{data.rejected}</div>
                    <div className="kpi-label">已驳回</div>
                </div>
                <div className="kpi-card info">
                    <div className="kpi-icon">
                        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 6v6l4 2" />
                        </svg>
                    </div>
                    <div className="kpi-value">{data.avgProcessTime}h</div>
                    <div className="kpi-label">平均处理时长</div>
                </div>
            </div>

            {/* 图表区域 */}
            <div className="metrics-charts-grid">
                {/* 趋势图 */}
                <div className="metrics-chart-card wide">
                    <div className="chart-card-header">
                        <h3>申请趋势</h3>
                    </div>
                    <div ref={trendChartRef} className="chart-container" />
                </div>

                {/* 角色分布 */}
                <div className="metrics-chart-card">
                    <div className="chart-card-header">
                        <h3>审批角色分布</h3>
                    </div>
                    <div ref={distributionChartRef} className="chart-container" />
                </div>
            </div>

            {/* 每日审批详情 */}
            <div className="metrics-chart-card">
                <div className="chart-card-header">
                    <h3>每日审批详情</h3>
                </div>
                <div ref={dailyChartRef} className="chart-container tall" />
            </div>
        </div>
    );
}

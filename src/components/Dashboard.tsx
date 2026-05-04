import './Dashboard.css'
import EchartsDemo from '../card/echart'
export default function Dashboard() {
    const option = {
        xAxis: {
            type: 'category',
            data: ['申请1', '申请2', '申请3', '申请4', '申请5', '申请6', '申请7']
        },
        yAxis: {
            type: 'value'
        },
        series: [{
            type: 'line',
            data: [10, 20, 30, 40, 50, 60, 70]
        }],


    } as echarts.EChartsOption

    return (
        <div>
            数据看板
            <EchartsDemo option={option} />
        </div>
    )
}
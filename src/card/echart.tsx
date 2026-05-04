import { useEffect, useRef } from 'react'
import * as echarts from 'echarts';

interface MyEchasrtProps {
    option: echarts.EChartsOption
    width?: string
    height?: string
}

const EchartsDemo = ({ option, width = '100%', height = '400px' }: MyEchasrtProps) => {
    const chartRef = useRef<echarts.ECharts | null>(null)
    const domRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        // 初始化图表
        if (domRef.current && !chartRef.current) {
            chartRef.current = echarts.init(domRef.current)
        }
        chartRef.current?.setOption(option, true)
    }, [option])

    //窗口变化自适应
    useEffect(() => {
        // 自适应
        const handleResize = () => {
            chartRef.current?.resize()
        }
        // 监听窗口变化
        window.addEventListener('resize', handleResize)
        return () => {
            // 移除事件监听
            window.removeEventListener('resize', handleResize)
            // 销毁图表
            chartRef.current?.dispose()
            chartRef.current = null
        }
    }, [])

    //图表销毁
    useEffect(() => {
        return () => {
            chartRef.current?.dispose()
            chartRef.current = null
        }
    }, [])

    return (
        <div ref={domRef} style={{ width: width, height: height }} />
    )
}

export default EchartsDemo

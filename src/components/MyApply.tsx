import { Outlet } from 'react-router-dom';
import { submit } from '../utils/request'
import { useState, useEffect } from 'react'
import './MyApply.css'

export default function MyApply() {
    const userId = localStorage.getItem('userId')
    const [res, setRes] = useState<any | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!userId) return;
        const getMyApply = async () => {
            try {
                const res = await submit.get('/getMyApply', {
                    params: { userId: userId }
                });
                setRes(res);
            } catch (err) {
                console.error('获取我的申请失败:', err);
            } finally {
                setLoading(false);
            }
        };
        getMyApply();
    }, [userId]);

    if (!userId) return null;
    if (loading) return <div className="apply-container">加载中...</div>;
    if (!res?.data?.list?.length) return (
        <div className="apply-container">
            <p style={{ textAlign: 'center', color: '#999', padding: 40 }}>暂无申请记录</p>
            <Outlet />
        </div>
    );

    return (
        <div className='apply-container'>
            {res.data.list.map((item: any) => (
                <div key={item.eventId} className='apply-item'>
                    {item.title}
                    {item.status}
                </div>
            ))}
            <Outlet />
        </div>
    )
}
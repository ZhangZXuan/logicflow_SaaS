import { Outlet } from 'react-router-dom';
import { submit } from '../utils/request'
import { useState } from 'react'
import './MyApply.css'

export default function MyApply() {
    const userId = localStorage.getItem('userId')
    if (!userId) {
        return null
    }
    const [res, setRes] = useState<any | null>(null)
    //根据userId获取我的申请
    const getMyApply = async () => {
        const res = await submit.get('/getMyApply', {
            params: { userId: userId }
        })
        console.log(res)
        setRes(res)
    }
    getMyApply()
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
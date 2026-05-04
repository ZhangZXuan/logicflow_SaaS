import { Outlet, useMatches } from 'react-router-dom';
import Aside from '../components/aside';
import './main.css';
import Icon from '../components/iconla'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import Touxiang from '../card/Touxiang';

type RouteHandle = {
    title?: string,
    roles?: string
}


export default function MainPage() {
    const matches = useMatches();
    const handle = matches.at(-1)?.handle as RouteHandle | undefined;
    const navigate = useNavigate()

    //一进页面就获取用户信息
    useEffect(() => {
        const username = localStorage.getItem('user')
        const role = localStorage.getItem('role')
    }, [])
    return (
        <main className="main-layout">
            <Aside />
            <section className="main-content">
                <div className="header">

                    {handle?.title ?? ' '}
                    <div className="header-right">
                        <Icon />
                        <Touxiang />
                    </div>




                </div>

                <div className="body">
                    <Outlet />
                </div>

            </section>
        </main>
    );
}

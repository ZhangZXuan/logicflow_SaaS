import { Outlet, useMatches } from 'react-router-dom';
import Aside from '../components/asideStudent';
import './main.css';
import Icon from '../components/iconla'
import Touxiang from '../card/Touxiang'

type RouteHandle = {
    title?: string,
    roles?: string
}


export default function MainPage() {
    const matches = useMatches();
    const handle = matches.at(-1)?.handle as RouteHandle | undefined;

    return (
        <main className="main-layout">
            <Aside />
            <section className="main-content">
                <div className="header">
                    {handle?.title ?? ' '}
                    <Icon />
                    <Touxiang />
                </div>
                <div className="body">
                    <Outlet />
                </div>
            </section>
        </main>
    );
}

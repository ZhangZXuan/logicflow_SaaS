import { NavLink } from 'react-router-dom';
import './aside.css';

const navItems = [
    { id: 'dashboard', path: 'dashboard', label: '数据看板' },
    { id: 'designer', path: 'designer', label: '流程设计器' },
    { id: 'apply', path: 'apply', label: '发起申请' },
    { id: 'my-apply', path: 'my-apply', label: '我的申请' },
    { id: 'instances', path: 'instances', label: '流程实例' },
] as const;

export default function Aside() {
    return (
        <aside className="aside" aria-label="主导航">
            <h1 className="aside__brand">BPM</h1>
            <nav>
                <ul className="aside__nav">
                    {navItems.map((item) => (
                        <li key={item.id}>
                            <NavLink
                                to={item.path}
                                end
                                className={({ isActive }) =>
                                    isActive ? 'aside__link aside__link--active' : 'aside__link'
                                }
                            >
                                {item.label}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
}

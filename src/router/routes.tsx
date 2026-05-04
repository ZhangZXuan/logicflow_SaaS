import { createElement } from 'react';
import { Navigate, type RouteObject } from 'react-router-dom';
import App from '../App';
import LoginPage from '../pages/login';
import RegisterPage from '../pages/register';
import { lazy, Suspense } from 'react';
//懒加载所有组件
const MainPageStu = lazy(() => import('../pages/studentMain'));
const MainPageDao = lazy(() => import('../pages/daoyuanMain'));
const MainPagesXue = lazy(() => import('../pages/xueyuanMain'));
const Apply = lazy(() => import('../components/Apply'));
const MyApply = lazy(() => import('../components/MyApply'));
const ProcessDesigner = lazy(() => import('../components/ProcessDesigner'));
const ProcessInstance = lazy(() => import('../components/ProcessInstance'));
const Dashboard = lazy(() => import('../components/Dashboard'));
const ApprovalModal = lazy(() => import('../card/ApprovalModal'));
//加载中组件
const LoadingFallback = () =>
(
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '20px', height: '100vh' }}>
        <p>页面加载中...</p>
    </div>
)
//封装一个懒加载组件的工具函数
const LazyElement = (Component: any) => {
    return createElement(
        Suspense,
        { fallback: createElement(LoadingFallback) },
        createElement(Component)
    )
}


export const routes: RouteObject[] = [
    {
        element: createElement(App),
        children: [
            { path: '/', element: createElement(Navigate, { to: '/login', replace: true }) },
            { path: '/login', element: createElement(LoginPage) },
            { path: '/register', element: createElement(RegisterPage) },
            {
                path: '/college',
                element: LazyElement(MainPagesXue),
                children: [
                    {
                        index: true,
                        element: LazyElement(Dashboard),
                    },
                    { path: 'dashboard', element: LazyElement(Dashboard), handle: { title: "数据看板", roles: ['college'] } },
                    { path: 'designer', element: LazyElement(ProcessDesigner), handle: { title: "流程设计", roles: ['college'] } },
                    { path: 'apply', element: LazyElement(Apply), handle: { title: "发起申请", roles: ['college'] } },
                    { path: 'my-apply', element: LazyElement(MyApply), handle: { title: "我的申请", roles: ['college'] } },
                    {
                        path: 'instances', element: LazyElement(ProcessInstance), handle: { title: "流程实例", roles: ['college'] },
                        children: [
                            {
                                path: ':eventId',
                                element: LazyElement(ApprovalModal)
                            }
                        ]
                    },
                ],
            },
            {
                path: '/counselor',
                element: LazyElement(MainPageDao),
                children: [
                    {
                        index: true,
                        element: LazyElement(Dashboard),
                    },
                    { path: 'dashboard', element: LazyElement(Dashboard), handle: { title: "数据看板", roles: ['counselor'] } },
                    { path: 'apply', element: LazyElement(Apply), handle: { title: "发起申请", roles: ['counselor'] } },
                    { path: 'my-apply', element: LazyElement(MyApply), handle: { title: "我的申请", roles: ['counselor'] } },
                    {
                        path: 'instances', element: LazyElement(ProcessInstance), handle: { title: "流程审批", roles: ['counselor'] },
                        children: [
                            {
                                path: ':eventId',
                                element: LazyElement(ApprovalModal)
                            }
                        ]
                    },
                ],
            },
            {
                path: '/student',
                element: LazyElement(MainPageStu),
                children: [
                    {
                        index: true,
                        element: createElement(Navigate, {
                            to: '/student/apply',
                            replace: true,
                        }),
                    },
                    { path: 'apply', element: LazyElement(Apply), handle: { title: "发起申请", roles: ['student'] } },
                    {
                        path: 'my-apply', element: LazyElement(MyApply), handle: { title: "我的申请", roles: ['student'] },
                        children: [
                            {
                                path: ':eventId',
                                element: LazyElement(ApprovalModal)
                            }
                        ]
                    },
                ],
            },
            { path: '*', element: createElement(Navigate, { to: '/login', replace: true }) },
        ],
    },
];

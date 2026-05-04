import { Link, useNavigate } from 'react-router-dom';
import request, { getRequestErrorMessage } from '../utils/request'
import { useState } from 'react';


// interface LoginResult {
//     code: number;
//     data: {
//         token: string;
//         user: {
//             userId: string;
//             username: string;
//             phone: string;
//             role: 'student' | 'counselor' | 'college';
//         };
//     };
// }
export default function LoginPage() {
    const navigate = useNavigate()
    const [phone, setPhone] = useState('')
    const [password, setPassword] = useState('')
    const [errorHint, setErrorHint] = useState('')
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrorHint('')

        try {
            const id = phone.trim()
            const res = await request.post('/auth/login', {
                phone: id,
                password: password,
            })

            console.log('看这里：', res)
            const token = res.token
            const user = res.user

            localStorage.setItem('token', token)
            localStorage.setItem('user', JSON.stringify(user))
            localStorage.setItem('role', user.role)
            // 跳转
            if (user.role === 'student') {
                navigate('/student', { replace: true })
            } else if (user.role === 'counselor') {
                navigate('/counselor', { replace: true })
            } else if (user.role === 'college') {
                navigate('/college', { replace: true })
            }

        } catch (error) {
            const msg = getRequestErrorMessage(error)
            setErrorHint(msg)
            console.error('登录失败', error)
        }
    }
    return (
        <main className="auth-page">
            <section className="auth-card">
                <h1>登录</h1>
                <p className="auth-subtitle">欢迎回来，请输入账号信息</p>

                <form
                    className="auth-form"
                    onSubmit={handleSubmit}
                >
                    {errorHint ? (
                        <p className="auth-form-error" role="alert">
                            {errorHint}
                        </p>
                    ) : null}
                    <label htmlFor="login-phone">电话号</label>
                    <input id="login-phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="请输入电话号" value={phone}
                        onChange={(e) => { setPhone(e.target.value) }}
                    />

                    <label htmlFor="login-password">密码</label>
                    <input id="login-password" type="password" placeholder="请输入密码" value={password}
                        onChange={(e) => { setPassword(e.target.value) }}
                    />

                    <button type="submit">登录</button>
                </form>

                <p className="auth-tip">
                    没有账号先去注册
                    <Link to="/register" className="link-btn">
                        立即注册
                    </Link>
                </p>
            </section>
        </main>
    );
}

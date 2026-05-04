import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import request, { getRequestErrorMessage } from '../utils/request'
export default function RegisterPage() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('')
    const [phone, setPhone] = useState('')
    const [password, setPassword] = useState('')
    const [role, setRole] = useState('student') // 默认角色为学生
    const [errorHint, setErrorHint] = useState('')
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrorHint('')
        try {
            const digits = phone.replace(/\D/g, '')
            const email = digits ? `${digits}@phone.local` : ''
            const res = await request.post(
                '/auth/register',
                {
                    username,
                    phone,
                    email,
                    password,
                    fullName: '新用户',
                    role,
                }
            )
            localStorage.setItem('token', res.token)
            localStorage.setItem('user', JSON.stringify(res.user))
            navigate('/login', { replace: true })
        } catch (e) {
            const msg = getRequestErrorMessage(e)
            setErrorHint(msg)
            console.error('注册失败', msg, e)
        }
    }
    return (
        <main className="auth-page">
            <section className="auth-card">
                <h1>注册</h1>
                <p className="auth-subtitle">创建新账号，开始使用系统</p>

                <form
                    className="auth-form"
                    onSubmit={handleSubmit}
                >
                    {errorHint ? (
                        <p className="auth-form-error" role="alert">
                            {errorHint}
                        </p>
                    ) : null}
                    <label htmlFor="register-username">用户名</label>
                    <input id="register-username" type="text" placeholder="请输入用户名" value={username}
                        onChange={(e) => {
                            setUsername(e.target.value)
                        }}
                    />

                    <label htmlFor="register-phone">电话号</label>
                    <input id="register-phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="请输入电话号" value={phone}
                        onChange={(e) => {
                            setPhone(e.target.value)
                        }}
                    />

                    <label htmlFor="register-password">密码</label>
                    <input id="register-password" type="password" placeholder="请输入密码" value={password}
                        onChange={(e) => {
                            setPassword(e.target.value)
                        }}
                    />

                    <label htmlFor="register-role">角色</label>
                    <select
                        id="register-role"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: '4px',
                            border: '1px solid #d9d9d9',
                            fontSize: '14px',
                            marginBottom: '20px',
                            boxSizing: 'border-box',
                            outline: 'none',
                            transition: 'all 0.3s'
                        }}
                        onFocus={(e) => {
                            e.currentTarget.style.borderColor = '#1890ff';
                            e.currentTarget.style.boxShadow = '0 0 0 2px rgba(24, 144, 255, 0.2)';
                        }}
                        onBlur={(e) => {
                            e.currentTarget.style.borderColor = '#d9d9d9';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <option value="student">学生</option>
                        <option value="college">学院</option>
                        <option value="counselor">辅导员</option>
                    </select>

                    <button type="submit">注册</button>
                </form>

                <p className="auth-tip">
                    已有账号？
                    <Link to="/login" className="link-btn">
                        去登录
                    </Link>
                </p>
            </section>
        </main>
    );
}

const express = require('express')
const cors = require('cors')
const flowRouter = require('./routes/flow')
const db = require('./mock/db.js')

const app = express()
app.use(cors())
app.use(express.json())
app.use('/api/flow', flowRouter)

// 注册
app.post('/auth/register', (req, res) => {
    const { username, phone, email, password, fullName, role } = req.body

    // 验证必填字段
    if (!username || !phone || !password) {
        return res.json({ code: 400, msg: '用户名、电话和密码不能为空' })
    }

    // 检查用户是否已存在
    const existingUser = db.getUserByPhone(phone) || db.getUserByUsername(username)
    if (existingUser) {
        return res.json({ code: 409, msg: '用户已存在' })
    }

    // 创建新用户
    const user = db.createUser({
        username,
        phone,
        email: email || `${phone.replace(/\D/g, '')}@phone.local`,
        password,
        fullName: fullName || '新用户',
        role: role || 'student'
    })

    // 生成 token（实际项目中应该使用 JWT）
    const token = `token_${user.userId}_${Date.now()}`

    res.json({
        code: 200, data: {
            token,
            user: {
                userId: user.userId,
                username: user.username,
                phone: user.phone,
                email: user.email,
                fullName: user.fullName,
                role: user.role
            }
        }
    })
})
// 登录接口 —— 正确版本
app.post('/auth/login', (req, res) => {
    const { username, phone, password } = req.body;

    if (!password) {
        return res.json({ code: 400, msg: '密码不能为空' });
    }

    let user;
    if (phone) {
        user = db.getUserByPhone(phone);
    } else if (username) {
        user = db.getUserByUsername(username);
    }

    if (!user) {
        return res.json({ code: 404, msg: '用户不存在' });
    }

    if (user.password !== password) {
        return res.json({ code: 401, msg: '密码错误' });
    }

    const token = `token_${user.userId}_${Date.now()}`;

    // ✅ 固定返回格式，前端能正常解析
    res.json({
        code: 200,
        data: {
            token,
            user: {
                userId: user.userId,
                username: user.username,
                phone: user.phone,
                role: user.role,
            },
        },
    });
});

app.listen(3001, () => {
    console.log('服务运行在http://localhost:3001')
})
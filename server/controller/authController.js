const db = require('../mock/db.js')

// 注册
module.exports.register = (req, res) => {
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

    res.json({ code: 200, data: { token, user } })
}

// 登录
// module.exports.login = (req, res) => {
//     const { username, phone, password } = req.body

//     // 验证必填字段
//     if (!password) {
//         return res.json({ code: 400, msg: '密码不能为空' })
//     }

//     // 查找用户
//     let user
//     if (phone) {
//         user = db.getUserByPhone(phone)
//     } else if (username) {
//         user = db.getUserByUsername(username)
//     }

//     if (!user) {
//         return res.json({ code: 404, msg: '用户不存在' })
//     }

//     // 验证密码（实际项目中应该使用加密密码）
//     if (user.password !== password) {
//         return res.json({ code: 401, msg: '密码错误' })
//     }

//     // 生成 token（实际项目中应该使用 JWT）
//     const token = `token_${user.userId}_${Date.now()}`

//     res.json({ code: 200, data: { token, user } })
// }

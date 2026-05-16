const express = require('express')
const cors = require('cors')
const flowRouter = require('./routes/flow')
const authRouter = require('./routes/auth')

const app = express()
app.use(cors())
app.use(express.json())
app.use('/api/flow', flowRouter)
app.use('/auth', authRouter)

app.listen(3001, () => {
    console.log('服务运行在http://localhost:3001')
})

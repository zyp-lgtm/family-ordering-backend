import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import authRoutes from './src/routes/auth.js'
import familyRoutes from './src/routes/family.js'
import dishRoutes from './src/routes/dish.js'
import orderRoutes from './src/routes/order.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/family-ordering'

// 中间件
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 连接 MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB 连接成功'))
  .catch(err => console.error('❌ MongoDB 连接失败:', err))

// 路由
app.use('/api/auth', authRoutes)
app.use('/api/family', familyRoutes)
app.use('/api/dish', dishRoutes)
app.use('/api/order', orderRoutes)

// 健康检查
app.get('/health', (req, res) => {
  const dbState = mongoose.connection.readyState
  const dbStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  }

  res.json({
    status: 'ok',
    message: '家庭点餐 API 服务正常运行',
    database: {
      state: dbStates[dbState],
      ready: dbState === 1,
      host: process.env.MONGODB_URI ? 'configured' : 'not configured'
    }
  })
})

// 根路径
app.get('/', (req, res) => {
  res.json({
    message: '家庭点餐小程序 API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      family: '/api/family',
      dish: '/api/dish',
      order: '/api/order'
    }
  })
})

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: '服务器内部错误', message: err.message })
})

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 服务器运行在端口 ${PORT}`)
  console.log(`📝 API 文档: http://localhost:${PORT}/`)
})

import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export async function authenticate(req, res, next) {
  try {
    // 从请求头获取 token
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: '未提供认证令牌' })
    }

    const token = authHeader.substring(7)

    // 验证 token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret')

    // 查找用户
    const user = await User.findById(decoded.userId)

    if (!user) {
      return res.status(401).json({ error: '用户不存在' })
    }

    // 将用户信息附加到请求对象
    req.user = user
    next()
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: '无效的令牌' })
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: '令牌已过期' })
    }
    res.status(500).json({ error: '认证失败', message: error.message })
  }
}

export function requireOwner(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: '未认证' })
  }

  if (req.user.role !== 'owner') {
    return res.status(403).json({ error: '需要户主权限' })
  }

  next()
}

export function requireFamily(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: '未认证' })
  }

  if (!req.user.familyId) {
    return res.status(403).json({ error: '请先加入家庭' })
  }

  next()
}

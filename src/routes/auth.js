import express from 'express'
import jwt from 'jsonwebtoken'
import axios from 'axios'
import User from '../models/User.js'

const router = express.Router()

// 微信登录
router.post('/login', async (req, res) => {
  try {
    const { code, nickname, avatar } = req.body

    if (!code) {
      return res.status(400).json({ error: '缺少 code 参数' })
    }

    // 调用微信接口获取 openid
    const wxResponse = await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
      params: {
        appid: process.env.WECHAT_APPID,
        secret: process.env.WECHAT_SECRET,
        js_code: code,
        grant_type: 'authorization_code'
      }
    })

    const { openid, session_key } = wxResponse.data

    if (!openid) {
      return res.status(400).json({ error: '获取 openid 失败', data: wxResponse.data })
    }

    // 查找或创建用户
    let user = await User.findOne({ openid })

    if (!user) {
      // 创建新用户
      user = new User({
        openid,
        nickname: nickname || '微信用户',
        avatar: avatar || '',
        role: 'member'
      })
      await user.save()
    } else {
      // 更新用户信息
      if (nickname) user.nickname = nickname
      if (avatar) user.avatar = avatar
      await user.save()
    }

    // 生成 JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '30d' }
    )

    res.json({
      success: true,
      data: {
        token,
        user: {
          _id: user._id,
          nickname: user.nickname,
          avatar: user.avatar,
          role: user.role,
          familyId: user.familyId
        }
      }
    })
  } catch (error) {
    console.error('登录失败:', error)
    res.status(500).json({ error: '登录失败', message: error.message })
  }
})

// 测试登录（开发模式，无需微信 code）
router.post('/login-test', async (req, res) => {
  try {
    const { nickname, role } = req.body

    // 创建或更新测试用户
    let user = await User.findOne({ openid: 'test_openid_' + (nickname || 'test') })

    if (!user) {
      user = new User({
        openid: 'test_openid_' + (nickname || 'test'),
        nickname: nickname || '测试用户',
        avatar: '',
        role: role || 'member'
      })
    } else {
      user.nickname = nickname || '测试用户'
      user.role = role || 'member'
    }

    await user.save()

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '30d' }
    )

    res.json({
      success: true,
      data: {
        token,
        user: {
          _id: user._id,
          nickname: user.nickname,
          avatar: user.avatar,
          role: user.role,
          familyId: user.familyId
        }
      }
    })
  } catch (error) {
    console.error('测试登录失败:', error)
    res.status(500).json({ error: '测试登录失败', message: error.message })
  }
})

export default router

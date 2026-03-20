import express from 'express'
import Family from '../models/Family.js'
import User from '../models/User.js'
import { authenticate, requireFamily } from '../middleware/auth.js'

const router = express.Router()

// 生成随机邀请码
function generateInviteCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// 创建家庭
router.post('/create', authenticate, async (req, res) => {
  try {
    const { familyName } = req.body
    const userId = req.user._id

    if (!familyName) {
      return res.status(400).json({ error: '请提供家庭名称' })
    }

    // 检查用户是否已有家庭
    if (req.user.familyId) {
      return res.status(400).json({ error: '您已加入家庭' })
    }

    // 生成唯一邀请码
    let inviteCode
    let codeExists = true
    while (codeExists) {
      inviteCode = generateInviteCode()
      codeExists = await Family.findOne({ inviteCode })
    }

    // 创建家庭
    const family = new Family({
      familyName,
      ownerId: userId,
      inviteCode,
      memberCount: 1
    })

    await family.save()

    // 更新用户信息
    req.user.familyId = family._id
    req.user.role = 'owner'
    await req.user.save()

    res.json({
      success: true,
      data: {
        familyId: family._id,
        familyName: family.familyName,
        inviteCode: family.inviteCode,
        role: 'owner'
      }
    })
  } catch (error) {
    console.error('创建家庭失败:', error)
    res.status(500).json({ error: '创建家庭失败', message: error.message })
  }
})

// 加入家庭
router.post('/join', authenticate, async (req, res) => {
  try {
    const { inviteCode } = req.body

    if (!inviteCode) {
      return res.status(400).json({ error: '请提供邀请码' })
    }

    // 检查用户是否已有家庭
    if (req.user.familyId) {
      return res.status(400).json({ error: '您已加入家庭' })
    }

    // 查找家庭
    const family = await Family.findOne({ inviteCode })

    if (!family) {
      return res.status(404).json({ error: '邀请码无效' })
    }

    // 更新用户信息
    req.user.familyId = family._id
    req.user.role = 'member'
    await req.user.save()

    // 更新家庭成员数
    family.memberCount += 1
    await family.save()

    res.json({
      success: true,
      data: {
        familyId: family._id,
        familyName: family.familyName,
        role: 'member'
      }
    })
  } catch (error) {
    console.error('加入家庭失败:', error)
    res.status(500).json({ error: '加入家庭失败', message: error.message })
  }
})

// 获取家庭成员列表
router.get('/members', authenticate, requireFamily, async (req, res) => {
  try {
    const members = await User.find({ familyId: req.user.familyId })
      .select('nickname avatar role createTime')

    res.json({
      success: true,
      data: members
    })
  } catch (error) {
    console.error('获取成员列表失败:', error)
    res.status(500).json({ error: '获取成员列表失败', message: error.message })
  }
})

// 获取家庭信息
router.get('/info', authenticate, requireFamily, async (req, res) => {
  try {
    const family = await Family.findById(req.user.familyId)

    if (!family) {
      return res.status(404).json({ error: '家庭不存在' })
    }

    res.json({
      success: true,
      data: {
        familyId: family._id,
        familyName: family.familyName,
        inviteCode: family.inviteCode,
        memberCount: family.memberCount
      }
    })
  } catch (error) {
    console.error('获取家庭信息失败:', error)
    res.status(500).json({ error: '获取家庭信息失败', message: error.message })
  }
})

export default router

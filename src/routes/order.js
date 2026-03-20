import express from 'express'
import Order from '../models/Order.js'
import { authenticate, requireFamily } from '../middleware/auth.js'

const router = express.Router()

// 提交订单
router.post('/submit', authenticate, requireFamily, async (req, res) => {
  try {
    const { items } = req.body

    if (!items || items.length === 0) {
      return res.status(400).json({ error: '订单不能为空' })
    }

    // 计算总金额
    const totalAmount = items.reduce((sum, item) => {
      return sum + (item.price || 0) * (item.quantity || 0)
    }, 0)

    const order = new Order({
      familyId: req.user.familyId,
      userId: req.user._id,
      userName: req.user.nickname,
      items,
      totalAmount,
      status: 'pending'
    })

    await order.save()

    res.json({
      success: true,
      data: order
    })
  } catch (error) {
    console.error('提交订单失败:', error)
    res.status(500).json({ error: '提交订单失败', message: error.message })
  }
})

// 获取我的订单
router.get('/my', authenticate, requireFamily, async (req, res) => {
  try {
    const orders = await Order.find({
      familyId: req.user.familyId,
      userId: req.user._id
    }).sort({ createTime: -1 })

    res.json({
      success: true,
      data: orders
    })
  } catch (error) {
    console.error('获取我的订单失败:', error)
    res.status(500).json({ error: '获取我的订单失败', message: error.message })
  }
})

// 获取家庭订单（户主）
router.get('/family', authenticate, requireFamily, async (req, res) => {
  try {
    // 检查是否为户主
    if (req.user.role !== 'owner') {
      return res.status(403).json({ error: '只有户主可以查看家庭订单' })
    }

    const orders = await Order.find({
      familyId: req.user.familyId
    }).sort({ createTime: -1 })

    res.json({
      success: true,
      data: orders
    })
  } catch (error) {
    console.error('获取家庭订单失败:', error)
    res.status(500).json({ error: '获取家庭订单失败', message: error.message })
  }
})

// 确认/取消订单（户主）
router.put('/:id/confirm', authenticate, requireFamily, async (req, res) => {
  try {
    // 检查是否为户主
    if (req.user.role !== 'owner') {
      return res.status(403).json({ error: '只有户主可以确认订单' })
    }

    const { id } = req.params
    const { action } = req.body

    if (!['confirm', 'cancel'].includes(action)) {
      return res.status(400).json({ error: '无效的操作' })
    }

    const order = await Order.findOne({
      _id: id,
      familyId: req.user.familyId
    })

    if (!order) {
      return res.status(404).json({ error: '订单不存在' })
    }

    if (action === 'confirm') {
      order.status = 'confirmed'
      order.confirmTime = new Date()
    } else {
      order.status = 'cancelled'
    }

    await order.save()

    res.json({
      success: true,
      data: order
    })
  } catch (error) {
    console.error('确认订单失败:', error)
    res.status(500).json({ error: '确认订单失败', message: error.message })
  }
})

export default router

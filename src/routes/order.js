import express from 'express'
import Order from '../models/Order.js'
import { authenticate, requireFamily } from '../middleware/auth.js'

const router = express.Router()

// 提交订单
router.post('/submit', authenticate, requireFamily, async (req, res) => {
  try {
    const { items } = req.body

    console.log('提交订单请求体:', JSON.stringify(req.body, null, 2))
    console.log('用户信息:', {
      _id: req.user._id,
      nickname: req.user.nickname,
      familyId: req.user.familyId
    })

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: '订单不能为空' })
    }

    // 验证必需字段
    if (!req.user.familyId) {
      return res.status(400).json({ error: '用户未加入家庭' })
    }

    // 转换 ObjectId 为字符串
    const familyId = req.user.familyId.toString()
    const userId = req.user._id.toString()
    const userName = req.user.nickname || '用户'

    console.log('转换后的值:', { familyId, userId, userName })

    // 验证订单项并映射字段
    const orderItems = items.map((item, index) => {
      // 支持前端 _id 和后端 dishId 两种格式
      const dishId = item.dishId || item._id

      if (!dishId) {
        throw new Error(`第 ${index + 1} 个菜品缺少 ID`)
      }
      if (!item.dishName) {
        throw new Error(`第 ${index + 1} 个菜品缺少名称`)
      }
      if (item.price === undefined || item.price === null) {
        throw new Error(`第 ${index + 1} 个菜品缺少价格`)
      }
      if (!item.quantity || item.quantity < 1) {
        throw new Error(`第 ${index + 1} 个菜品数量无效`)
      }

      return {
        dishId: String(dishId),
        dishName: item.dishName,
        price: Number(item.price),
        quantity: Number(item.quantity)
      }
    })

    // 计算总金额（使用映射后的 orderItems）
    const totalAmount = orderItems.reduce((sum, item) => {
      return sum + item.price * item.quantity
    }, 0)

    console.log('订单总金额:', totalAmount)
    console.log('订单项数量:', orderItems.length)

    const order = new Order({
      familyId,
      userId,
      userName,
      items: orderItems,
      totalAmount,
      status: 'pending'
    })

    console.log('订单对象创建成功')

    await order.save()

    console.log('订单保存成功, _id:', order._id)

    res.json({
      success: true,
      data: order
    })
  } catch (error) {
    console.error('提交订单失败:', error)
    console.error('错误堆栈:', error.stack)
    res.status(500).json({
      error: '提交订单失败',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
})

// 获取我的订单
router.get('/my', authenticate, requireFamily, async (req, res) => {
  try {
    const familyId = req.user.familyId.toString()
    const userId = req.user._id.toString()

    const orders = await Order.find({
      familyId: familyId,
      userId: userId
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

    const familyId = req.user.familyId.toString()

    const orders = await Order.find({
      familyId: familyId
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

    const familyId = req.user.familyId.toString()

    const order = await Order.findOne({
      _id: id,
      familyId: familyId
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

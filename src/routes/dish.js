import express from 'express'
import Dish from '../models/Dish.js'
import Family from '../models/Family.js'
import { authenticate, requireFamily, requireOwner } from '../middleware/auth.js'

const router = express.Router()

// 初始化菜品数据（开发用）
router.post('/init', authenticate, requireOwner, async (req, res) => {
  try {
    const family = await Family.findById(req.user.familyId)
    if (!family) {
      return res.status(400).json({ error: '未找到家庭信息' })
    }

    // 检查是否已有菜品
    const existingCount = await Dish.countDocuments({ familyId: req.user.familyId })
    if (existingCount > 0) {
      return res.json({
        success: true,
        message: `已有 ${existingCount} 个菜品，无需初始化`
      })
    }

    // 初始菜品数据
    const initialDishes = [
      { dishName: '宫保鸡丁', category: '荤菜', price: 32, description: '经典川菜，酸甜微辣' },
      { dishName: '红烧肉', category: '荤菜', price: 38, description: '肥而不腻，入口即化' },
      { dishName: '麻婆豆腐', category: '荤菜', price: 18, description: '麻辣鲜香，下饭神器' },
      { dishName: '清炒时蔬', category: '素菜', price: 16, description: '清爽解腻' },
      { dishName: '番茄炒蛋', category: '素菜', price: 15, description: '家常经典' },
      { dishName: '蒜蓉西兰花', category: '素菜', price: 18, description: '营养丰富' },
      { dishName: '紫菜蛋花汤', category: '汤类', price: 12, description: '清淡鲜美' },
      { dishName: '冬瓜排骨汤', category: '汤类', price: 22, description: '清淡营养' },
      { dishName: '米饭', category: '主食', price: 2, description: '香软可口' },
      { dishName: '馒头', category: '主食', price: 1, description: '松软香甜' }
    ]

    let successCount = 0
    for (const dish of initialDishes) {
      const newDish = new Dish({
        ...dish,
        familyId: req.user.familyId
      })
      await newDish.save()
      successCount++
    }

    res.json({
      success: true,
      message: `成功初始化 ${successCount} 个菜品`
    })
  } catch (error) {
    console.error('初始化菜品失败:', error)
    res.status(500).json({ error: '初始化失败', message: error.message })
  }
})

// 获取菜品列表
router.get('/list', authenticate, requireFamily, async (req, res) => {
  try {
    const { category, keyword } = req.query
    const query = { familyId: req.user.familyId, isAvailable: true }

    if (category) {
      query.category = category
    }

    if (keyword) {
      query.dishName = { $regex: keyword, $options: 'i' }
    }

    const dishes = await Dish.find(query).sort({ createTime: -1 })

    res.json({
      success: true,
      data: dishes
    })
  } catch (error) {
    console.error('获取菜品列表失败:', error)
    res.status(500).json({ error: '获取菜品列表失败', message: error.message })
  }
})

// 添加菜品（户主）
router.post('/create', authenticate, requireFamily, requireOwner, async (req, res) => {
  try {
    const { dishName, category, price, image, description } = req.body

    if (!dishName || !category || price === undefined) {
      return res.status(400).json({ error: '缺少必填字段' })
    }

    const dish = new Dish({
      familyId: req.user.familyId,
      dishName,
      category,
      price,
      image: image || '',
      description: description || ''
    })

    await dish.save()

    res.json({
      success: true,
      data: dish
    })
  } catch (error) {
    console.error('添加菜品失败:', error)
    res.status(500).json({ error: '添加菜品失败', message: error.message })
  }
})

// 更新菜品（户主）
router.put('/:id', authenticate, requireFamily, requireOwner, async (req, res) => {
  try {
    const { id } = req.params
    const { dishName, category, price, image, description, isAvailable } = req.body

    const dish = await Dish.findOne({ _id: id, familyId: req.user.familyId })

    if (!dish) {
      return res.status(404).json({ error: '菜品不存在' })
    }

    if (dishName) dish.dishName = dishName
    if (category) dish.category = category
    if (price !== undefined) dish.price = price
    if (image !== undefined) dish.image = image
    if (description !== undefined) dish.description = description
    if (isAvailable !== undefined) dish.isAvailable = isAvailable

    await dish.save()

    res.json({
      success: true,
      data: dish
    })
  } catch (error) {
    console.error('更新菜品失败:', error)
    res.status(500).json({ error: '更新菜品失败', message: error.message })
  }
})

// 删除菜品（户主）
router.delete('/:id', authenticate, requireFamily, requireOwner, async (req, res) => {
  try {
    const { id } = req.params

    const dish = await Dish.findOne({ _id: id, familyId: req.user.familyId })

    if (!dish) {
      return res.status(404).json({ error: '菜品不存在' })
    }

    await Dish.deleteOne({ _id: id })

    res.json({
      success: true,
      message: '菜品已删除'
    })
  } catch (error) {
    console.error('删除菜品失败:', error)
    res.status(500).json({ error: '删除菜品失败', message: error.message })
  }
})

export default router

import express from 'express'
import Dish from '../models/Dish.js'
import { authenticate, requireFamily, requireOwner } from '../middleware/auth.js'

const router = express.Router()

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

/**
 * 初始化菜品数据脚本
 * 运行: node init-dishes.js
 */

import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Dish from './src/models/Dish.js'
import Family from './src/models/Family.js'
import User from './src/models/User.js'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/family-ordering'

// 初始菜品数据
const initialDishes = [
  {
    dishName: '宫保鸡丁',
    category: '荤菜',
    price: 32,
    description: '经典川菜，酸甜微辣，花生脆嫩',
    image: '',
    isAvailable: true
  },
  {
    dishName: '红烧肉',
    category: '荤菜',
    price: 38,
    description: '肥而不腻，入口即化',
    image: '',
    isAvailable: true
  },
  {
    dishName: '麻婆豆腐',
    category: '荤菜',
    price: 18,
    description: '麻辣鲜香，下饭神器',
    image: '',
    isAvailable: true
  },
  {
    dishName: '糖醋排骨',
    category: '荤菜',
    price: 42,
    description: '酸甜可口，肉质鲜嫩',
    image: '',
    isAvailable: true
  },
  {
    dishName: '清炒时蔬',
    category: '素菜',
    price: 16,
    description: '清爽解腻',
    image: '',
    isAvailable: true
  },
  {
    dishName: '番茄炒蛋',
    category: '素菜',
    price: 15,
    description: '家常经典',
    image: '',
    isAvailable: true
  },
  {
    dishName: '蒜蓉西兰花',
    category: '素菜',
    price: 18,
    description: '营养丰富',
    image: '',
    isAvailable: true
  },
  {
    dishName: '紫菜蛋花汤',
    category: '汤类',
    price: 12,
    description: '清淡鲜美',
    image: '',
    isAvailable: true
  },
  {
    dishName: '冬瓜排骨汤',
    category: '汤类',
    price: 22,
    description: '清淡营养',
    image: '',
    isAvailable: true
  },
  {
    dishName: '米饭',
    category: '主食',
    price: 2,
    description: '香软可口',
    image: '',
    isAvailable: true
  }
]

async function initDishes() {
  try {
    console.log('连接数据库...')
    await mongoose.connect(MONGODB_URI)
    console.log('✅ 数据库连接成功')

    // 获取第一个家庭（用于关联菜品）
    const family = await Family.findOne()
    if (!family) {
      console.log('❌ 没有找到家庭，请先创建家庭')
      process.exit(1)
    }

    console.log(`找到家庭: ${family.familyName} (${family._id})`)

    // 检查是否已有菜品
    const existingCount = await Dish.countDocuments({ familyId: family._id })
    if (existingCount > 0) {
      console.log(`已有 ${existingCount} 个菜品，跳过初始化`)
      process.exit(0)
    }

    // 添加菜品
    console.log('开始添加菜品...')
    let successCount = 0

    for (const dish of initialDishes) {
      try {
        const newDish = new Dish({
          ...dish,
          familyId: family._id
        })
        await newDish.save()
        successCount++
        console.log(`✅ ${dish.dishName}`)
      } catch (error) {
        console.error(`❌ ${dish.dishName}: ${error.message}`)
      }
    }

    console.log(`\n成功添加 ${successCount}/${initialDishes.length} 个菜品`)
    console.log('\n初始化完成！')

  } catch (error) {
    console.error('初始化失败:', error)
    process.exit(1)
  } finally {
    await mongoose.connection.close()
    console.log('数据库连接已关闭')
  }
}

initDishes()

import mongoose from 'mongoose'

const dishSchema = new mongoose.Schema({
  familyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Family',
    required: true,
    index: true
  },
  dishName: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['荤菜', '素菜', '汤类', '主食', '饮料']
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  image: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  createTime: {
    type: Date,
    default: Date.now
  },
  updateTime: {
    type: Date,
    default: Date.now
  }
})

// 更新时间中间件
dishSchema.pre('save', function(next) {
  this.updateTime = new Date()
  next()
})

export default mongoose.model('Dish', dishSchema)

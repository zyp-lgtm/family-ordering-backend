import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  openid: {
    type: String,
    required: true,
    unique: true
  },
  nickname: {
    type: String,
    default: '用户'
  },
  avatar: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['owner', 'member'],
    default: 'member'
  },
  familyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Family',
    default: null
  },
  createTime: {
    type: Date,
    default: Date.now
  }
})

export default mongoose.model('User', userSchema)

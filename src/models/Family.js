import mongoose from 'mongoose'

const familySchema = new mongoose.Schema({
  familyName: {
    type: String,
    required: true
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  inviteCode: {
    type: String,
    unique: true,
    required: true
  },
  memberCount: {
    type: Number,
    default: 1
  },
  createTime: {
    type: Date,
    default: Date.now
  }
})

export default mongoose.model('Family', familySchema)

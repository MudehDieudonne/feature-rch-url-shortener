import mongoose from 'mongoose'

const ClickLogSchema = new mongoose.Schema({
  // Reference to the URL document that was clicked
  url: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Url',
    required: true,
  },
  // Timestamp of when the click occurred
  clickedAt: {
    type: Date,
    default: Date.now,
  },
})

const ClickLog = mongoose.model('ClickLog', ClickLogSchema)

export default ClickLog
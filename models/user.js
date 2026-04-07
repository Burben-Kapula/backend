import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  username: { type: String, required: true, minlength: 3, unique: true },
  favoriteGenre: { type: String, required: true },
  // Додаємо масив посилань на Person
  friends: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Person'
    }
  ]
})

export default mongoose.model('User', schema)
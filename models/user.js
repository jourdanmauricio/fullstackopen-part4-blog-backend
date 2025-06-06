const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  // TODO:
  // nombre de usuario es lo suficientemente largo,
  // que el nombre de usuario solo consta de caracteres permitidos
  // que la contraseña es lo suficientemente segura
  username: {
    type: String,
    minLength: 3,
    required: true,
    unique: true
  },
  name: {
    type: String,
    minLength: 3,
    required: true,
  },
  password: String,
  blogs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blog'
    }
  ],
})

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    // el password no debe mostrarse
    delete returnedObject.password
  }
})

const User = mongoose.model('User', userSchema)

module.exports = User
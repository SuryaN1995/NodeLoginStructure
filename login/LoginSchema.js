var {
    mongoose
} = require('./mongoose')


let LoginSchema = new mongoose.Schema({
    user: { type: String, required: true, unique: true },
    pass: { type: String, required: true }
})

let LoginDB = mongoose.model('LoginDB', LoginSchema)

module.exports = { LoginDB }
const mongoose = require("mongoose")
const userschema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role_id: { type: Number, default: 3 },
    isVerified: { type: Boolean, default: false },
    isDeleted: { type: Date, default: null },
    token: { type: String }
}, {
    timestamps: true
})
userschema.index({ name: 'text' });
const User = mongoose.model("User", userschema)
module.exports = User


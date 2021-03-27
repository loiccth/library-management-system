const mongoose = require('mongoose')

const Schema = mongoose.Schema

const postSchema = new Schema({
    userid: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true }
}, { timestamps: true })

const Post = mongoose.model('Post', postSchema)

module.exports = Post
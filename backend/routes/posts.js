const express = require('express')
const router = express.Router()
const jwt = require('express-jwt')
const secret = process.env.JWT_SECRET
const Post = require('../models/post.model')

router.get('/', jwt({ secret, credentialsRequired: false, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {
    Post.find()
        .populate({ path: 'userid', select: 'userid' })
        .sort({ createdAt: -1 })
        .then(posts => {
            if (posts.length > 0)
                res.json(posts)
            else
                res.status(404).json({ error: 'msgPosts404' })
        })
})

router.post('/', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {
    if (req.user.memberType !== 'Librarian' && req.user.memberType !== 'Admin') return res.sendStatus(403)
    else if (!req.body.title || !req.body.body) return res.status(400).json({ error: 'msgMissingParams' })
    else {
        const newPost = Post({
            userid: req.user._id,
            title: req.body.title,
            body: req.body.body
        })

        newPost.save()
            .then(post => {
                res.json({
                    message: 'msgPostAdd',
                    post
                })
            })
            .catch(err => console.log(err))
    }
})

router.put('/:postid', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {
    if (req.user.memberType !== 'Librarian' && req.user.memberType !== 'Admin') return res.sendStatus(403)
    else if (!req.body.title || !req.body.body) return res.status(400).json({ error: 'msgMissingParams' })
    else {
        Post.findById(req.params.postid)
            .then(post => {
                if (post) {
                    post.title = req.body.title
                    post.body = req.body.body

                    post.save()
                        .then(post => {
                            res.json({
                                message: 'msgPostUpdate',
                                post
                            })
                        })
                        .catch(err => console.log(err))
                }
                else
                    res.status(404).json({ error: 'msgPost404' })
            })
    }
})

router.delete('/:postid', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {
    if (req.user.memberType !== 'Librarian' && req.user.memberType !== 'Admin') return res.sendStatus(403)
    else {
        Post.findByIdAndDelete(req.params.postid)
            .then(post => {
                if (post)
                    res.json({ message: 'msgPostDelete', id: req.params.postid })
                else
                    res.status(404).json({ error: 'msgPost404' })
            })
    }
})

module.exports = router

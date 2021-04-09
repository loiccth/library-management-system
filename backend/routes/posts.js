const express = require('express')
const router = express.Router()
const jwt = require('express-jwt')
const secret = process.env.JWT_SECRET
const Post = require('../models/post.model')

// Get all posts in blog and sort by descending order
router.get('/', jwt({ secret, credentialsRequired: false, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {
    Post.find()
        .populate({ path: 'userid', select: 'userid' })
        .sort({ createdAt: -1 })
        .then(posts => res.json(posts))
})

// Create a new post in blog
router.post('/', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {
    // Check if user is a librarian or an admin
    if (req.user.memberType !== 'Librarian' && req.user.memberType !== 'Admin') return res.sendStatus(403)
    // Check if title and body is sent to the server
    else if (!req.body.title || !req.body.body) return res.status(400).json({ error: 'msgMissingParams' })
    else {
        // Create a new post object
        const newPost = Post({
            userid: req.user._id,
            title: req.body.title,
            body: req.body.body
        })

        // Save to the database and send response to the client
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

// Update a post in the blog
router.put('/:postid', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {
    // Check if user has the access
    if (req.user.memberType !== 'Librarian' && req.user.memberType !== 'Admin') return res.sendStatus(403)
    else if (!req.body.title || !req.body.body) return res.status(400).json({ error: 'msgMissingParams' })
    else {
        // Find the post and update its title and body
        Post.findById(req.params.postid)
            .then(post => {
                if (post) {
                    post.title = req.body.title
                    post.body = req.body.body

                    // Save to database and send response to the client
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
                    // Post id not found
                    res.status(404).json({ error: 'msgPost404' })
            })
    }
})

// Delete a post in the blog
router.delete('/:postid', jwt({ secret, credentialsRequired: true, getToken: (req) => { return req.cookies.jwttoken }, algorithms: ['HS256'] }), (req, res) => {
    if (req.user.memberType !== 'Librarian' && req.user.memberType !== 'Admin') return res.sendStatus(403)
    else {
        // Find a post by id and delete from database
        Post.findByIdAndDelete(req.params.postid)
            .then(post => {
                // Post deleted
                if (post)
                    res.json({ message: 'msgPostDelete', id: req.params.postid })
                else
                    // Post not found
                    res.status(404).json({ error: 'msgPost404' })
            })
    }
})

module.exports = router

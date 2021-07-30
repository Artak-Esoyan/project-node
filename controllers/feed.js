const fs = require('fs');
const path = require('path');
const { validationResult } = require('express-validator');
const Post = require('../models/post');
const User = require('../models/user');


exports.getPosts = async (req, res, next) => {
    // console.log(222222222222, req.params.id);
    const currentPage = 1;
    const perPage = 4;
    try {
        const totalItems = await Post.find().countDocuments();
        const posts = await Post.find()
            .skip((currentPage -1) * perPage)
            .limit(perPage);
        res.status(200).json({
            title: 'First Post',
            message: 'This is the pagination',
            posts: posts,
            totalItems: totalItems
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'uneq sxal',
        })
    }
};



exports.createPost = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            message: 'Validation failed, entered is incorrect',
            errors: errors.array()
        });
    }
    if (!req.file) {
        return res.status(422).json({
            message: 'No image provided.',
        })
    }
    const imageUrl = req.file.path;
    const { title, content } = req.body;
    const post = new Post({
        title: title,
        content: content,
        imageUrl: imageUrl,
        creator: req.userId
    });
    try {
        await post.save();
        const user = await User.findById(req.userId);
        user.post.push(post);
        await user.save();
        res.status(201).json({
            message: 'Post created successfully!',
            post: post,
            user: user,
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'uneq sxal',
        })
    }
};

// exports.getPost = async (req, res, next) => {
//     const postId = req.params.postId;
//     const post = await Post.findById(postId);
//     try {
//         if (!post) {
//             const error = new Error('Could not find post.');
//             error.statusCode = 404;
//             throw error;
//         }
//         res.status(200).json({ message: 'Post fetched.', post: post });
//     } catch (err) {
//         if (!err.statusCode) {
//             err.statusCode = 500;
//         }
//         next(err);
//     }
// };



exports.updatePost = async (req, res, next) => {
    const postId = req.body.id;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            message: 'Validation failed, entered is incorrect',
            errors: errors.array()
        });
    }
    const { title, content } = req.body;
    let imageUrl = req.body.imageUrl;
    if (req.file) {
        imageUrl = req.file.path;
    }
    if (!imageUrl) {
            return res.status(422).json({
                message: 'No file picked.',
            })
    }
    try {
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                message: 'Could not find post.',
            });
        }

        if (post.creator.toString() !== req.userId) {
            return res.status(403).json({
                message: 'Not authorized!',
            });
        }
        if (imageUrl !== post.imageUrl) {
            clearImage(post.imageUrl);
        }
        post.title = title;
        post.imageUrl = imageUrl;
        post.content = content;
        const result = await post.save();
        res.status(200).json({
            message: 'Post updated!',
            post: result });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'uneq sxal',
        })
    }
};

exports.deletePost = async (req, res, next) => {
    const postId = req.body.id;
    try {
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                message: 'Could not find post.',
            });
        }
        if (post.creator.toString() !== req.userId) {
            return res.status(403).json({
                message: 'Not authorized!',
            });
        }
        // Check logged in user
        clearImage(post.imageUrl);
        await Post.findOneAndDelete(postId);

        const user = await User.findById(req.userId);
        user.post.pull(postId);
        await user.save();

        res.status(200).json({
            message: 'Deleted post.'
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'uneq sxal',
        })
    }
};

const clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, err => console.log(err));
};

const fs = require('fs');
const path = require('path');
const { validationResult } = require('express-validator');
const Post = require('../models/post');
const User = require('../models/user');

exports.getPosts = (req, res, next) => {
        // console.log(222222222222, req.params.id);
        const currentPage = 1;
        const perPage = 4;
        let totalItems;
            Post.find()
                .countDocuments()
                .then(count => {
                    totalItems = count;
                    return Post.find()
                        .skip((currentPage -1) * perPage)
                        .limit(perPage);
                })
                .then(posts => {
                    res.status(200).json({posts:
                            [
                                {
                                    title: 'First Post',
                                    message: 'This is the pagination',
                                    posts: posts
                                }
                            ]
                    });
                })
                .catch(err => {
                    if(!err) {
                        return '500';
                    }
                    next(err);
                });

};


exports.createPost = (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(422).json({
            message: 'Validation failed, entered is incorrect',
            errors: errors.array()
        });
    }
    if(!req.file){
        return res.status(422).json({
            message: 'No image provided.',
        })
    }
    const imageUrl = req.file.path;
    const title = req.body.title;
    const content = req.body.content;
    let creator;
    const post = new Post({
        title:title,
        content:content,
        imageUrl: imageUrl,
        creator: req.userId,
    });
    post.save()
        .then(result => {
            return User.findById(req.userId);
        })
        .then(user => {
            // console.log(result);
            creator = user;
            user.post.push(post);
            return user.save();

        })
        .then(result => {
            res.status(201).json({
                message: 'Post created successfully!',
                post: post,
                creator: { _id: creator._id, name: creator.name }
            });
        })
        .catch(err => {
            console.log(err)
            next(err);
        });
};

exports.updatePost = (req, res, next) => {
    const postId = req.body.id;
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(422).json({
            message: 'Validation failed, entered is incorrect',
            errors: errors.array()
        });
    }
    const title = req.body.title;
    const content = req.body.content;
    let imageUrl = req.body.imageUrl;
    if(req.file) {
        imageUrl = req.file.path;
    }
    if(!imageUrl){
        return res.status(422).json({
            message: 'No file picked.',
        })
    }
    Post.findById(postId)
        .then(post => {
            if(!post){
                // return res.status(404).json({
                //     messag ne: 'Could not find post.',
                // })
                console.log(404, 'Could not find post');
            }
            if(post.creator.toString() !== req.userId){
                return res.status(403).JSON.stringify({
                    message: 'Not authorized!',
                })
            }
            if(imageUrl !== post.imageUrl) {
                clearImage(post.imageUrl);
            }
            post.title = title;
            post.imageUrl = imageUrl;
            post.content = content;
            return post.save();
        })
        .then(result => {
            res.status(200).json({
               message: 'Post updated!',
               post: result
            });
        })
        .catch(err => {
            if(!err){
                return '500 mmmm'
            }
            next(err);
        });
};


exports.deletePost = (req, res, next) => {
    const postId = req.body.id;
    Post.findById(postId)
        .then(post => {
            if (!post) {
                return res.status(404).json({
                    message: 'Could not find post.',
                })
            }
            if(post.creator.toString() !== req.userId){
                return res.status(403).JSON.stringify({
                    message: 'Not authorized!',
                })
            }
            clearImage(post.imageUrl);
            return Post.findByIdAndDelete(postId);
        })
        .then(result => {
            return User.findById(req.userId);
        })
        .then(user => {
            user.post.pull(postId);
            return user.save();
        })
        .then(result => {
            // console.log(result);
            res.status(200).json({
                message: 'Deleted post!'
            });
        })
        .catch(err => {
            if(!err) {
                return '500 mmmm';
            }
            next(err);
        })
}


const clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, err => console.log('eee'));
};


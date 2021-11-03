const express = require('express');
const { body } = require('express-validator');
const feedController = require('../controllers/feed');
const {check} = require('../middleware/auth');

const router = express.Router();

// router.get('/ee', (req, res) => {
//     res.json({
//         status: true,
//         message: 'okkkkk'
//     })
//     console.log('ttttttttttttttttttttttt');
// })

// GET /feed/posts
router.get('/posts', check, feedController.getPosts);


// POST /feed/post
router.post('/post', [
    body('title')
        .trim()
        .isLength({min: 5 }),
    body('content')
        .trim()
        .isLength({min: 5 })
], check, feedController.createPost);


// update post
router.post('/update/:postId', [
    body('title')
        .trim()
        .isLength({min: 5 }),
    body('content')
        .trim()
        .isLength({min: 5 })
], check, feedController.updatePost, );


router.post('/delete/:postId', check, feedController.deletePost);


module.exports = router;

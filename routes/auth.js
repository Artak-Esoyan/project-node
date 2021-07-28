const express = require('express');
const { body } = require('express-validator');
const User = require('../models/user');
const authController = require('../controllers/auth');
const router = express.Router();
const {check} = require('../middleware/auth')


router.post('/signup', [
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email.')
        .custom((value, { req }) => {
            return User.findOne({email: value})
                .then(userDoc => {
                    if(userDoc) {
                        return Promise.reject('E-Mail address already exists!');
                    }
                });
        })
        .normalizeEmail(),
        body('password')
            .trim()
            .isLength({min: 5 }),
        body('name')
            .trim()
            .not()
            .isEmpty()
],  authController.signup);


router.post('/login', authController.login);

router.get('/status', check, authController.getUserStatus);

router.post('/status', check, [
    body('status')
        .trim()
        .not()
        .isEmpty()
], authController.updateUserStatus);

module.exports = router;

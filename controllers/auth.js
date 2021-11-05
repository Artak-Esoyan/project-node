//validation
const { validationResult} = require('express-validator')
// hashavorel
const bcrypt = require('bcryptjs')
//token
const jwt = require('jsonwebtoken')
const User = require('../models/user')


exports.signup = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    const {email, name, password} = req.body;
    try {
        const hashedPw = await bcrypt.hash(password, 12);

        const user = new User({
            email: email,
            password: hashedPw,
            name: name
        });
        const result = await user.save();
        res.status(201).json({
            message: 'User created!',
            userId: result._id
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'uneq sxal',
        })
    }
};

exports.login = async (req, res, next) => {
    const {email, password} = req.body
    let loadedUser;
    try {
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(401).json({
                message: 'A user with this email could not be found.',
            });
        }
        loadedUser = user;
        const isEqual = await bcrypt.compare(password, user.password);
        if (!isEqual) {
            return res.status(401).json({
                message: 'Wrong password!',
            });
        }
        const token = jwt.sign(
            {
                email: loadedUser.email,
                userId: loadedUser._id.toString()
            },
            'somesupersecretsecret',
            { expiresIn: '1h' }
        );
        res.status(200).json({
            token: token,
            userId: loadedUser._id.toString()
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'uneq sxal',
        })
    }
};

exports.getUserStatus = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({
                message: 'User not found',
            });
        }
        res.status(200).json({
            status: user,
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'uneq sxal',
        })
    }
};

exports.updateUserStatus = async (req, res, next) => {
    const newStatus = req.body.status;
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({
                message: 'User not found',
            });
        }
        user.status = newStatus;
        await user.save();
        res.status(200).json({
            message: 'User updated.'
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'uneq sxal',
        })
    }
};

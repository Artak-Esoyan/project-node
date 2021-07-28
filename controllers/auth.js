//validation
const { validationResult} = require('express-validator');
// hashavorel
const bcrypt = require('bcryptjs');
//token
const jwt = require('jsonwebtoken');
const User = require('../models/user');

exports.signup = (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(422).json({
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;
    bcrypt.hash(password, 12)
        .then(hashedPw => {
            const user = new User({
                email: email,
                password: hashedPw,
                name: name
            });
            return user.save();
        })
        .then(result => {
            res.status(201).json({
                message: 'User created!',
                userId: result._id
            });
        })
        .catch(err => {
            if(!err){
                console.log('eeeeeeerrrrrrrr', err);
            }
            next(err);
        });
};

exports.login = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    let loadedUser;
    User.findOne({email: email})
        .then(user => {
            if(!user) {
                return res.status(401).json({
                    message: 'A user with this email could not be found.',
                    errors: user.array()
                });
            }
            loadedUser = user;
            return bcrypt.compare(password, user.password);
        })
        .then(isEqual => {
            if(!isEqual){
                return res.status(401).json({
                    message: 'Wrong password!',
                    errors: isEqual.array()
                });
            }
            const token = jwt.sign({
                email: loadedUser.email,
                userId: loadedUser._id.toString()
            }, 'somesupersecretsecret',
                { expiresIn: '1h' }
                );
            res.status(200).json({
                token: token,
                userId: loadedUser._id.toString()

            });
        })
        .catch(err => {
            if(!err) {
                console.log('error email',err)
            }
        })
}

exports.getUserStatus = (req, res, next) => {
    User.findById(req.userId)
        .then(user => {
            if(!user) {
                return res.status(404).json({
                    message: 'User not found',
                    errors: user.array()
                });
            }
            res.status(200).json({
                status: user.status,

            })
        })
        .catch(err => {
            if(!err) {
               console.log('get',err)
            }
            next(err);
        });
}


exports.updateUserStatus = (req, res, next) => {
    const newStatus = req.body.status;
    User.findById(req.userId)
        .then(user => {
            if(!user) {
                return res.status(404).json({
                    message: 'User not found',
                    errors: user.array()
                });
            }
            user.status = newStatus;
            return user.save();
        })
        .then(result => {
            res.status(200).json({
               message: 'User status updated.'
            });
        })
        .catch(err => {
            if(!err) {
                console.log('up st..',err)
            }
            next(err);
        });
};

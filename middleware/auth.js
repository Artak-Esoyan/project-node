//
// function checkAuth(req, res, next){
//
//     console.log('aaaaaaaaaaaaaaaa');
//     next();
// }
//
// module.exports = {checkAuth}

const jwt = require('jsonwebtoken');

function check(req, res, next) {
    const authHeader = req.get('Authorization');
    if(!authHeader) {
        return res.status(401).json({
            message: 'Not authenticated',
        });
    }
    const token = authHeader.split(' ')[1];
    let decodedToken;
    try{
        decodedToken = jwt.verify(token, 'somesupersecretsecret');
    } catch (err) {
        err.statusCode = 500;
        throw err;
    }
    if(!decodedToken) {
        return res.status(401).json({
            message: 'Not authenticated',
        });
    }
    req.userId = decodedToken.userId;
    next();
}

module.exports = {check};


// module.exports = (req, res, next) => {
//     const authHeader = req.get('Authorization');
//     if(!authHeader) {
//         return res.status(401).json({
//             message: 'Not authenticated',
//         });
//     }
//     const token = authHeader.split(' ')[1];
//     let decodedToken;
//     try{
//         decodedToken = jwt.verify(token, 'somesupersecretsecret');
//     } catch (err) {
//         err.statusCode = 500;
//         throw err;
//     }
//     if(!decodedToken) {
//         return res.status(401).json({
//             message: 'Not authenticated',
//         });
//     }
//     req.userId = decodedToken.userId;
//     next();
// }




















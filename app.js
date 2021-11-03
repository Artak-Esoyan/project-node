const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');

const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');





// const fs = require('fs');
//
// function someAsyncOperation(callback) {
//     // Assume this takes 95ms to complete
//     fs.readFile('/path/to/file', callback);
// }
//
// const timeoutScheduled = Date.now();
//
// setTimeout(() => {
//     const delay = Date.now() - timeoutScheduled;
//     console.log(`${delay} ms have passed since I was scheduled`);
// }, 100);
//
// // do someAsyncOperation which takes 95 ms to complete
// someAsyncOperation(() => {
//     const startCallback = Date.now();
//     // do something that will take 10ms...
//     while (Date.now() - startCallback < 10) {
//         // do nothing
//     }
// });


// timeout_vs_immediate.js
setTimeout(() => {
    console.log('timeout');
}, 0);

setImmediate(() => {
    console.log('immediate');
});




const app = express();
const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString() + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg'
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json
app.use(
    multer({ storage: fileStorage, fileFilter: fileFilter }).single('imageUrl')
);
app.use('/images', express.static(path.join(__dirname, 'images')));

// // cors error-i depqum ogt enq hetevyaly...
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Methods',
        'OPTIONS, GET, POST, PUT, PATCH, DELETE'
    );
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);


mongoose
    .connect(
        'mongodb+srv://Artak:csWRb9IZklirXWRh@cluster0.brijr.mongodb.net/test?retryWrites=true&w=majority', {useNewUrlParser: true,  useUnifiedTopology: true}
    )
    .then(result => {
        app.listen(3001);
    })
    .catch(err => console.log(err));

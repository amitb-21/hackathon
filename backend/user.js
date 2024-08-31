// server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/user', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Create User schema and model
const userSchema = new mongoose.Schema({
    emailId: String,
    username: String,
    password: String,
    collegeName: String,
    contactNo: String,
    idCardImage: String // Storing the filename or path of the uploaded image
});

const User = mongoose.model('User', userSchema);

// Create a POST route to save user data
app.post('/api/users', upload.single('idCardImage'), async (req, res) => {
    try {
        const user = new User({
            emailId: req.body.emailId,
            username: req.body.username,
            password: req.body.password,
            collegeName: req.body.collegeName,
            contactNo: req.body.contactNo,
            idCardImage: req.file ? req.file.filename : null
        });
        await user.save();
        res.status(201).send(user);
    } catch (error) {
        res.status(400).send(error);
    }
});

app.listen(5000, () => {
    console.log('Server is running on port 5000');
});

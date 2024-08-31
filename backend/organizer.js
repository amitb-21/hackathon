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
        cb(null, 'uploads/'); // Directory to save uploaded files
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    }
});

const upload = multer({ storage: storage });

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/organizer', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Create Organizer schema and model
const organizerSchema = new mongoose.Schema({
    emailId: String,
    username: String,
    password: String,
    collegeName: String,
    contactNo: String,
    city: String,
    state: String,
    festName: String,
    permissionLetterImage: String, // Store the path or filename
    maxPeople: Number,
    noOfDays: Number,
    pricePerDay: Number,
    dateOfFest: Date
});

const Organizer = mongoose.model('Organizer', organizerSchema);

// Create a POST route to save organizer data with file upload
app.post('/api/organizers', upload.single('permissionLetterImage'), async (req, res) => {
    try {
        const organizer = new Organizer({
            emailId: req.body.emailId,
            username: req.body.username,
            password: req.body.password,
            collegeName: req.body.collegeName,
            contactNo: req.body.contactNo,
            city: req.body.city,
            state: req.body.state,
            festName: req.body.festName,
            permissionLetterImage: req.file ? req.file.filename : null, // Save the filename
            maxPeople: req.body.maxPeople,
            noOfDays: req.body.noOfDays,
            pricePerDay: req.body.pricePerDay,
            dateOfFest: req.body.dateOfFest
        });
        await organizer.save();
        res.status(201).send(organizer);
    } catch (error) {
        res.status(400).send(error);
    }
});

app.listen(5000, () => {
    console.log('Server is running on port 5000');
});

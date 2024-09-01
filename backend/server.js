const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const app = express();
const port = 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/yourdbname', { useNewUrlParser: true, useUnifiedTopology: true });

// Event Schema
const EventSchema = new mongoose.Schema({
  name: String,
  date: String,
  status: String,
  description: String,
});

const Event = mongoose.model('Event', EventSchema);

app.get('/api/events', async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (error) {
    res.status(500).send(error.toString());
  }
});

// User Schema
const UserSchema = new mongoose.Schema({
  emailId: String,
  username: String,
  password: String,
  collegeName: String,
  contactNo: String,
  idCardImage: String, // Storing the filename or path of the uploaded image
});

const User = mongoose.model('User', UserSchema);

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// For Login
app.post('/api/login', async (req, res) => {
  const { emailId, password } = req.body;
  const user = await User.findOne({ emailId, password });
  if (user) {
    res.status(200).send(user);
  } else {
    res.status(401).send('Invalid credentials');
  }
});

// For Signup
app.post('/api/signup', upload.single('idCardImage'), async (req, res) => {
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
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

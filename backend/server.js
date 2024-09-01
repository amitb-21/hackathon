const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
const port = 5000;

// Middleware
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/Backend', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Define schemas and models
const EventSchema = new mongoose.Schema({
    name: String,
    date: String,
    status: String,
    description: String,
});

const FestSchema = new mongoose.Schema({
    name: String,
    city: String,
    state: String,
    noOfMaxPeople: Number,
    pricePerDay: Number,
    dateOfFest: String,
    theme: String,
});

const Event = mongoose.model('Event', EventSchema);
const Fest = mongoose.model('Fest', FestSchema);

// Routes for events
app.get('/api/events', async (req, res) => {
    try {
        const events = await Event.find();
        res.json(events);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// Routes for fests
app.get('/api/fests', async (req, res) => {
    try {
        const name = req.query.name;
        if (typeof name !== 'string') {
            return res.status(400).send('Invalid query parameter');
        }
        const fests = await Fest.find({ name: req.query.name });
        res.json(fests);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

app.post('/api/fests', async (req, res) => {
    try {
        const newFest = new Fest({
            name: req.body.name,
            city: req.body.city,
            state: req.body.state,
            noOfMaxPeople: req.body.noOfMaxPeople,
            pricePerDay: req.body.pricePerDay,
            dateOfFest: req.body.dateOfFest,
            theme: req.body.theme
        });
        await newFest.save();
        res.status(201).send(newFest);
    } catch (error) {
        res.status(400).send(error.toString());
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

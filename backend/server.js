// server.js (or your server file)
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = 5000;

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/yourdbname', { useNewUrlParser: true, useUnifiedTopology: true });

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

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

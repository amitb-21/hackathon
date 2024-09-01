// src/EventsPage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios'; // Import axios
import './events.css'; // Import the CSS file for styling

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  
  useEffect(() => {
    // Fetch events data from the backend API using axios
    const fetchEvents = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/events');
        setEvents(response.data);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };
    
    fetchEvents();
  }, []);

  // Separate ongoing and upcoming events
  const ongoingEvents = events.filter(event => event.status === 'Ongoing');
  const upcomingEvents = events.filter(event => event.status === 'Upcoming');

  return (
    <div className="event-page-container">
      <h1>Events:)</h1>
      <div className="event-list">
        <div className="event-container">
          <h2>Ongoing Events</h2>
          {ongoingEvents.map(event => (
            <div key={event.id} className={`event-card ongoing`}>
              <div className="event-date">
                <span className="event-status">{event.status}</span>
                <p>{event.date}</p>
              </div>
              <div className="event-info">
                <h3>{event.name}</h3>
                <p>{event.description}</p>
                <button className="register-button">Register Now</button>
              </div>
            </div>
          ))}
        </div>
        <div className="event-container">
          <h2>Upcoming Events</h2>
          {upcomingEvents.map(event => (
            <div key={event.id} className={`event-card upcoming`}>
              <div className="event-date">
                <span className="event-status">{event.status}</span>
                <p>{event.date}</p>
              </div>
              <div className="event-info">
                <h3>{event.name}</h3>
                <p>{event.description}</p>
                <button className="register-button">Register Now</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventsPage;



// src/EventsPage.jsx
import React from 'react';
import './events.css'; // Import the CSS file for styling

const EventsPage = () => {
  // Example events data
  const events = [
    {
      id: 1,
      name: 'Hackathon 2024',
      date: 'September 1 - 10, 2024',
      status: 'Ongoing',
      description: 'Join our hackathon to showcase your skills and collaborate with other developers. Open for all levels.',
    },
    {
      id: 2,
      name: 'AI & Machine Learning Workshop',
      date: 'October 5 - 7, 2024',
      status: 'Upcoming',
      description: 'Learn about the latest in AI and Machine Learning from industry experts. Suitable for beginners and advanced learners.',
    },
    // Add more events as needed
  ];

  return (
    <div className="event-page-container">
      <h1>Events:)</h1>
      <div className="event-list">
        {events.map(event => (
          <div key={event.id} className={`event-card ${event.status.toLowerCase()}`}>
            <div className="event-date">
              <span className="event-status">{event.status}</span>
              <p>{event.date}</p>
            </div>
            <div className="event-info">
              <h2>{event.name}</h2>
              <p>{event.description}</p>
              <button className="register-button">Register Now</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventsPage;

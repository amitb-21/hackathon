import React, { useEffect, useState } from 'react';
import axios from 'axios'; // Import axios
import './events.css'; // Import the CSS file for styling
import { Link } from 'react-router-dom';

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

    // Uncomment the following line to fetch real data from your backend
    // fetchEvents();

    // Sample data for demonstration
    const sampleEvents = [
      {
        id: 1,
        name: 'Tech Conference 2024',
        date: '2024-09-15',
        description: 'An exciting tech conference featuring industry leaders and innovative tech startups.',
        status: 'Ongoing',
      },
      {
        id: 2,
        name: 'Cultural Fest',
        date: '2024-09-20',
        description: 'A vibrant cultural fest celebrating art, music, and dance from around the world.',
        status: 'Upcoming',
      },
      {
        id: 3,
        name: 'Science Symposium',
        date: '2024-10-05',
        description: 'A symposium focused on the latest advancements in scientific research and technology.',
        status: 'Ongoing',
      },
      {
        id: 4,
        name: 'Sports Tournament',
        date: '2024-10-15',
        description: 'A competitive sports tournament featuring various sports and teams from different colleges.',
        status: 'Upcoming',
      },
    ];

    // Set the sample events
    setEvents(sampleEvents);

  }, []);

  // Separate ongoing and upcoming events
  const ongoingEvents = events.filter(event => event.status === 'Ongoing');
  const upcomingEvents = events.filter(event => event.status === 'Upcoming');

  return (
    <div className="event-page-container">
      <header className="event-header">
        <h1>Events</h1>
        <p><Link to="/">Home</Link> / Events</p>
      </header>
      <section className="event-list">
        <div className="event-container">
          <h2>Ongoing Events</h2>
          {ongoingEvents.map(event => (
            <div key={event.id} className="event-card ongoing">
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
            <div key={event.id} className="event-card upcoming">
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
      </section>
    </div>
  );
};

export default EventsPage;

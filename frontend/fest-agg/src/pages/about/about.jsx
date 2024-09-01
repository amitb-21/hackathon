import "./about.css";
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="about-page">
      <header className="about-header">
        <h1>About</h1>
        <p><Link to="/">Home</Link> / About</p>
      </header>  
      <section className="about-content">
        <div className="about-image">
          <img src="collage.jpg" alt="Collage of events" />
        </div>
        <div className="about-text">
          <div className="about-text-heading">
            <h1>Welcome to Festiverse - your premier platform for discovering and participating in top college events nationwide.</h1>
          </div>
          <div className="about-text-body">
            <p>Festiverse is dedicated to connecting students with a diverse array of events, from academic conferences to cultural festivals. Our mission is to enhance campus life by providing a centralized hub for event discovery and registration.</p>
            <h2>Why Choose Festiverse?</h2>
            <ul className="about-features">
              <li><strong>Comprehensive Event Listings:</strong> Access a wide range of events from colleges across the country.</li>
              <li><strong>Streamlined Registration:</strong> Easily register for events with just a few clicks.</li>
              <li><strong>Student Engagement:</strong> Join a community that values connection and shared experiences.</li>
              <li><strong>Customizable Notifications:</strong> Receive updates on events that match your interests.</li>
              <li><strong>Event Promotion:</strong> Organizers can reach a broader audience and maximize participation.</li>
              <li><strong>User-Friendly Interface:</strong> Navigate with ease, ensuring a seamless experience from start to finish.</li>
            </ul>
          </div>
        </div>
      </section>
      <section className="photo-gallery">
        <h3>Photo Gallery</h3>
        <h1>Explore Our Recent Photo Gallery</h1>
        <div className="gallery-photos">
          <img src="photo1.jpg" alt="Event 1" />
          <img src="photo2.jpg" alt="Event 2" />
          <img src="photo3.jpg" alt="Event 3" />
          <img src="photo4.jpg" alt="Event 4" />
        </div>
      </section>
    </div>
  );
}

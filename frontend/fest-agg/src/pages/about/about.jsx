import "./about.css";

export default function About() {
  return (
    <div className="main">
      <div className="header">
        <h1>About</h1>
        <p><a className="header-tag" href="">Home</a> / About</p>
      </div>
      <div className="content">
        <div className="content-photo">
          <img src="collage.jpg" alt="content photo" />
        </div>
        <div className="content-text">
          <div className="content-text-head">
            <h1>Welcome to Festiverse - your premier platform for discovering and participating in top college events nationwide.</h1>
          </div>
          <div className="content-text-para">
            <p>Festiverse is dedicated to connecting students with a diverse array of events, from academic conferences to cultural festivals. Our mission is to enhance campus life by providing a centralized hub for event discovery and registration.</p>
            <h2>Why Choose Festiverse?</h2>
            <div className="content-text-lists">
              <ul>
                <li><b>Comprehensive Event Listings:</b> Access a wide range of events from colleges across the country.</li>
                <li><b>Streamlined Registration:</b> Easily register for events with just a few clicks.</li>
                <li><b>Student Engagement:</b> Join a community that values connection and shared experiences.</li>
                <li><b>Customizable Notifications:</b> Receive updates on events that match your interests.</li>
                <li><b>Event Promotion:</b> Organizers can reach a broader audience and maximize participation.</li>
                <li><b>User-Friendly Interface:</b> Navigate with ease, ensuring a seamless experience from start to finish.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="photo-gallery">
        <h3>Photo Gallery</h3>
        <h1>Explore Our Recent Photo Gallery</h1>
        <div className="photos">
          <img src="photo1.jpg" alt="Event 1" />
          <img src="photo2.jpg" alt="Event 2" />
          <img src="photo3.jpg" alt="Event 3" />
          <img src="photo4.jpg" alt="Event 4" />
        </div>
      </div>
    </div>
  );
}


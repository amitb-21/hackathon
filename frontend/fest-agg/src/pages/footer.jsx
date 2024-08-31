import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSquareInstagram ,faSquareXTwitter, faYoutube } from '@fortawesome/free-brands-svg-icons'; // Import the Instagram icon
import './footer.css';

const Footer = () => {
  return (
    <div className="footer">
      <div className="aboutus">
        <a href="#">About us</a>
      </div>
      <div className="contactus">
        <a href="#">Contact us</a>
      </div>
      <div className="followus">
        <a href="#">Follow us</a>
        <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
          <FontAwesomeIcon icon={faSquareInstagram} />
        </a>
        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
          <FontAwesomeIcon icon={faSquareXTwitter} />
        </a>
        <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer">
          <FontAwesomeIcon icon={faYoutube} />
        </a>
      </div>
      <div className="subscribe">
        <p>Subscibe To our Newsletter!</p>
        <form>
          <input type="text" placeholder="Enter your Email-id" />
          <button id="button"type='submit'>Subscribe</button>
        </form>
      </div>
    </div>
  );
};

export default Footer;

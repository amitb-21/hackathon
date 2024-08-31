// src/ContactUs.jsx
import React from 'react';
import './contact.css';

const ContactUs = () => {
  return (
    <div className="contact-us-container">
      <h2>Contact Us</h2>
      <p>If you have any questions or need further information, feel free to reach out to us using the contact details below.</p>

      {/* Contact Details Section */}
      <div className="contact-details">
        <h3>Our Contact Information</h3>
        <p><strong>Phone:</strong> <a href="tel:+91 6578457998">+1 234 567 890</a></p>
        <p><strong>Email:</strong> <a href="mailto:info@festiverse.com">info@yourcompany.com</a></p>
        <p><strong>Address:</strong> 1234 Your Street, Your City, Your Country</p>
        <p><strong>Business Hours:</strong> Monday - Friday: 9:00 AM - 6:00 PM</p>
      </div>

      </div>
  );
};

export default ContactUs;

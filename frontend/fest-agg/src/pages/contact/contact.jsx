import "./contact.css";
import { Link } from 'react-router-dom';

export default function Contact() {
  return (
    <div className="contact-page">
      <header className="contact-header">
        <h1>Contact Us</h1>
        <p><Link to="/">Home</Link> / Contact Us</p>
      </header>  
      <section className="contact-content">
        <div className="contact-form">
          <h2>Get in Touch</h2>
          <form>
            <label>
              Name:
              <input type="text" name="name" required />
            </label>
            <label>
              Email:
              <input type="email" name="email" required />
            </label>
            <label>
              Message:
              <textarea name="message" rows="5" required></textarea>
            </label>
            <button type="submit">Send Message</button>
          </form>
        </div>
        <div className="contact-info">
          <h2>Our Address</h2>
          <p>123 Event Lane, Suite 456<br/>Festiverse City, EC 78901</p>
          <h2>Contact Details</h2>
          <p>Email: <a href="mailto:info@festiverse.com">info@festiverse.com</a></p>
          <p>Phone: (123) 456-7890</p>
        </div>
      </section>
    </div>
  );
}

import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './pages/navbar';
import Footer from './pages/footer';
import Home from './pages/homepage/home';
import About from './pages/about/about';
import ContactUs from './pages/contact/contact';
import EventsPage from './pages/events/eventsPage'; 
import Login from './pages/auth/login'; // Import the Login component
import Signup from './pages/auth/signup'; // Import the Signup component

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/about' element={<About />} />
        <Route path='/events' element={<EventsPage />} />
        <Route path='/contactus' element={<ContactUs />} />
        <Route path='/login' element={<Login />} /> {/* Route for Login */}
        <Route path='/signup' element={<Signup />} /> {/* Route for Signup */}
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;

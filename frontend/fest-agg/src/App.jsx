import React from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './pages/navbar';
import Footer from './pages/footer';
import Home from './pages/homepage/home';
import About from './pages/about/about';
import ContactUs from './pages/contact/contact';
import EventsPage from './pages/events/events';
import Login from './auth/login';
import Signup from './auth/signup';

function Layout({ children }) {
  const location = useLocation();
  const noNavAndFooter = ["/login", "/signup"].includes(location.pathname);

  return (
    <div>
      {!noNavAndFooter && <Navbar />}
      <main>{children}</main>
      {!noNavAndFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path='/'
          element={<Layout><Home /></Layout>}
        />
        <Route
          path='/about'
          element={<Layout><About /></Layout>}
        />
        <Route
          path='/events'
          element={<Layout><EventsPage /></Layout>}
        />
        <Route
          path='/contactus'
          element={<Layout><ContactUs /></Layout>}
        />
        <Route
          path='/login'
          element={<Login />} // No Layout (Navbar and Footer)
        />
        <Route
          path='/signup'
          element={<Signup />} // No Layout (Navbar and Footer)
        />
      </Routes>
    </Router>
  );
}

export default App;

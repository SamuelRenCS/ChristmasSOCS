import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Registration from './pages/Registration';
import './App.css'
import { ToastContainer, toast } from 'react-toastify';
import Dashboard from './pages/Dashboard';
import PrivateRoute from './components/PrivateRoute';
import PrivatePage from './pages/PrivatePage';
import { AuthProvider } from './context/AuthContext';
import CreateMeeting from './pages/CreateMeeting';
import Header from './partials/Header';
import Footer from './partials/Footer';

function App() {
  const [isHeaderHidden, setHeaderHidden] = useState(false);
  const [prevScrollPos, setPrevScrollPos] = useState(0);

  const handleScroll = () => {
    const currentScrollPos = window.scrollY;

    if (currentScrollPos > prevScrollPos) {
      setHeaderHidden(true);
    } else {
      setHeaderHidden(false);
    }

    setPrevScrollPos(currentScrollPos);
  }

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [prevScrollPos]);

  return (
    <AuthProvider>
      <Header hidden={isHeaderHidden} isAuthenticated={false} />
      <div className="main-section">
      <Router>
      <Routes>
        
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Registration />} />

        {/* Private Routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/meetings/new" element={<CreateMeeting />} />
          <Route path="/private" element={<PrivatePage />} />
          {/* <Route path="/meeting/:id" element={<MeetingPage />} /> */}
        </Route>
      </Routes>
      <ToastContainer />
    </Router>
      </div>

      <Footer />
    </AuthProvider>
  )
}

export default App

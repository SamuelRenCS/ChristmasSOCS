import React from 'react';
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

function App() {
  return (
    <AuthProvider>
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
    </AuthProvider>
  )
}

export default App

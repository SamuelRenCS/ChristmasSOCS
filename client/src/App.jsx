// Contributors: Samuel Ren

import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Registration from "./pages/Registration";
import styles from "./App.module.css";
import { ToastContainer, toast } from "react-toastify";
import PrivateRoute from "./components/Routing/PrivateRoute";
import { AuthProvider } from "./context/AuthContext";
import CreateMeeting from "./pages/CreateMeeting";
import Header from "./partials/Header";
import Footer from "./partials/Footer";
import ViewMeeting from "./pages/ViewMeeting";
import CreateRequest from "./pages/CreateRequest";
import CreateBooking from "./pages/CreateBooking";
import ErrorPage from "./pages/ErrorPage";
import Dashboard from "./pages/Dashboard";

function App() {
  const [isHeaderHidden, setHeaderHidden] = useState(false);
  const [isAppearable, setAppearable] = useState(false);
  const [prevScrollPos, setPrevScrollPos] = useState(0);

  const handleScroll = () => {
    const currentScrollPos = window.scrollY;

    if (currentScrollPos > 120) {
      // When scrolled down past 120px
      if (currentScrollPos < prevScrollPos) {
        // Scrolling up
        setAppearable(true);
        setHeaderHidden(false);
      } else if (currentScrollPos > prevScrollPos) {
        // Scrolling down
        setHeaderHidden(true);
      }
    } else if (currentScrollPos === 0) {
      // When back to the top of the page
      setAppearable(false);
      setHeaderHidden(false);
    }

    setPrevScrollPos(currentScrollPos);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [prevScrollPos]);

  return (
    <AuthProvider>
      <Router>
        <Header hidden={isHeaderHidden} isAppearable={isAppearable} />
        <div className={styles["main-section"]}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Registration />} />
            <Route path="/booking/:token" element={<CreateBooking />} />

            {/* Private Routes */}
            <Route element={<PrivateRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/meetings/new" element={<CreateMeeting />} />
              <Route path="/meetings/:meetingId" element={<ViewMeeting />} />
              <Route path="/requests/new/:hostID" element={<CreateRequest />} />
            </Route>

            {/* 404 Route */}
            <Route
              path="*"
              element={<ErrorPage message="404 Page Not Found" />}
            />
          </Routes>
        </div>
        <ToastContainer />
      </Router>

      <Footer />
    </AuthProvider>
  );
}

export default App;

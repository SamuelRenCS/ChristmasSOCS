import React from 'react';

const Navbar = () => (
  <nav className="navbar">
    <div className="logo">
      <img src="" alt="McGill Logo" />
      <span>Campus Connect</span>
    </div>
    <ul className="nav-links">
      <li>Meetings</li>
      <li>Requests</li>
      <li className="active">Dashboard</li>
      <li><button className="logout-btn">Logout</button></li>
    </ul>
  </nav>
);

export default Navbar;
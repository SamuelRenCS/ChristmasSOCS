import React, { useState } from "react";
import styles from "../styles/Dashboard.module.css";
import {
  Home,
  Settings,
  User,
  Archive,
  Calendar,
  Bell,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState("home");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const menuItems = [
    {
      name: "home",
      icon: Home,
      label: "Home",
    },
    {
      name: "meetings",
      icon: Calendar,
      label: "Meetings",
    },
    {
      name: "requests",
      icon: Archive,
      label: "Requests",
    },
    {
      name: "notifications",
      icon: Bell,
      label: "Notifications",
    },
    {
      name: "profile",
      icon: User,
      label: "Profile",
    },
    {
      name: "settings",
      icon: Settings,
      label: "Settings",
    },
  ];

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className={styles.dashboardContainer}>
      {/* Sidebar Navigation */}
      <div
        className={`
          ${styles.sidebar} 
          ${isSidebarCollapsed ? styles.collapsed : ""}
        `}
      >
        {menuItems.map((item) => (
          <button
            key={item.name}
            onClick={() => {
              setActiveSection(item.name);
            }}
            className={`
              ${styles.sidebarItem} 
              ${activeSection === item.name ? styles.active : ""}
            `}
          >
            <item.icon className={styles.icon} />
            <span className={styles.label}>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div
        className={`
          ${styles.mainContent} 
          ${isSidebarCollapsed ? styles.expanded : ""}
        `}
      >
        PAGE CONTENT HERE
      </div>
    </div>
  );
};

export default Dashboard;

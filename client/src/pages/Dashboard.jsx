import React, { useState, useEffect } from "react";
import styles from "../styles/Dashboard.module.css";
import {
  Home,
  History,
  User,
  Archive,
  Calendar,
  Bell,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import ProfilePage from "./DashboardContent/ProfilePage";
import HomePage from "./DashboardContent/HomePage";
import MeetingsPage from "./DashboardContent/MeetingsPage";
import RequestsPage from "./DashboardContent/RequestsPage";
import NotificationsPage from "./DashboardContent/NotificationsPage";
import HistoryPage from "./DashboardContent/HistoryPage";

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState("home");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const menuItems = [
    {
      name: "home",
      icon: Home,
      label: "Home",
      component: HomePage,
    },
    {
      name: "meetings",
      icon: Calendar,
      label: "Meetings",
      component: MeetingsPage,
    },
    {
      name: "history",
      icon: History,
      label: "History",
      component: HistoryPage,
    },
    {
      name: "requests",
      icon: Archive,
      label: "Requests",
      component: RequestsPage,
    },
    {
      name: "notifications",
      icon: Bell,
      label: "Notifications",
      component: NotificationsPage,
    },
    {
      name: "profile",
      icon: User,
      label: "Profile",
      component: ProfilePage,
    },
  ];

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Auto-collapse sidebar on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768 && !isSidebarCollapsed) {
        setIsSidebarCollapsed(true);
      }
    };

    window.addEventListener("resize", handleResize);
    // Initial check
    handleResize();
  }, [window.innerWidth]);

  // Find the component for the active section
  const ActiveComponent =
    menuItems.find((item) => item.name === activeSection)?.component ||
    HomePage;

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

        {/* Sidebar Toggle Button */}
        <button onClick={toggleSidebar} className={styles.sidebarToggle}>
          {isSidebarCollapsed ? <ChevronRight /> : <ChevronLeft />}
        </button>
      </div>

      {/* Main Content Area */}
      <div
        className={`
          ${styles.mainContent} 
          ${isSidebarCollapsed ? styles.expanded : ""}
        `}
      >
        <ActiveComponent />
      </div>
    </div>
  );
};

export default Dashboard;

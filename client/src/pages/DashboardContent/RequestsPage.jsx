import React, { useState } from "react";
import styles from "../../styles/RequestPage.module.css";
import RequestsSubPage from "../../components/RequestsSubPage";
import { CheckCircle, InboxIcon, SendIcon } from "lucide-react";

const RequestsPage = () => {
  const [activeSection, setActiveSection] = useState("Confirmed");

  const menuItems = [
    {
      name: "Confirmed",
      label: "Confirmed",
      icon: <CheckCircle />,
    },
    {
      name: "Incoming",
      label: "Incoming",
      icon: <InboxIcon />,
    },
    {
      name: "Outgoing",
      label: "Outgoing",
      icon: <SendIcon />,
    },
  ];

  return (
    <div className={styles.requestPageContainer}>
      <div className={styles.requestMenu}>
        {menuItems.map((item) => (
          <button
            key={item.name}
            className={activeSection === item.name ? styles.active : ""}
            onClick={() => setActiveSection(item.name)}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>

      <div className={styles.requestContent}>
        <RequestsSubPage requestType={activeSection} />
      </div>
    </div>
  );
};

export default RequestsPage;

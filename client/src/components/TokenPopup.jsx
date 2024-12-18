import { useState } from "react";
import styles from "../styles/CreateMeeting.module.css";
import { Copy, Check } from "lucide-react";

const TokenPopup = ({ tokenPopup, closePopup }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyToken = () => {
    navigator.clipboard.writeText(tokenPopup.token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    tokenPopup.show && (
      <div className={styles["token-popup"]}>
        <div className={styles["popup-content"]}>
          <h3>Meeting Token</h3>
          <p>{tokenPopup.token}</p>
          <button onClick={handleCopyToken}>
            {copied ? (
              <>
                <Check size={16} style={{ marginRight: 8 }} /> Copied
              </>
            ) : (
              <>
                <Copy size={16} style={{ marginRight: 8 }} /> Copy Token
              </>
            )}
          </button>
          <button onClick={closePopup}>Close</button>
        </div>
      </div>
    )
  );
};

export default TokenPopup;

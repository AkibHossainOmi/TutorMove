import React from "react";

const SuccessBanner = ({ message, onClose }) => (
  <div style={{
    background: "#d1e7dd",
    color: "#0f5132",
    padding: "16px 30px",
    borderRadius: "7px",
    margin: "16px auto",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    maxWidth: 600,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    fontSize: "17px",
    fontWeight: 500,
    position: "relative"
  }}>
    <span>✅ {message}</span>
    <button onClick={onClose} style={{
      background: "none",
      border: "none",
      color: "#0f5132",
      fontWeight: "bold",
      fontSize: 20,
      cursor: "pointer",
      marginLeft: 20
    }}>&times;</button>
  </div>
);

export default SuccessBanner;

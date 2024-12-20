// Contributors: Shotaro Nakamura

import React from "react";

const Container = ({
  children,
  width,
  height,
  padding,
  margin,
  display,
  justifyContent,
  alignItems,
  overflow,
  flex,
  maxHeight,
}) => {
  const containerStyle = {
    width: width || "90%", // Default to 90% if no width is provided
    height: height || "auto", // Default to auto if no height is provided
    padding: padding || "0px", // Default
    margin: margin || "0px", // Default margin
    display: display, // Default display
    justifyContent: justifyContent || "space-between", // Default justifyContent
    alignItems: alignItems || "flex-start", // Default alignItems
    overflow: overflow || "hidden", // Default overflowY
    flex: flex || "1", // Default flex
    maxHeight: maxHeight || "auto", // Default to auto if no maxHeight is provided

    borderRadius: "30px",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)", // Default shadow
    maxWidth: "900px", // Default to 900px if no maxWidth is provided
    backgroundColor: "white",
  };

  return (
    <div className="custom-container" style={containerStyle}>
      {children}
    </div>
  );
};

export default Container;

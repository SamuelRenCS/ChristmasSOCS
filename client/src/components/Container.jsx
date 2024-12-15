import React from 'react';

const Container = ({ children, width, height, padding, margin, display, justifyContent, alignItems, overflow}) => {
  const containerStyle = {
    width: width || '90%', // Default to 90% if no width is provided
    height: height || '450px', // Default to auto if no height is provided
    padding: padding || '0px', // Default
    margin: margin || '0px' , // Default margin
    display: display, // Default display
    justifyContent: justifyContent || 'space-between', // Default justifyContent
    alignItems: alignItems || 'flex-start', // Default alignItems
    overflow: overflow || 'hidden', // Default overflowY
    
    borderRadius:'30px', 
    boxShadow: '0 5px 15px #373b30', // Default shadow
    maxWidth:'900px', // Default to 900px if no maxWidth is provided
    backgroundColor: 'white',
  };

  return (
    <div className="custom-container" style={containerStyle}>
      {children}
    </div>
  );
};


export default Container;

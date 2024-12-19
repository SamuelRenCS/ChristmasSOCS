import React from 'react';

const TimeSlot = ({ time, student, isBooked }) => {
  const styleSlot = {
    backgroundColor: isBooked ? '#bef5ff' : '#f4cccc',
    border: 'none',
    padding: '15px 20px',
    borderLeft: isBooked ? '8px solid #007bff' : '8px solid #EF5533',
    justifyContent: 'space-between',
    marginBottom: '8px',
    fontSize: '15px',
    alignItems: 'center',
    display: 'flex',
    
  }
  const styleStudent = {
    textAlign: 'left',
    flexGrow: '1',
  }

  const styleTime = {
    width: '60%',
  }

  return (
    <div className={`slot-${isBooked ? 'booked' : 'available'}`} style={styleSlot}>
      <span style={styleTime}>{time}</span>
      <span style={styleStudent}>{`Student: ${student || 'None'}`}</span>
    </div>
  );
};

export default TimeSlot;
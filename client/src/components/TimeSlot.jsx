import React from 'react';

const TimeSlot = ({ time, student, isBooked }) => {
  const styleSlot = {
    backgroundColor: isBooked ? '#f4cccc' : '#c6f8c3',
    border: 'none',
    padding: '15px 20px',
    borderLeft: isBooked ? '8px solid #EF5533' : '8px solid #1BC47D',
    justifyContent: 'space-between',
    marginBottom: '8px',
    fontSize: '25px',
    alignItems: 'center',
    display: 'flex',
    
  }
  const styleStudent = {
    textAlign: 'left',
    flexGrow: '1',
  }

  const styleTime = {
    width: '70%',
  }

  return (
    <div className={`slot-${isBooked ? 'booked' : 'available'}`} style={styleSlot}>
      <span style={styleTime}>{time}</span>
      <span style={styleStudent}>{`Student: ${student || 'None'}`}</span>
    </div>
  );
};

export default TimeSlot;
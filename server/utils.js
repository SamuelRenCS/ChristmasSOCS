// helper functions called by the server

module.exports.checkIsMcGillMember = (email) => {
  // check if email is @mcgill.ca or @mail.mcgill.ca
  return email.endsWith("@mcgill.ca") || email.endsWith("@mail.mcgill.ca");
};

// Function to calculate the dates between the start and end date
module.exports.calculateDates = (startDate, endDate) => {
  const dates = [];
  
  let current = new Date(startDate);
  const end = new Date(endDate);

  // Create comparison dates without changing the originals and set the time to midnight to compare only the dates
  const startCompare = new Date(startDate);
  startCompare.setUTCHours(0, 0, 0, 0);
  const endCompare = new Date(endDate);
  endCompare.setUTCHours(23, 59, 59, 999);

  //  
  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
};

// Function to calculate the weekly dates based on the repeating days
module.exports.calculateWeeklyDates = (repeatingDays, endDate) => {
  const dates = [];

  // Reset endDate time to ensure the comparison is only date-based
  endDate.setHours(23, 59, 59, 999);

  for (let i = 0; i < repeatingDays.length; i++) {
    let currentDate = new Date(repeatingDays[i]);

    // Reset the time of currentDate to ensure comparison is only date-based
    currentDate.setHours(0, 0, 0, 0);

    // If the initial repeating day is after the end date, skip to next
    if (currentDate > endDate) {
      continue;
    }

    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 7); // Increment by 7 days
    }
  }

  return dates;
};

module.exports.generateSlots = (startTime, endTime, interval) => {
  const slots = [];
  const start = new Date(startTime);
  const end = new Date(endTime);

  // Check if the interval equals the entire duration
  const durationInMinutes = (end - start) / (1000 * 60); // Convert milliseconds to minutes
  if (interval >= durationInMinutes) {
    // If the interval is equal to or greater than the entire duration, only add the start time
    slots.push([
      start.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    ]);
    return slots;
  }

  let current = new Date(start);
  let currentDay = current.toDateString();
  let daySlots = [];

  while (current < end) {
    // Modified condition to exclude the end time
    // Check if we've moved to a new day
    if (current.toDateString() !== currentDay) {
      // Add the previous day's slots to the main array
      if (daySlots.length > 0) {
        slots.push(daySlots);
      }

      // Reset for the new day
      daySlots = [];
      currentDay = current.toDateString();
    }

    // Add current time slot to the day's slots
    daySlots.push(
      current.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    );

    // Increment time
    current.setMinutes(current.getMinutes() + interval);
  }

  // Add the last day's slots if there are any
  if (daySlots.length > 0) {
    slots.push(daySlots);
  }

  return slots;
};

module.exports.formatDateTime = (startTime) => {
  const date = new Date(startTime);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} at ${hours}:${minutes}`;
};

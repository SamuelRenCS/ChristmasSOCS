import axios from "axios";
import sha256 from "crypto-js/sha256";

// create an axios instance with default configuration
const api = axios.create({
  baseURL: "http://fall2024-comp307-group12.cs.mcgill.ca:5000/api", // set backend's base URL
  headers: {
    "Content-Type": "application/json",
  },
});

// login function to send a POST request to /login
export const login = async (credentials) => {
  try {
    // Hash the password before sending it to the server
    const secureCredentials = {
      ...credentials,
      password: sha256(credentials.password).toString(),
    };

    const response = await api.post("/login", secureCredentials);
    return response;
  } catch (error) {
    // this will throw an error that can be caught in the component
    throw error;
  }
};

// register function to send a POST request to /register
export const register = async (formData) => {
  try {
    // Hash the password before sending it to the server
    const secureFormData = {
      ...formData,
      password: sha256(formData.password).toString(),
      confirmPassword: sha256(formData.confirmPassword).toString(),
    };

    const response = await api.post("/register", secureFormData);
    return response.data;
  } catch (error) {
    // this will throw an error that can be caught in the component
    throw error;
  }
};

// createMeeting function to send a POST request to /meetings
export const createMeeting = async (meetingData) => {
  try {
    const response = await api.post("/meetings/new", meetingData);
    return response.data;
  } catch (error) {
    // this will throw an error that can be caught in the component
    throw error;
  }
};

// fetchMeetings function to send a GET request to /meetings with id
//TODO CHECK THIS
export const fetchMeeting = async (token) => {
  try {
    const response = await api.get(`/meetings/${token}`); // Pass `id` as part of the route
    return response.data;
  } catch (error) {
    console.error("Error fetching meeting:", error);
    throw error; // Throw error to handle it in the calling component
  }
};

// fetchMeetingSlots function to send a GET request to /meetings/
// TODO ADD PARAMS
export const fetchMeetingSlot = async (meetingID, date) => {
  try {
    const response = await api.get(`/meetings/${meetingID}/${date}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching meeting details:", error);
    throw error;
  }
};

export const createBooking = async (bookingData) => {
  try {
    const response = await api.post("/bookings/new", bookingData);
    return response.data;
  } catch (error) {
    // this will throw an error that can be caught in the component
    throw error;
  }
};

export const fetchSeats = async (meetingID, date, slot) => {
  console.log("fetching seats for:", meetingID, date, slot);
  try {
    const response = await api.get(`/meetings/${meetingID}/${date}/${slot}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching bookings:", error);
    throw error;
  }
};

// update password function to send a PUT request to /password
export const updatePassword = async (passwordData) => {
  // Hash the password and new password before sending it to the server
  const securePasswordData = {
    ...passwordData,
    currentPassword: sha256(passwordData.currentPassword).toString(),
    newPassword: sha256(passwordData.newPassword).toString(),
  };

  try {
    const response = await api.put("/password", securePasswordData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// fetchUser function to send a GET request to /user
export const fetchUser = async (userID) => {
  try {
    const response = await api.get(`/user/${userID}`);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

// createRequest function to send a POST request to /requests
export const createRequest = async (requestData) => {
  try {
    const response = await api.post("/requests/new", requestData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// fetchRequests function to send a GET request to /requests
export const fetchRequests = async (userID) => {
  try {
    const response = await api.get(`/requests/${userID}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchUserMeetings = async (userID) => {
  try {
    console.log("Fetching meetings for user:", userID);
    const response = await api.get(`/dashboard/meetings/${userID}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchUserBookings = async (userID) => {
  try {
    console.log("Fetching bookings for user:", userID);
    const response = await api.get(`/dashboard/bookings/${userID}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchAllUserEvents = async (userID) => {
  try {
    console.log("Fetching all events for user:", userID);
    const response = await api.get(`/dashboard/events/${userID}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// handle accept request function to send a PUT request to /requests
export const acceptRequest = async (requestID) => {
  try {
    const response = await api.put(`/requests/${requestID}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// handle reject request function to send a DELETE request to /requests
export const rejectRequest = async (requestID) => {
  try {
    const response = await api.delete(`/requests/${requestID}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

//TODO

// Delete meeting function to send a DELETE request to /meetings
export const deleteMeeting = async (meetingID) => {
  try {
    const response = await api.delete(`/meetings/delete/${meetingID}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete booking function to send a DELETE request to /bookings
export const deleteBooking = async (bookingID, userID) => {
  console.log("Deleting booking:", bookingID);
  console.log("User ID:", userID);
  try {
    const response = await api.delete(
      `/bookings/delete/${bookingID}/${userID}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

//create a notification function to send a POST request to /notifications
export const createNotification = async (notificationData) => {
  try {
    const response = await api.post("/notifications/new", notificationData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

//fetch all notifications function to send a GET request to /notifications
export const fetchNotifications = async (userID) => {
  try {
    const response = await api.get(`/notifications/${userID}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
//delete notification function to send a DELETE request to /notifications
export const deleteNotification = async (notificationID) => {
  try {
    const response = await api.delete(
      `/notifications/delete/${notificationID}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

//fetch token function to send a GET request to /token
export const fetchToken = async (meetingID) => {
  try {
    const response = await api.get(`/token/${meetingID}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

//fetch meeting slots for a specific date function to send a GET request to /meetings
export const fetchMeetingAllSlots = async (meetingID, date) => {
  try {
    const response = await api.get(`/allslots/${meetingID}/${date}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default api;

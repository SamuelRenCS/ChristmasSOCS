import axios from "axios";
import sha256 from "crypto-js/sha256";

// create an axios instance with default configuration
const api = axios.create({
  baseURL: "http://localhost:3000/api", // set backend's base URL
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

export default api;

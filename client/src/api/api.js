import axios from "axios";

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
    const response = await api.post("/login", credentials);
    return response;
  } catch (error) {
    // this will throw an error that can be caught in the component
    throw error;
  }
};

// register function to send a POST request to /register
export const register = async (formData) => {
  try {
    const response = await api.post("/register", formData);
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
    console.log(response);
    console.log(response.data);
    return response;
  } catch (error) {
    // this will throw an error that can be caught in the component
    throw error;
  }
};

// fetchMeetings function to send a GET request to /meetings with id
//TODO CHECK THIS
export const fetchMeeting = async (id) => {
  try {
    const response = await api.get(`/api/meetings/${id}`); // Pass `id` as part of the route
    return response.data;
  } catch (error) {
    console.error("Error fetching meeting:", error);
    throw error; // Throw error to handle it in the calling component
  }
};

// fetchMeetingSlots function to send a GET request to /meetings/
// TODO ADD PARAMS
export const fetchMeetingSlots = async (id, date) => {
  try {
    const response = await api.get(`/meetings/${id}/${date}`);
    return response.data;
  } catch (error) {
    // this will throw an error that can be caught in the component
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

export default api;

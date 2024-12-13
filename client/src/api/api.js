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
    return response.data;
  } catch (error) {
    // this will throw an error that can be caught in the component
    throw error;
  }
};

export default api;

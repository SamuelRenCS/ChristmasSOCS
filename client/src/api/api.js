import axios from "axios";

// create an axios instance with default configuration
const api = axios.create({
  baseURL: "http://localhost:3000/api", // set backend's base URL
  headers: {
    "Content-Type": "application/json",
  },
});

// login function to send a POST request to /login
export const login = (data) => {
  api.post("/login", data);
};

// register function to send a POST request to /register
export const register = (data) => {
  api.post("/register", data);
};

export default api;

// used to store configuration values for the client side

const apiBaseUrl = import.meta.env.VITE_BACKEND_BASE_URL;

const config = {
  backendBaseUrl: apiBaseUrl,
};
console.log("Config: ", config);
export default config;

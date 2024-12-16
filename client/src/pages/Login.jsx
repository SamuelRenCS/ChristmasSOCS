import React, { useState } from "react";
import { login } from "../api/api.js"; // import the login function from api.js
import "../styles/Login.css";
import Input from "../components/Input";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login: authLogin } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await login(formData);

      const token = response.data.data.token;

      if (!token) {
        toast.error("Login failed: No authentication token");
        return;
      }

      authLogin(token); // use the login function from AuthContext

      toast.success("Login successful");

      // redirect to dashboard after successful login with some delay
      const origin = location.state?.from?.pathname || "/dashboard";

      setTimeout(() => navigate(origin), 200);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || "Login failed";

      toast.error(errorMessage);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Login</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <Input
            label="Email"
            type="email"
            name="email"
            placeholder="Enter email"
            formType="login"
            onChange={handleChange}
          />
          <Input
            label="Password"
            type="password"
            name="password"
            placeholder="Enter password"
            formType="login"
            onChange={handleChange}
          />
          <Button type="submit" text="Login" />
        </form>
      </div>
      {/* <div className="image-box">
                      <img src={mcgillImage} alt="McGill Campus" />
                    </div> */}
    </div>
  );
}

export default Login;

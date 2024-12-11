import React, { useState } from 'react';
import { register } from '../api/api.js';
import "../styles/Login.css";
//import mcgillImage from './images/mcgill.jpg';
import Input from '../components/Input';
import Button from '../components/Button';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

function Registration() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // basic client-side validation
        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        console.log('Form submitted:', formData);

        try {
            const response = await register(formData);

            // Registration successful show toast notification
            toast.success("Registration successful!");

            // redirect to login page after a short delay
            setTimeout(() => {
                navigate('/login');
            }, 200);
            

        } catch (error) {
            // show toast notification for error
            toast.error(error.response?.data?.message || 'Registration failed');
        }
    }

   return (
    <main className="main">
        <div className="login-container">
            <div className="login-box">
                <h2 style={{margin:'0px', padding:'0px'}}>Create an Account</h2>
                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-row" style={{display: 'flex', gap: '10px'}}>
                        <Input 
                            label="First Name"
                            type="text"
                            name="firstName"
                            placeholder="Enter first name"
                            formType="register"
                            onChange={handleChange}
                        />
                        <Input
                            label="Last Name"
                            type="text"
                            name="lastName"
                            placeholder="Enter last name"
                            formType="register"
                            onChange={handleChange}
                        />
                    </div>
                    <Input
                        label="Email"
                        type="email"
                        name="email"
                        placeholder="Enter email"
                        formType="register"
                        onChange={handleChange}
                    />
                    <Input
                        label="Password"
                        type="password"
                        name="password"
                        placeholder="Enter password"
                        formType="register"
                        onChange={handleChange}
                    />            
                    <Input
                        label="Confirm Password"
                        type="password"
                        name="confirmPassword"
                        placeholder="Re-enter password"
                        formType="register"
                        onChange={handleChange}
                    />
                    <Button type="submit" text="Register" />
                </form>
            </div>
                     {/* <div className="image-box">
                       <img src={mcgillImage} alt="McGill Campus" />
                     </div> */}
        </div>
    </main>
    );
}

export default Registration;
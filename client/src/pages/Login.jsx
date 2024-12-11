import React, { useState } from 'react';
import { login } from '../api/api.js'; // import the login function from api.js
import "./Login.css";
import Input from '../components/Input';

function Login() {
    return (
        <main className="main">
            <div className="login-container">
                <div className="login-box">
                    <h2>Login</h2>
                    <form className="login-form">
                        <Input
                            label="Email"
                            type="email"
                            name="email"
                            placeholder="Enter email"
                        />
                        <Input  
                            label="Password"
                            type="password"
                            name="password"
                            placeholder="Enter password"
                        />
                        <button type="submit" className="login-button">Login</button>
                    </form>
                    </div>
                    {/* <div className="image-box">
                      <img src={mcgillImage} alt="McGill Campus" />
                    </div> */}
                </div>
        </main>
    );
}

export default Login;
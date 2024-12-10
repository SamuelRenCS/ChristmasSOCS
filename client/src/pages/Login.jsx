import React, { useState } from 'react';
import { login } from '../api/api.js'; // import the login function from api.js
import "./Login.css";

function Login() {
    <main className="main">
                <div className="login-container">
                    <div className="login-box">
                        <h2>Login</h2>
                        <form className="login-form">
                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input type="email" id="email" placeholder="Enter email" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <input type="password" id="password" placeholder="Enter password" />
                            </div>
                            <button type="submit" className="login-button">Login</button>
                        </form>
                    </div>
                    <div className="image-box">
                      <img src={mcgillImage} alt="McGill Campus" />
                    </div>
                </div>
            </main>
}

export default Login;
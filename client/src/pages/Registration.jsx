import React from 'react';
import "./Login.css";
//import mcgillImage from './images/mcgill.jpg';

function Registration() {
   return (
   <main className="main">
                <div className="login-container">
                    <div className="login-box">
                        <h2 style={{margin:'0px', padding:'0px'}}>Create an Account</h2>
                        <form className="login-form">
                            <div className="form-row" style={{display: 'flex', gap: '10px'}}>
                                <Input 
                                    label="First Name"
                                    type="text"
                                    name="firstName"
                                    placeholder="Enter first name"
                                />
                                <Input
                                    label="Last Name"
                                    type="text"
                                    name="lastName"
                                    placeholder="Enter last name"
                                />
                            </div>
                            <Input
                                label="Email"
                                type="email"
                                name="email"
                                placeholder="Enter email"
                                style={{ marginBottom: '12px' }}
                            />
                            <Input
                                label="Password"
                                type="password"
                                name="password"
                                placeholder="Enter password"
                                style={{ marginBottom: '12px' }}
                            />
                            <Input
                                label="Confirm Password"
                                type="password"
                                name="confirmPassword"
                                placeholder="Re-enter password"
                                style={{ marginBottom: '12px' }}
                            />
                            <button type="submit" className="login-button" style={{marginTop:'0px'}}>Register</button >
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
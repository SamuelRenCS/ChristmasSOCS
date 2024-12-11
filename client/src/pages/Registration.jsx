import React from 'react';
import "./Login.css";
//import mcgillImage from './images/mcgill.jpg';
import Input from '../components/Input';
import Button from '../components/Button';

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
                                    formType="register"
                                />
                                <Input
                                    label="Last Name"
                                    type="text"
                                    name="lastName"
                                    placeholder="Enter last name"
                                    formType="register"
                                />
                            </div>
                            <Input
                                label="Email"
                                type="email"
                                name="email"
                                placeholder="Enter email"
                                formType="register"
                            />
                            <Input
                                label="Password"
                                type="password"
                                name="password"
                                placeholder="Enter password"
                                formType="register"
                            />
                            <Input
                                label="Confirm Password"
                                type="password"
                                name="confirmPassword"
                                placeholder="Re-enter password"
                                formType="register"
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
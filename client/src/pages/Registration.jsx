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
                                <div className="form-group">
                                    <label htmlFor="firstName">First Name</label>
                                    <input type="text" id="firstName" placeholder="Enter first name" style={{marginBottom:'12px'}}/>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="lastName">Last Name</label>
                                    <input type="text" id="lastName" placeholder="Enter last name" style={{marginBottom:'12px'}}/>
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input type="email" id="email" placeholder="Enter email" style={{marginBottom:'12px'}}/>
                            </div>
                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <input type="password" id="password" placeholder="Enter password" style={{marginBottom:'12px'}}/>
                            </div>
                            <div className="form-group">
                                <label htmlFor="confirmPassword">Confirm Password</label>
                                <input type="password" id="confirm" placeholder="Re-enter password" style={{marginBottom:'15px'}}/>
                            </div>
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
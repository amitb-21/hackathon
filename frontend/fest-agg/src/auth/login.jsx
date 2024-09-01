import { useState } from "react";
import './form.css';
export default function Login() {
    let [formData, setFormData] = useState({
        emailId: "",
        password: "",
    });

    let handleInputChange = (event) => {
        setFormData( (currData) => {
            return{...currData, [event.target.name] : event.target.value
            };
        })
    };

    let handleSubmit = (event) => {
        event.preventDefault();
        setFormData({
            emailId: "",
            password: "",
        });
    };

    return (
        <div className="form">
            <h2>Welcome to Login Form</h2>
            <form action="" onSubmit={handleSubmit}>
                <div className="email">
                    <label htmlFor="emailId">Enter Email Id</label>
                    <input 
                    placeholder="Email Id" 
                    value = {formData.emailId}
                    onChange={handleInputChange}
                    id="emailId"
                    name="emailId"
                    />
                </div>
                <br />
                <div className="password">
                    <label htmlFor="password">Enter Password</label>
                    <input 
                    placeholder="Password" 
                    type="password"
                    value = {formData.password}
                    onChange={handleInputChange}
                    id="password"
                    name="password"
                />
                </div>
            <button>Login</button>
        </form>
        <div className="extrafeature">
            <a href="">Create New Account</a>
            <a href="">Forgot Password</a>
        </div>
        </div>
    )
}
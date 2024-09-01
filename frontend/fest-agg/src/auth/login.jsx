import { useState } from "react";
import { useNavigate } from "react-router-dom";
import './form.css';

export default function Login() {
    let [formData, setFormData] = useState({
        emailId: "",
        password: "",
    });
    let [errorMessage, setErrorMessage] = useState("");
    let navigate = useNavigate();

    let handleInputChange = (event) => {
        setFormData((currData) => ({
            ...currData,
            [event.target.name]: event.target.value
        }));
    };

    let handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            if (response.ok) {
                navigate('/'); // Redirect to home page
            } else {
                setErrorMessage("Wrong info. Please try again.");
            }
        } catch (error) {
            console.error("Login error:", error);
            setErrorMessage("An error occurred. Please try again.");
        }
    };

    return (
        <div className="form">
            <h2>Welcome to Login Form</h2>
            <form onSubmit={handleSubmit}>
                <div className="email">
                    <label htmlFor="emailId">Enter Email Id</label>
                    <input 
                        placeholder="Email Id" 
                        value={formData.emailId}
                        onChange={handleInputChange}
                        id="emailId"
                        name="emailId"
                    />
                </div>
                <div className="password">
                    <label htmlFor="password">Enter Password</label>
                    <input 
                        placeholder="Password" 
                        type="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        id="password"
                        name="password"
                    />
                </div>
                <button type="submit">Login</button>
            </form>
            {errorMessage && <div className="error">{errorMessage}</div>}
            <div className="extrafeature">
                <a href="/signup">Create New Account</a>
                <a href="/forgot-password">Forgot Password</a>
            </div>
            <button className="home-button" onClick={() => navigate('/')}>Go to Home Page</button>
        </div>
    );
}

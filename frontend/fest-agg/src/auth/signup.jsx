import { useState } from "react";
import { useNavigate } from "react-router-dom";
import './form.css';

export default function Signup() {
    let [formData, setFormData] = useState({
        emailId: "",
        username: "",
        password: "",
        collegeName: "",
        contactNo: "",
        idCardImage: null, 
    });
    let [error, setError] = useState("");
    let navigate = useNavigate();

    let handleInputChange = (event) => {
        const { name, value, type, files } = event.target;
        if (type === "file") {
            setFormData((currData) => ({
                ...currData,
                [name]: files[0] 
            }));
        } else {
            setFormData((currData) => ({
                ...currData,
                [name]: value
            }));
        }
    };

    let handleSubmit = async (event) => {
        event.preventDefault();
        
        // Basic validation
        if (!formData.emailId || !formData.username || !formData.password || !formData.collegeName || !formData.contactNo || !formData.idCardImage) {
            setError("Please fill in all fields and upload an ID card image.");
            return;
        }

        try {
            const formDataToSend = new FormData();
            for (const key in formData) {
                formDataToSend.append(key, formData[key]);
            }
            const response = await fetch('http://localhost:5000/api/signup', {
                method: 'POST',
                body: formDataToSend
            });
            if (response.ok) {
                navigate('/'); // Redirect to home page
            } else {
                setError("Signup failed. Please try again.");
            }
        } catch (error) {
            console.error("Signup error:", error);
            setError("Signup error. Please try again.");
        }
    };

    return (
        <div className="form">
            <h2>Welcome to Signup Form</h2>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleSubmit}>
                <label>
                    Email:
                    <input type="email" name="emailId" value={formData.emailId} onChange={handleInputChange} required />
                </label>
                <label>
                    Username:
                    <input type="text" name="username" value={formData.username} onChange={handleInputChange} required />
                </label>
                <label>
                    Password:
                    <input type="password" name="password" value={formData.password} onChange={handleInputChange} required />
                </label>
                <label>
                    College Name:
                    <input type="text" name="collegeName" value={formData.collegeName} onChange={handleInputChange} required />
                </label>
                <label>
                    Contact Number:
                    <input type="text" name="contactNo" value={formData.contactNo} onChange={handleInputChange} required />
                </label>
                <label>
                    ID Card Image:
                    <input type="file" name="idCardImage" onChange={handleInputChange} required />
                </label>
                <button type="submit">Sign Up</button>
            </form>
            <button className="home-button" onClick={() => navigate('/')}>Go to Home Page</button>
        </div>
    );
}

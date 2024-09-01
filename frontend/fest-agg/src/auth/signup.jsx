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
                console.error("Signup failed");
            }
        } catch (error) {
            console.error("Signup error:", error);
        }
    };

    return (
        <div className="form">
            <h2>Welcome to Signup Form</h2>
            <form onSubmit={handleSubmit}>
                {/* Input fields */}
                <button type="submit">Sign Up</button>
            </form>
            <button className="home-button" onClick={() => navigate('/')}>Go to Home Page</button>
        </div>
    );
}

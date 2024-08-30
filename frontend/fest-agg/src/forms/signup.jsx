import { useState } from "react";
import './form.css';

export default function SignUpForm() {
    let [formData, setFormData] = useState({
        emailId: "",
        username: "",
        password: "",
        collegeName: "",
        contactNo: "",
        idCardImage: null, 
    });

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

    let handleSubmit = (event) => {
        event.preventDefault();
        console.log(formData); 

        setFormData({
            emailId: "",
            username: "",
            password: "",
            collegeName: "",
            contactNo: "",
            idCardImage: null,
        });
    };

    return (
        <div className="form">
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
            <div className="user">
                <label htmlFor="username">Enter Username</label>
                <input 
                    placeholder="Username" 
                    value={formData.username} 
                    onChange={handleInputChange} 
                    id="username" 
                    name="username" 
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
            <div className="collegeName">
                <label htmlFor="collegeName">Enter College Name</label>
                <input 
                    placeholder="College Name" 
                    value={formData.collegeName} 
                    onChange={handleInputChange} 
                    id="collegeName" 
                    name="collegeName" 
                />
            </div>
            <div className="contactNo">
                <label htmlFor="contactNo">Enter Contact No</label>
                <input 
                    placeholder="Contact Number" 
                    value={formData.contactNo} 
                    onChange={handleInputChange} 
                    id="contactNo" 
                    name="contactNo" 
                    type="number" 
                />
            </div>
            <div className="idCardImage">
                <label htmlFor="idCardImage">Upload ID Card Image</label>
                <input 
                    type="file" 
                    id="idCardImage" 
                    name="idCardImage" 
                    accept="image/*" 
                    onChange={handleInputChange} 
                />
            </div>
            <button type="submit">Sign Up</button>
        </form>
    </div>
    );
}

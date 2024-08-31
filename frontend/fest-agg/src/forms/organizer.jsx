import { useState } from "react";
import './form.css';

export default function Signup() {
    const [formData, setFormData] = useState({
        emailId: "",
        username: "",
        password: "",
        collegeName: "",
        contactNo: "",
        city: "",
        state: "",
        festName: "",
        permissionLetterImage: null, 
        maxPeople: "",
        noOfDays: "",
        pricePerDay: "",
        dateOfFest: "",
    });

    const handleInputChange = (event) => {
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

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const formDataToSend = new FormData();
            Object.keys(formData).forEach(key => {
                formDataToSend.append(key, formData[key]);
            });

            const response = await fetch('http://localhost:5000/api/organizers', {
                method: 'POST',
                body: formDataToSend
            });

            if (response.ok) {
                console.log('Organizer data saved successfully');
            } else {
                console.error('Error saving organizer data');
            }

            setFormData({
                emailId: "",
                username: "",
                password: "",
                collegeName: "",
                contactNo: "",
                city: "",
                state: "",
                festName: "",
                permissionLetterImage: null, 
                maxPeople: "",
                noOfDays: "",
                pricePerDay: "",
                dateOfFest: "",
            });
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div className="signup-form">
            <h2>Welcome to Signup Form</h2>
            <form onSubmit={handleSubmit}>
                {/* Email Field */}
                <div className="form-field">
                    <label htmlFor="emailId">Enter Email Id</label>
                    <input 
                        type="email"
                        placeholder="Email Id" 
                        value={formData.emailId} 
                        onChange={handleInputChange} 
                        id="emailId" 
                        name="emailId" 
                        required
                    />
                </div>

                {/* Username Field */}
                <div className="form-field">
                    <label htmlFor="username">Enter Username</label>
                    <input 
                        type="text"
                        placeholder="Username" 
                        value={formData.username} 
                        onChange={handleInputChange} 
                        id="username" 
                        name="username" 
                        required
                    />
                </div>

                {/* Password Field */}
                <div className="form-field">
                    <label htmlFor="password">Enter Password</label>
                    <input 
                        type="password"
                        placeholder="Password" 
                        value={formData.password} 
                        onChange={handleInputChange} 
                        id="password" 
                        name="password" 
                        required
                    />
                </div>

                {/* College Name Field */}
                <div className="form-field">
                    <label htmlFor="collegeName">Enter College Name</label>
                    <input 
                        type="text"
                        placeholder="College Name" 
                        value={formData.collegeName} 
                        onChange={handleInputChange} 
                        id="collegeName" 
                        name="collegeName" 
                        required
                    />
                </div>

                {/* Contact Number Field */}
                <div className="form-field">
                    <label htmlFor="contactNo">Enter Contact Number</label>
                    <input 
                        type="tel"
                        placeholder="Contact Number" 
                        value={formData.contactNo} 
                        onChange={handleInputChange} 
                        id="contactNo" 
                        name="contactNo" 
                        required
                    />
                </div>

                {/* City Field */}
                <div className="form-field">
                    <label htmlFor="city">Enter City</label>
                    <input 
                        type="text"
                        placeholder="City" 
                        value={formData.city} 
                        onChange={handleInputChange} 
                        id="city" 
                        name="city" 
                        required
                    />
                </div>

                {/* State Field */}
                <div className="form-field">
                    <label htmlFor="state">Enter State</label>
                    <input 
                        type="text"
                        placeholder="State" 
                        value={formData.state} 
                        onChange={handleInputChange} 
                        id="state" 
                        name="state" 
                        required
                    />
                </div>

                {/* Fest Name Field */}
                <div className="form-field">
                    <label htmlFor="festName">Enter Fest Name</label>
                    <input 
                        type="text"
                        placeholder="Fest Name" 
                        value={formData.festName} 
                        onChange={handleInputChange} 
                        id="festName" 
                        name="festName" 
                        required
                    />
                </div>

                {/* Permission Letter Image Field */}
                <div className="form-field">
                    <label htmlFor="permissionLetterImage">Upload Permission Letter Image</label>
                    <input 
                        type="file"
                        onChange={handleInputChange} 
                        id="permissionLetterImage" 
                        name="permissionLetterImage" 
                        required
                    />
                </div>

                {/* Max People Field */}
                <div className="form-field">
                    <label htmlFor="maxPeople">Enter Maximum Number of People</label>
                    <input 
                        type="number"
                        placeholder="Maximum Number of People" 
                        value={formData.maxPeople} 
                        onChange={handleInputChange} 
                        id="maxPeople" 
                        name="maxPeople" 
                        required
                    />
                </div>

                {/* Number of Days Field */}
                <div className="form-field">
                    <label htmlFor="noOfDays">Enter Number of Days</label>
                    <input 
                        type="number"
                        placeholder="Number of Days" 
                        value={formData.noOfDays} 
                        onChange={handleInputChange} 
                        id="noOfDays" 
                        name="noOfDays" 
                        required
                    />
                </div>

                {/* Price Per Day Field */}
                <div className="form-field">
                    <label htmlFor="pricePerDay">Enter Price Per Day</label>
                    <input 
                        type="number"
                        placeholder="Price Per Day" 
                        value={formData.pricePerDay} 
                        onChange={handleInputChange} 
                        id="pricePerDay" 
                        name="pricePerDay" 
                        required
                    />
                </div>

                {/* Date of Fest Field */}
                <div className="form-field">
                    <label htmlFor="dateOfFest">Enter Date of the Fest</label>
                    <input 
                        type="date"
                        value={formData.dateOfFest} 
                        onChange={handleInputChange} 
                        id="dateOfFest" 
                        name="dateOfFest" 
                        required
                    />
                </div>

                <button type="submit">Sign Up</button>
            </form>
        </div>
    );
}


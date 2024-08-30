import { useState } from "react";

export default function Form() {
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
            <form action="" onSubmit={handleSubmit}>
            <label htmlFor="emailId">Enter Email Id</label>
            <input 
            placeholder="Email Id" 
            value = {formData.emailId}
            onChange={handleInputChange}
            id="emailId"
            name="emailId"
            />
            <br />
            <label htmlFor="password">Enter PassWord</label>
            <input 
            placeholder="Password" 
            type="password"
            value = {formData.password}
            onChange={handleInputChange}
            id="password"
            name="password"
            />
            <button>Login</button>
        </form>
        <div className="extrafeature">
            <a href="">Create New Account</a>
            <a href="">Forgot Password</a>
        </div>
        </div>
    )

}
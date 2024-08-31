import React, { useState, useEffect } from 'react';
import './homepage.css';
// Ensure the correct path to FestCategories.jsx

export default function Homepage() {
    const [displayedText, setDisplayedText] = useState("");
    const [currentTextIndex, setCurrentTextIndex] = useState(0);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const textLines = [
        "Explore, Experience, and Enjoy Every College Fest Around!",
        "Discover the Best Events at Your Campus!",
        "Join the Fun: Your College Fest Awaits!",
        "Celebrate College Life Like Never Before!"
    ];

    /*const images = [
        "image1.jpg",
        "image2.jpg",
        "image3.jpg"
    ];*/

    useEffect(() => {
        const textIntervalId = setInterval(() => {
            setDisplayedText(textLines[currentTextIndex]);
            setCurrentTextIndex((prevIndex) => (prevIndex + 1) % textLines.length);
        }, 6000); // Text changes every 6 seconds

       /* const imageIntervalId = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 6000); // Image changes every 6 seconds*/

        return () => {
            clearInterval(textIntervalId);
            //clearInterval(imageIntervalId);
        };
    }, [currentTextIndex]);

    return (
        <div className="main">
            <div className="text-container">
                <p className="constant-text">Your Gateway To College Festivities!</p>
                <p className="changing-text">{displayedText}</p>
            </div>
            
        </div>
    );
}


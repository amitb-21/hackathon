import React, { useState, useEffect } from 'react';
import './homepage.css';

export default function Homepage() {
    const [displayedText, setDisplayedText] = useState("");
    const [currentTextIndex, setCurrentTextIndex] = useState(0);

    const textLines = [
        "Explore, Experience, and Enjoy Every College Fest Around!",
        "Discover the Best Events at Your Campus!",
        "Join the Fun: Your College Fest Awaits!",
        "Celebrate College Life Like Never Before!"
    ];

    useEffect(() => {
        const textIntervalId = setInterval(() => {
            setDisplayedText(textLines[currentTextIndex]);
            setCurrentTextIndex((prevIndex) => (prevIndex + 1) % textLines.length);
        }, 4000); // Text changes every 6 seconds

        return () => {
            clearInterval(textIntervalId);
        };
    }, [currentTextIndex]);

    return (
        <div className="main">
            <div className="text-container">
               <p className="constant-text 1">Welcome To Festiverse!!</p>
                <p className="constant-text">Your Gateway To College Festivities!</p>
                <p className="changing-text">{displayedText}</p>
            </div>
            <div className="image-container">
                <img src="image1.jpg" alt="Fest Image 1" className="sliding-image" />
                <img src="image2.jpg" alt="Fest Image 2" className="sliding-image" />
            </div>
        </div>
    );
}

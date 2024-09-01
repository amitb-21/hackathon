import React from 'react'; 
import './festCategories.css';

export default function FestCategories() {
    return (
        <div className="fest-categories">
            <h1 className="categories-tagline">Explore Diverse Festivities!</h1>
            <div className="category-container">
                <div className="category-card">
                    <img src="cultural.jpg" alt="Cultural Fest" className="category-image" />
                    <h2>Cultural Fests</h2>
                    <p>Immerse yourself in vibrant cultural experiences. Explore music, dance, and art from diverse traditions.</p>
                </div>
                <div className="category-card">
                    <img src="tech.jpg" alt="Tech Fest" className="category-image" />
                    <h2>Tech Fests</h2>
                    <p>Discover the latest innovations and technologies. Engage with cutting-edge startups and tech enthusiasts.</p>
                </div>
                <div className="category-card">
                    <img src="sports.jpg" alt="Sports Fest" className="category-image" />
                    <h2>Sports Fests</h2>
                    <p>Cheer for your favorite teams and participate in exciting sports events. From local tournaments to major leagues!</p>
                </div>
            </div>
        </div>
    );
}

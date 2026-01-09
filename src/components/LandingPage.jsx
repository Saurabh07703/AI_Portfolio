import React from 'react';
import FaceAuth from './FaceAuth';
import './LandingPage.css';

const LandingPage = ({ onLoginSuccess }) => {
    return (
        <div className="landing-page">
            <div className="landing-content">
                <h1 className="gradient-text title-large">AI Jewelry System</h1>
                <p className="subtitle">Secure Biometric Access</p>

                <div className="auth-container">
                    <FaceAuth
                        isEmbedded={true}
                        onLoginSuccess={onLoginSuccess}
                    />
                </div>
            </div>
        </div>
    );
};

export default LandingPage;

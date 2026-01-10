import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import './FaceAuth.css';

// Configure based on your API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

const FaceAuth = ({ onClose, onLoginSuccess, isEmbedded = false }) => {
    const webcamRef = useRef(null);
    const [mode, setMode] = useState('login'); // 'login' or 'register'
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [messageType, setMessageType] = useState(''); // 'success' or 'error'

    const speakWelcome = (username) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(`Welcome back, ${username}`);
            utterance.voice = window.speechSynthesis.getVoices().find(v => v.lang === 'en-US') || null;
            utterance.rate = 0.9;
            window.speechSynthesis.speak(utterance);
        }
    };

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();

        // Resize image to reduce payload size and processing time
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                // Force max width 320px (FaceNet only needs 160px)
                const scale = 320 / img.width;
                canvas.width = 320;
                canvas.height = img.height * scale;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL('image/jpeg', 0.8));
            };
            img.src = imageSrc;
        });
    }, [webcamRef]);

    // Convert base64 to blob for file upload
    const dataURItoBlob = (dataURI) => {
        const byteString = atob(dataURI.split(',')[1]);
        const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], { type: mimeString });
    };

    const handleAction = async () => {
        const imageSrc = await capture();
        if (!imageSrc) {
            setMessage('Failed to capture image. Please try again.');
            setMessageType('error');
            return;
        }

        setLoading(true);
        setMessage(null);

        const blob = dataURItoBlob(imageSrc);
        const formData = new FormData();
        formData.append('file', blob, 'capture.jpg');

        try {
            if (mode === 'register') {
                if (!name.trim()) {
                    setMessage('Please enter your name.');
                    setMessageType('error');
                    setLoading(false);
                    return;
                }
                formData.append('name', name);
                const res = await axios.post(`${API_URL}/face/register`, formData, { timeout: 120000 });
                setMessage(res.data.message);
                setMessageType('success');
                setTimeout(() => {
                    setMode('login');
                    setMessage(null);
                }, 2000);
            } else {
                const res = await axios.post(`${API_URL}/face/recognize`, formData, { timeout: 120000 });
                if (res.data.match) {
                    setMessage(`Welcome back, ${res.data.user}!`);
                    setMessageType('success');
                    speakWelcome(res.data.user);
                    if (onLoginSuccess) onLoginSuccess(res.data.user);
                    if (!isEmbedded && onClose) setTimeout(onClose, 1500);
                } else {
                    setMessage('Face not recognized. Please try again or register.');
                    setMessageType('error');
                }
            }
        } catch (err) {
            console.error("Face Auth Error:", err);
            let errorMessage = 'An error occurred.';

            if (err.code === 'ECONNABORTED') {
                errorMessage = 'Server is warming up (it may take up to 2 mins). Please try again in a moment.';
            } else if (err.response && err.response.data && err.response.data.detail) {
                errorMessage = err.response.data.detail;
            } else if (err.message) {
                errorMessage = err.message;
            }

            setMessage(errorMessage);
            setMessageType('error');
        } finally {
            setLoading(false);
        }
    };

    const content = (
        <motion.div
            className={`face-auth-modal glass-panel ${isEmbedded ? 'embedded' : ''}`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
        >
            {!isEmbedded && <button className="close-btn" onClick={onClose}>&times;</button>}

            <h2 className="gradient-text">
                {mode === 'login' ? 'Face Verification' : 'Register Face'}
            </h2>

            <div className="webcam-container">
                <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    className="webcam-view"
                    videoConstraints={{
                        width: 320,
                        height: 320,
                        facingMode: "user"
                    }}
                />
                {/* Overlay Frame Animation */}
                <div className={`scan-frame ${loading ? 'scanning' : ''}`}></div>
            </div>

            <div className="controls">
                {mode === 'register' && (
                    <input
                        type="text"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="name-input"
                    />
                )}

                <button
                    className={`action-btn ${loading ? 'loading' : ''}`}
                    onClick={handleAction}
                    disabled={loading}
                >
                    {loading ? 'Processing...' : (mode === 'login' ? 'Verify Identity' : 'Register Now')}
                </button>

                {message && (
                    <motion.div
                        className={`status-message ${messageType}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {message}
                    </motion.div>
                )}

                <div className="toggle-mode">
                    <span>{mode === 'login' ? 'New user?' : 'Already registered?'}</span>
                    <button onClick={() => {
                        setMode(mode === 'login' ? 'register' : 'login');
                        setMessage(null);
                    }}>
                        {mode === 'login' ? 'Create Account' : 'Login Here'}
                    </button>
                </div>
            </div>
        </motion.div>
    );

    if (isEmbedded) return content;

    return (
        <AnimatePresence>
            <motion.div
                className="face-auth-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                {content}
            </motion.div>
        </AnimatePresence>
    );
};

export default FaceAuth;

import React, { useState, useEffect, useRef } from 'react';
import './VoiceAgent.css';

const VoiceAgent = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [showWindow, setShowWindow] = useState(false);

    // Conversation History State
    const [messages, setMessages] = useState([]);
    const messagesEndRef = useRef(null);
    const transcriptRef = useRef(''); // Use ref to track transcript without re-rendering effect

    const recognitionRef = useRef(null);
    const synthRef = useRef(window.speechSynthesis);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        // Pre-load voices
        const loadVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            console.log("Loaded voices:", voices.length);
        };
        loadVoices();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }

        // Initialize Speech Recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event) => {
                const current = event.resultIndex;
                const transcriptText = event.results[current][0].transcript;
                setTranscript(transcriptText);
                transcriptRef.current = transcriptText; // Update ref
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
                const finalTranscript = transcriptRef.current;

                if (finalTranscript && finalTranscript.trim().length > 0) {
                    handleVoiceQuery(finalTranscript);
                }
            };

            recognitionRef.current.onerror = (event) => {
                console.error("Speech recognition error", event.error);
                setIsListening(false);
                setTranscript("Error: " + event.error);
            };
        } else {
            console.warn("Speech Recognition not supported in this browser.");
        }
    }, []); // Empty dependency array ensures we only init once

    const handleVoiceQuery = async (query) => {
        setMessages(prev => [...prev, { type: 'user', text: query }]);
        setTranscript("Thinking...");

        try {
            // Force localhost for development to avoid hitting production Render server
            const apiUrl = 'http://localhost:8001';
            console.log("Sending voice query to:", apiUrl + '/voice/chat');

            const res = await fetch(`${apiUrl}/voice/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: query })
            });

            if (!res.ok) throw new Error(`Server error: ${res.status}`);

            const data = await res.json();
            console.log("Voice Response:", data);

            setMessages(prev => [...prev, { type: 'bot', text: data.response }]);
            setTranscript('');
            speakResponse(data.response);

        } catch (err) {
            console.error("Voice Agent Error:", err);
            setTranscript("Error: " + err.message);
        }
    };

    const speakResponse = (text) => {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        if (text) {
            setIsSpeaking(true);
            const utterance = new SpeechSynthesisUtterance(text);

            // Try to find a good English voice
            const voices = window.speechSynthesis.getVoices();
            const preferredVoice = voices.find(v => v.name.includes('Google US English') || v.name.includes('Samantha') || v.lang === 'en-US');
            if (preferredVoice) utterance.voice = preferredVoice;

            utterance.onend = () => {
                setIsSpeaking(false);
                setTranscript(''); // Clear after speaking
            };

            utterance.onerror = (e) => {
                console.error("Speech synthesis error:", e);
                setIsSpeaking(false);
            };

            window.speechSynthesis.speak(utterance);
        }
    };

    const toggleListening = () => {
        if (!recognitionRef.current) {
            alert("Voice features not supported in this browser.");
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            setShowWindow(true);
            setIsListening(true);
            setTranscript("Listening...");
            transcriptRef.current = ''; // Clear previous recording
            recognitionRef.current.start();
        }
    };

    const handleClose = () => {
        setShowWindow(false);
        setMessages([]); // Clear history
        setTranscript('');
        setIsListening(false);
        if (recognitionRef.current) recognitionRef.current.stop();
        window.speechSynthesis.cancel(); // Stop speaking
    };

    return (
        <div className="voice-agent-container">
            {showWindow && (
                <div className="voice-window">
                    <div className="voice-header">
                        <span className="voice-status">
                            {isListening ? "Listening..." : (isSpeaking ? "Speaking..." : "Ready")}
                        </span>
                        <button className="close-btn-small" onClick={handleClose}>×</button>
                    </div>

                    <div className="voice-messages">
                        {messages.length === 0 && <p className="voice-placeholder">Start speaking...</p>}
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`v-message ${msg.type}`}>
                                {msg.text}
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="transcript-live">
                        {transcript && <span className="fade-in">{transcript}</span>}
                    </div>

                    <div className="voice-visualizer">
                        {/* Dynamic bars based on state */}
                        <div className="wave-bar" style={{ animationPlayState: (isListening || isSpeaking) ? 'running' : 'paused' }}></div>
                        <div className="wave-bar" style={{ animationPlayState: (isListening || isSpeaking) ? 'running' : 'paused' }}></div>
                        <div className="wave-bar" style={{ animationPlayState: (isListening || isSpeaking) ? 'running' : 'paused' }}></div>
                        <div className="wave-bar" style={{ animationPlayState: (isListening || isSpeaking) ? 'running' : 'paused' }}></div>
                        <div className="wave-bar" style={{ animationPlayState: (isListening || isSpeaking) ? 'running' : 'paused' }}></div>
                    </div>
                </div>
            )}

            <button
                className={`voice-toggle ${isListening ? 'listening' : ''}`}
                onClick={toggleListening}
                title="Talk to AI Agent"
            >
                {isListening ? (
                    <div className="voice-icon" style={{ fontSize: '24px' }}>⬛</div> // Stop icon
                ) : (
                    <svg className="voice-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                )}
            </button>
        </div>
    );
};

export default VoiceAgent;

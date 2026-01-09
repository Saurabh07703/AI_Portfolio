import { useState, useEffect, useRef } from 'react';
import './MetricCounter.css';

const MetricCounter = ({ value, label, suffix = '', prefix = '', duration = 2000 }) => {
    const [count, setCount] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const counterRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !isVisible) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.5 }
        );

        if (counterRef.current) {
            observer.observe(counterRef.current);
        }

        return () => {
            if (counterRef.current) {
                observer.unobserve(counterRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (!isVisible) return;

        const numericValue = parseFloat(value);
        const increment = numericValue / (duration / 16);
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= numericValue) {
                setCount(numericValue);
                clearInterval(timer);
            } else {
                setCount(current);
            }
        }, 16);

        return () => clearInterval(timer);
    }, [isVisible, value, duration]);

    const formatValue = (val) => {
        if (suffix === '%') {
            return val.toFixed(1);
        }
        return Math.round(val);
    };

    return (
        <div ref={counterRef} className="metric-counter">
            <div className="metric-value-large">
                {prefix}
                {formatValue(count)}
                {suffix}
            </div>
            <div className="metric-label-large">{label}</div>
        </div>
    );
};

export default MetricCounter;

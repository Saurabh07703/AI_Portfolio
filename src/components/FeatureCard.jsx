import './FeatureCard.css';

const FeatureCard = ({ icon, title, description, metrics, gradient = 'purple' }) => {
    return (
        <div className={`feature-card glass card gradient-${gradient}`}>
            {icon && <div className="feature-icon">{icon}</div>}
            <h3 className="feature-title">{title}</h3>
            <p className="feature-description">{description}</p>
            {metrics && (
                <div className="feature-metrics">
                    {metrics.map((metric, index) => (
                        <div key={index} className="metric-item">
                            <span className="metric-label">{metric.label}:</span>
                            <span className="metric-value">{metric.value}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FeatureCard;

import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-section">
                        <h3 className="gradient-text">AI Jewelry System</h3>
                        <p>
                            Advanced machine learning solution for jewelry e-commerce,
                            combining recommendation systems and demand forecasting.
                        </p>
                    </div>

                    <div className="footer-section">
                        <h4>Key Technologies</h4>
                        <ul>
                            <li>Collaborative Filtering (SVD)</li>
                            <li>Content-Based (TF-IDF)</li>
                            <li>ARIMA Time Series</li>
                            <li>Hybrid ML Architecture</li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h4>Results</h4>
                        <ul>
                            <li>+22% Click-through Rate</li>
                            <li>+18% Conversion Rate</li>
                            <li>87.7% Forecast Accuracy</li>
                            <li>-25% Inventory Costs</li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; 2025 AI-Driven Jewelry Recommendation System. Data Science Portfolio Project.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

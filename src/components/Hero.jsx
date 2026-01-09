import './Hero.css';

const Hero = () => {
    return (
        <section id="hero" className="hero">
            <div className="hero-background">
                <div className="gradient-orb orb-1"></div>
                <div className="gradient-orb orb-2"></div>
                <div className="gradient-orb orb-3"></div>
            </div>

            <div className="container hero-content">
                <div className="hero-text animate-slideUp">
                    <h1 className="hero-title">
                        AI-Driven Jewelry Recommendation & Demand Forecasting
                    </h1>
                    <p className="hero-subtitle">
                        A comprehensive machine learning system combining hybrid recommendation engines
                        and time-series forecasting to revolutionize jewelry e-commerce
                    </p>
                    <div className="hero-tags">
                        <span className="badge">Machine Learning</span>
                        <span className="badge">Collaborative Filtering</span>
                        <span className="badge">ARIMA Forecasting</span>
                        <span className="badge">TF-IDF</span>
                    </div>
                </div>

                <div className="scroll-indicator animate-float">
                    <div className="scroll-arrow">↓</div>
                    <span>Scroll to explore</span>
                </div>
            </div>
        </section>
    );
};

export default Hero;

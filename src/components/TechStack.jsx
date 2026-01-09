import './TechStack.css';

const TechStack = () => {
    const technologies = {
        'Languages & Core': [
            'Python 3.9',
            'pandas',
            'NumPy',
            'scikit-learn',
            'Surprise',
            'statsmodels',
            'SciPy'
        ],
        'Infrastructure': [
            'PostgreSQL',
            'MongoDB',
            'Redis',
            'Apache Kafka',
            'Apache Airflow',
            'Docker',
            'AWS EC2',
            'AWS S3'
        ],
        'ML/AI Tools': [
            'MLflow',
            'Jupyter',
            'Flask',
            'Annoy',
            'TF-IDF',
            'SVD'
        ],
        'Visualization': [
            'Tableau',
            'Matplotlib',
            'Seaborn'
        ]
    };

    return (
        <section id="tech" className="section section-dark">
            <div className="container">
                <h2 className="section-title gradient-text">Technology Stack</h2>
                <p className="section-subtitle">
                    Comprehensive suite of technologies powering the AI recommendation and forecasting system
                </p>

                <div className="tech-categories">
                    {Object.entries(technologies).map(([category, techs]) => (
                        <div key={category} className="tech-category">
                            <h3 className="tech-category-title">{category}</h3>
                            <div className="tech-grid">
                                {techs.map((tech) => (
                                    <div key={tech} className="tech-badge glass">
                                        {tech}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TechStack;

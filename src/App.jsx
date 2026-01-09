import React from 'react'
import Navigation from './components/Navigation'
import Hero from './components/Hero'
import FeatureCard from './components/FeatureCard'
import MetricCounter from './components/MetricCounter'
import TechStack from './components/TechStack'
import Footer from './components/Footer'
import RecommendationDemo from './components/RecommendationDemo'
import ForecastDemo from './components/ForecastDemo'
import ProductListing from './components/ProductListing'
import './App.css'

function App() {
  const [selectedProductId, setSelectedProductId] = React.useState(null);

  return (
    <div className="app">
      <Navigation />
      <Hero />

      {/* Live Demo Section */}
      <section id="demo" className="section section-dark">
        <div className="container">
          <h2 className="section-title gradient-text">Live Interactive Demo</h2>
          <p className="section-subtitle">
            Experience the power of our hybrid recommendation engine and demand forecasting model in real-time.
          </p>
          <div className="grid grid-2">
            <RecommendationDemo onProductSelect={setSelectedProductId} />
            <ForecastDemo productId={selectedProductId} />
          </div>
        </div>
      </section>

      {/* Product Catalog Section */}
      <section id="catalog" className="section section-dark">
        <div className="container">
          <h2 className="section-title gradient-text" style={{ marginBottom: '3rem' }}>Exclusive Product Catalog</h2>
          <ProductListing />
        </div>
      </section>


      {/* Overview Section */}
      <section id="overview" className="section">
        <div className="container">
          <h2 className="section-title gradient-text">Project Overview</h2>
          <p className="section-subtitle">
            Addressing critical challenges in e-commerce jewelry retail through advanced machine learning
          </p>

          <div className="grid grid-2">
            <FeatureCard
              icon="🎯"
              title="Personalization Problem"
              description="How to recommend the right jewelry to customers from thousands of products with diverse styles, occasions, and price points. The jewelry industry has unique characteristics—high SKU count, strong seasonal patterns, and emotional purchasing decisions."
              gradient="purple"
            />
            <FeatureCard
              icon="📊"
              title="Inventory Management"
              description="How to predict demand for seasonal/occasion-based jewelry to optimize stock levels and pricing. Significant inventory costs and long lead times (3-6 months) make accurate forecasting critical."
              gradient="blue"
            />
          </div>

          <div className="objectives-section">
            <h3 className="subsection-title">Business Objectives</h3>
            <div className="grid grid-2">
              <div className="objective-card glass">
                <h4>Primary Goals</h4>
                <ul className="objective-list">
                  <li>Increase conversion rates through personalized recommendations</li>
                  <li>Reduce cart abandonment by showing relevant alternatives</li>
                  <li>Optimize inventory investment (reduce overstock/understock)</li>
                  <li>Maximize revenue during peak seasons</li>
                  <li>Improve customer lifetime value</li>
                </ul>
              </div>
              <div className="objective-card glass">
                <h4>Target Metrics</h4>
                <ul className="objective-list">
                  <li>20%+ increase in click-through rate</li>
                  <li>15%+ improvement in cross-sell/upsell revenue</li>
                  <li>25% reduction in excess inventory costs</li>
                  <li>30% reduction in stockout incidents</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recommendation System Section */}
      <section id="recommendation" className="section section-dark">
        <div className="container">
          <h2 className="section-title gradient-text">Hybrid Recommendation System</h2>
          <p className="section-subtitle">
            Combining collaborative filtering and content-based approaches for superior recommendations
          </p>

          <div className="grid grid-3">
            <FeatureCard
              icon="🤝"
              title="Collaborative Filtering"
              description="Matrix Factorization using SVD (Singular Value Decomposition) to discover latent user preferences. Reduced 50,000 users × 10,000 products matrix to 50 latent features."
              metrics={[
                { label: 'RMSE', value: '0.87' },
                { label: 'Precision@10', value: '24%' },
                { label: 'Recall@10', value: '18%' }
              ]}
              gradient="purple"
            />
            <FeatureCard
              icon="📝"
              title="Content-Based Filtering"
              description="TF-IDF vectorization with cosine similarity on product metadata. Created 10,000 products × 5,000 features matrix using unigrams and bigrams."
              metrics={[
                { label: 'Precision@10', value: '31%' },
                { label: 'Coverage', value: '95%' },
                { label: 'Features', value: '5000' }
              ]}
              gradient="blue"
            />
            <FeatureCard
              icon="⚡"
              title="Hybrid Ensemble"
              description="Weighted combination: 50% CF + 30% CB + 20% Popularity. Context-aware adjustments for new vs. returning users with business rules filtering."
              metrics={[
                { label: 'Precision@10', value: '35%' },
                { label: 'CTR Increase', value: '+22%' },
                { label: 'Conversion', value: '+18%' }
              ]}
              gradient="gold"
            />
          </div>

          <div className="technical-deep-dive">
            <h3 className="subsection-title">Technical Deep Dive</h3>
            <div className="grid grid-2">
              <div className="tech-detail-card glass">
                <h4 className="gradient-purple">TF-IDF Implementation</h4>
                <p>Term Frequency-Inverse Document Frequency transforms product descriptions into numerical vectors:</p>
                <ul className="tech-list">
                  <li><strong>Max Features:</strong> 5,000 most important terms</li>
                  <li><strong>N-grams:</strong> Unigrams and bigrams (e.g., "gold ring")</li>
                  <li><strong>Min DF:</strong> Terms must appear in ≥2 products</li>
                  <li><strong>Max DF:</strong> Ignore terms in &gt;80% of products</li>
                  <li><strong>Similarity:</strong> Cosine similarity for product matching</li>
                </ul>
              </div>
              <div className="tech-detail-card glass">
                <h4 className="gradient-blue">SVD Matrix Factorization</h4>
                <p>Decomposes user-item interaction matrix into latent factors:</p>
                <ul className="tech-list">
                  <li><strong>Latent Factors:</strong> 50 dimensions (tested 20-100)</li>
                  <li><strong>Learning Rate:</strong> 0.005 with regularization 0.02</li>
                  <li><strong>Training Epochs:</strong> 20 iterations</li>
                  <li><strong>Library:</strong> Surprise (scikit-surprise)</li>
                  <li><strong>Validation:</strong> 80/20 train-test split</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demand Forecasting Section */}
      <section id="forecasting" className="section">
        <div className="container">
          <h2 className="section-title gradient-text">Demand Forecasting with ARIMA</h2>
          <p className="section-subtitle">
            Time series forecasting for 3-6 month ahead inventory planning
          </p>

          <div className="grid grid-2">
            <FeatureCard
              icon="📈"
              title="ARIMA Modeling"
              description="AutoRegressive Integrated Moving Average for seasonal jewelry demand. Separate models for Bridal, Festive, and Daily Wear categories with 52-week seasonal cycles."
              metrics={[
                { label: 'MAPE', value: '12.3%' },
                { label: 'Accuracy', value: '87.7%' },
                { label: 'MAE', value: '145 units' }
              ]}
              gradient="purple"
            />
            <FeatureCard
              icon="🎯"
              title="Business Applications"
              description="Proactive inventory planning, dynamic pricing strategies, production scheduling, and marketing campaign alignment based on demand predictions."
              metrics={[
                { label: 'Overstock ↓', value: '25%' },
                { label: 'Stockouts ↓', value: '30%' },
                { label: 'Revenue ↑', value: '15%' }
              ]}
              gradient="gold"
            />
          </div>

          <div className="arima-details">
            <h3 className="subsection-title">ARIMA Components</h3>
            <div className="grid grid-3">
              <div className="arima-component glass">
                <div className="component-label">AR (p=2)</div>
                <h4>AutoRegressive</h4>
                <p>Uses past 2 weeks of sales data to predict future values. Captures momentum and trends in demand patterns.</p>
              </div>
              <div className="arima-component glass">
                <div className="component-label">I (d=1)</div>
                <h4>Integrated</h4>
                <p>First-order differencing to achieve stationarity. Removes trends by subtracting previous period values.</p>
              </div>
              <div className="arima-component glass">
                <div className="component-label">MA (q=2)</div>
                <h4>Moving Average</h4>
                <p>Adjusts predictions based on previous 2 forecast errors. Smooths out random fluctuations.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Performance Metrics Section */}
      <section id="metrics" className="section section-darker">
        <div className="container">
          <h2 className="section-title gradient-text">Performance & Business Impact</h2>
          <p className="section-subtitle">
            Measurable improvements across recommendation and forecasting systems
          </p>

          <div className="metrics-grid">
            <h3 className="metrics-category">Recommendation System Results</h3>
            <div className="grid grid-4">
              <MetricCounter value={22} suffix="%" label="Click-Through Rate ↑" />
              <MetricCounter value={18} suffix="%" label="Conversion Rate ↑" />
              <MetricCounter value={12} suffix="%" label="Average Order Value ↑" />
              <MetricCounter value={15} suffix="%" label="User Engagement ↑" />
            </div>

            <h3 className="metrics-category">Demand Forecasting Results</h3>
            <div className="grid grid-4">
              <MetricCounter value={87.7} suffix="%" label="Forecast Accuracy" />
              <MetricCounter value={25} suffix="%" label="Inventory Costs ↓" />
              <MetricCounter value={30} suffix="%" label="Stockout Incidents ↓" />
              <MetricCounter value={15} suffix="%" label="Peak Season Revenue ↑" />
            </div>
          </div>
        </div>
      </section>

      <TechStack />

      {/* Key Learnings Section */}
      <section className="section">
        <div className="container">
          <h2 className="section-title gradient-text">Key Learnings & Trade-offs</h2>
          <div className="grid grid-2">
            <div className="learning-card glass">
              <h4>✅ What Worked Well</h4>
              <ul className="learning-list">
                <li><strong>Hybrid Approach:</strong> 35% performance improvement over single methods</li>
                <li><strong>ARIMA over Deep Learning:</strong> Better interpretability with limited data</li>
                <li><strong>Pre-computation:</strong> Sub-100ms response times via Redis caching</li>
                <li><strong>Category-Specific Models:</strong> Higher accuracy than unified model</li>
              </ul>
            </div>
            <div className="learning-card glass">
              <h4>⚖️ Important Trade-offs</h4>
              <ul className="learning-list">
                <li><strong>Complexity vs. Performance:</strong> Hybrid system justified by results</li>
                <li><strong>Real-time vs. Batch:</strong> Nightly updates for speed, slight staleness</li>
                <li><strong>Accuracy vs. Business Rules:</strong> Balanced ML scores with inventory</li>
                <li><strong>Cold Start:</strong> Content-based fallback for new users/products</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default App

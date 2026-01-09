import React, { useState, useEffect } from 'react';
import { getProducts, getRecommendations } from '../api';
import './Demo.css';

const RecommendationDemo = ({ onProductSelect }) => {
    const [products, setProducts] = useState([]);
    const [selectedId, setSelectedId] = useState('');
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getProducts(20).then(data => {
            setProducts(data);
            if (data.length > 0) {
                setSelectedId(data[0].product_id);
                onProductSelect(data[0].product_id);
            }
        });
    }, []);

    const handleRecommend = async () => {
        if (!selectedId) return;
        setLoading(true);
        try {
            const results = await getRecommendations(selectedId);
            setRecommendations(results);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectChange = (e) => {
        const id = e.target.value;
        setSelectedId(id);
        onProductSelect(id);
    };

    const renderStars = (rating) => {
        return <span style={{ color: '#d4af37', fontSize: '0.8rem' }}>
            {'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}
        </span>;
    };

    return (
        <div className="demo-container glass animate-slideUp">
            <h3 className="gradient-text">Try Recommendation</h3>
            <div className="controls">
                <select
                    className="demo-select"
                    value={selectedId}
                    onChange={handleSelectChange}
                >
                    <option value="">Select a Piece</option>
                    {products.map(p => (
                        <option key={p.product_id} value={p.product_id}>
                            {p.product_id} - {p.product_name}
                        </option>
                    ))}
                </select>
                <button
                    className="demo-button"
                    onClick={handleRecommend}
                    disabled={loading}
                >
                    {loading ? 'Analyzing...' : 'Get Similar'}
                </button>
            </div>

            <div className="recommendations-grid">
                {recommendations.map((item, idx) => (
                    <div key={idx} className="product-card glass-strong">
                        <img
                            src={`/images/${item.product_id}.png`}
                            alt={item.product_name}
                            className="product-img-small"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'block';
                            }}
                        />
                        <div className="product-icon" style={{ display: 'none' }}>💎</div>
                        <h4 style={{ color: 'var(--color-gold)' }}>{item.product_name}</h4>
                        <div style={{ marginBottom: '8px' }}>
                            {renderStars(item.rating)}
                        </div>
                        <p className="price">₹{item.price?.toLocaleString()}</p>
                        <div className="attributes">
                            <span className="badge gem">{item.material}</span>
                            <span className="badge metal">{item.color}</span>
                        </div>
                        <small>Ref: {item.product_id}</small>
                    </div>
                ))}
                {!loading && recommendations.length === 0 && (
                    <p className="no-data">Select a product and click analyze to see recommendations.</p>
                )}
            </div>
        </div>
    );
};

export default RecommendationDemo;

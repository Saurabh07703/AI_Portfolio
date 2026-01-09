import React, { useEffect, useState } from 'react';
import { getRecommendations } from '../api';
import './ProductModal.css';

const ProductModal = ({ product, onClose, onProductSelect }) => {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (product) {
            fetchRecommendations();
            document.querySelector('.modal-content')?.scrollTo(0, 0);
        }
    }, [product]);

    const fetchRecommendations = async () => {
        setLoading(true);
        try {
            const data = await getRecommendations(product.product_id, 4);
            setRecommendations(data);
        } catch (error) {
            console.error("Failed to fetch recommendations", error);
        } finally {
            setLoading(false);
        }
    };

    if (!product) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content glass-strong" onClick={e => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>&times;</button>

                <div className="modal-body">
                    <div className="modal-product-detail">
                        <img
                            src={`/images/${product.product_id}.png`}
                            alt={product.product_name}
                            className="modal-main-img"
                            onError={(e) => e.target.style.display = 'none'}
                        />
                        <div className="modal-info">
                            <h2 className="gradient-text">{product.product_name}</h2>
                            <p className="sku-tag">{product.product_id}</p>
                            <div className="price-lg">₹{product.price?.toLocaleString()}</div>

                            <div className="modal-specs">
                                <div className="spec-item">
                                    <span>Material</span>
                                    <strong>{product.material}</strong>
                                </div>
                                <div className="spec-item">
                                    <span>Color</span>
                                    <strong>{product.color}</strong>
                                </div>
                                <div className="spec-item">
                                    <span>Occasion</span>
                                    <strong>{product.occasion}</strong>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="modal-recommendations">
                        <h3>Similar Styles You Might Love</h3>
                        {loading ? (
                            <div className="loading-sm">Finding matching pieces...</div>
                        ) : (
                            <div className="rec-grid">
                                {recommendations.map(item => (
                                    <div
                                        key={item.product_id}
                                        className="rec-card"
                                        onClick={() => onProductSelect && onProductSelect(item)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <img
                                            src={`/images/${item.product_id}.png`}
                                            alt={item.product_name}
                                            className="rec-img"
                                            onError={(e) => e.target.style.display = 'none'}
                                        />
                                        <div className="rec-info">
                                            <h4>{item.product_name}</h4>
                                            <p>₹{item.price?.toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                                {recommendations.length === 0 && !loading && (
                                    <p className="no-data">No similar items found.</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductModal;

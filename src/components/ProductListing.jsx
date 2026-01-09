import React, { useState, useEffect } from 'react';
import { getProducts } from '../api';
import './ProductListing.css';
import ProductModal from './ProductModal';

const ProductListing = () => {
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [allProducts, setAllProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        categories: [],
        metals: [],
        gems: [],
        colors: [],
        genders: [],
        occasions: []
    });

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                const data = await getProducts(100);
                setAllProducts(Array.isArray(data) ? data : []);
                setFilteredProducts(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Failed to fetch products:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    useEffect(() => {
        let result = allProducts;
        if (filters.categories.length > 0) result = result.filter(p => filters.categories.includes(p.category_code));
        if (filters.metals.length > 0) result = result.filter(p => filters.metals.includes(p.material));
        if (filters.gems.length > 0) result = result.filter(p => filters.gems.includes(p.gem));
        if (filters.colors.length > 0) result = result.filter(p => filters.colors.includes(p.color));
        if (filters.genders.length > 0) result = result.filter(p => filters.genders.includes(p.gender));
        if (filters.occasions.length > 0) result = result.filter(p => filters.occasions.includes(p.occasion));
        setFilteredProducts(result);
    }, [filters, allProducts]);

    const handleFilterToggle = (type, value) => {
        setFilters(prev => {
            const current = prev[type];
            const updated = current.includes(value)
                ? current.filter(i => i !== value)
                : [...current, value];
            return { ...prev, [type]: updated };
        });
    };

    const clearFilters = () => {
        setFilters({ categories: [], metals: [], gems: [], colors: [], genders: [], occasions: [] });
    };

    // Extract unique values for filters
    const uniqueCategories = [...new Set(allProducts.map(p => p.category_code))].filter(Boolean);
    const uniqueMetals = [...new Set(allProducts.map(p => p.material))].filter(Boolean);
    const uniqueGems = [...new Set(allProducts.map(p => p.gem))].filter(Boolean);
    const uniqueColors = [...new Set(allProducts.map(p => p.color))].filter(Boolean);
    const uniqueGenders = [...new Set(allProducts.map(p => p.gender))].filter(Boolean);
    const uniqueOccasions = [...new Set(allProducts.map(p => p.occasion))].filter(Boolean);

    if (loading) return <div className="loading">Initializing Catalog...</div>;

    const renderStars = (rating) => {
        const stars = [];
        for (let i = 0; i < 5; i++) {
            stars.push(<span key={i} style={{ color: i < Math.floor(rating) ? '#d4af37' : '#444' }}>★</span>);
        }
        return <div className="stars">{stars} <small>({rating})</small></div>;
    };

    return (
        <div className="catalog-page">
            <div className="breadcrumb">Home / Jewelry / <span>All Collections</span></div>

            <div className="catalog-header">
                <h3>Vogue Collections - <span>{filteredProducts.length} items</span></h3>
                <div className="sort-by">
                    Sort by : <strong>Trending Now</strong>
                </div>
            </div>

            <div className="catalog-layout">
                <aside className="sidebar">
                    <div className="filter-header">
                        <strong>FILTERS</strong>
                        <button onClick={clearFilters} className="clear-btn">CLEAR ALL</button>
                    </div>

                    <div className="filter-section">
                        <h4>MATERIAL</h4>
                        {uniqueMetals.map(m => (
                            <label key={m} className="filter-label">
                                <input type="checkbox" checked={filters.metals.includes(m)} onChange={() => handleFilterToggle('metals', m)} />
                                {m}
                            </label>
                        ))}
                    </div>

                    <div className="filter-section">
                        <h4>OCCASION</h4>
                        {uniqueOccasions.map(o => (
                            <label key={o} className="filter-label">
                                <input type="checkbox" checked={filters.occasions.includes(o)} onChange={() => handleFilterToggle('occasions', o)} />
                                {o}
                            </label>
                        ))}
                    </div>

                    <div className="filter-section">
                        <h4>COLOR</h4>
                        {uniqueColors.map(c => (
                            <label key={c} className="filter-label">
                                <input type="checkbox" checked={filters.colors.includes(c)} onChange={() => handleFilterToggle('colors', c)} />
                                {c}
                            </label>
                        ))}
                    </div>

                    <div className="filter-section">
                        <h4>GENDER</h4>
                        {uniqueGenders.map(g => (
                            <label key={g} className="filter-label">
                                <input type="checkbox" checked={filters.genders.includes(g)} onChange={() => handleFilterToggle('genders', g)} />
                                {g}
                            </label>
                        ))}
                    </div>
                </aside>

                <main className="product-feed">
                    <div className="active-chips">
                        {Object.entries(filters).flatMap(([type, values]) =>
                            values.map(val => (
                                <span key={val} className="filter-chip">
                                    {val} <button onClick={() => handleFilterToggle(type, val)}>&times;</button>
                                </span>
                            ))
                        )}
                    </div>

                    <div className="ecommerce-grid">
                        {filteredProducts.map(product => (
                            <div
                                key={product.product_id}
                                className="product-card-premium"
                                onClick={() => setSelectedProduct(product)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="product-img-wrapper">
                                    <img
                                        src={`/images/${product.product_id}.png`}
                                        alt={product.product_name}
                                        className="product-img"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'flex';
                                        }}
                                    />
                                    <div className="placeholder-img" style={{ display: 'none', color: product.color?.toLowerCase() }}>💎</div>
                                    <div className="wishlist-icon">♡</div>
                                    <div className="stock-label">{product.stock} left</div>
                                    <div className="view-similar-overlay">View Similar</div>
                                </div>
                                <div className="product-info-premium">
                                    <h4 className="brand-name">{product.product_id}</h4>
                                    <p className="prod-name">{product.product_name}</p>

                                    {renderStars(product.rating)}

                                    <div className="price-row" style={{ marginTop: '10px' }}>
                                        <span className="current-price">₹{product.price.toLocaleString()}</span>
                                        <span className="old-price">₹{(product.price * 1.4).toLocaleString()}</span>
                                    </div>

                                    <div className="product-tags">
                                        <span className="tag" style={{ border: '1px solid var(--color-gold)', color: 'var(--color-gold)' }}>{product.material}</span>
                                        <span className="tag">{product.category_code}</span>
                                        <span className="tag">{product.occasion}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
            </div>

            {selectedProduct && (
                <ProductModal
                    product={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                    onProductSelect={setSelectedProduct}
                />
            )}
        </div>
    );
};

export default ProductListing;

import React, { useState, useEffect } from 'react';
import { getForecast } from '../api';
import './Demo.css';

const ForecastDemo = ({ productId }) => {
    const [forecastData, setForecastData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchForecast = async () => {
            if (!productId) return;
            setLoading(true);
            try {
                const data = await getForecast(productId);
                setForecastData(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchForecast();
    }, [productId]);

    if (!productId) return (
        <div className="demo-container glass flex-center">
            <p className="no-data">Select a product in the recommendation demo to see its forecast.</p>
        </div>
    );

    const maxSales = Math.max(...forecastData.map(d => d.sales), 10);

    return (
        <div className="demo-container glass animate-slideUp">
            <div className="flex-between" style={{ marginBottom: '1rem' }}>
                <h3 className="gradient-text">Demand Forecast: {productId}</h3>
                <div className="chart-legend">
                    <div className="legend-item"><span className="legend-box history"></span> History</div>
                    <div className="legend-item"><span className="legend-box forecast"></span> Predictive</div>
                </div>
            </div>

            <div className="chart-outer-container">
                <div className="y-axis-labels">
                    {[1, 0.75, 0.5, 0.25, 0].map(p => (
                        <span key={p}>{Math.round(maxSales * p)}</span>
                    ))}
                </div>

                <div className="chart-wrapper">
                    <div className="chart-container">
                        {forecastData.map((d, i) => {
                            const isFirstForecast = d.type === 'forecast' && (i === 0 || forecastData[i - 1].type === 'history');
                            return (
                                <React.Fragment key={i}>
                                    {isFirstForecast && <div className="today-marker"></div>}
                                    <div className={`chart-bar-wrapper ${d.type}`}>
                                        <div
                                            className="chart-bar"
                                            style={{
                                                height: `${(d.sales / maxSales) * 100}%`,
                                                animationDelay: `${i * 0.05}s`
                                            }}
                                        ></div>
                                        <div className="tooltip">
                                            <span className="tooltip-date">{d.date}</span>
                                            <span className="tooltip-value">{d.sales} units</span>
                                        </div>
                                        <span className="chart-label">{d.date.split('-').slice(1).join('/')}</span>
                                    </div>
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>
            </div>

            <p className="chart-axis">Sales Timeline (Month/Year)</p>
        </div>
    );
};

export default ForecastDemo;

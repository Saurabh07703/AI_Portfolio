import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

export const getRecommendations = async (productId, n = 5) => {
    try {
        const response = await axios.get(`${API_URL}/recommend?product_id=${productId}&n=${n}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching recommendations", error);
        return [];
    }
};

export const getForecast = async (productId = null) => {
    try {
        const url = productId ? `${API_URL}/forecast?product_id=${productId}` : `${API_URL}/forecast`;
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error("Error fetching forecast", error);
        return [];
    }
};

export const getProducts = async (limit = 50) => {
    try {
        const response = await axios.get(`${API_URL}/products?limit=${limit}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching products", error);
        return [];
    }
};

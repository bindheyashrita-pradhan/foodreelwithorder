import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ReelFeed from '../../components/ReelFeed';

const Home = () => {
    const [foodItems, setFoodItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchFoodItems = async () => {
        try {
            setLoading(true);

            // Extract authentication token from localStorage
            let token = localStorage.getItem('token') || localStorage.getItem('userToken');
            if (!token) {
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    try { token = JSON.parse(storedUser).token; } catch (e) {}
                }
            }

            // Set Authorization header so backend returns isLiked status
            const headers = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const res = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/food`,
                { headers, withCredentials: true }
            );

            console.log("Fetched food items:", res.data);

            const items = res.data?.foodItems || res.data?.foods || res.data || [];
            setFoodItems(items);
        } catch (err) {
            console.error("Failed to fetch food reels:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFoodItems();
    }, []);

    if (loading) {
        return (
            <div style={{ 
                minHeight: '100vh', 
                backgroundColor: '#000000', 
                color: '#ffffff', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontFamily: 'system-ui, sans-serif'
            }}>
                <p style={{ fontSize: '16px', color: '#a1a1aa' }}>Loading food reels...</p>
            </div>
        );
    }

    return (
        <ReelFeed items={foodItems} emptyMessage="No food reels available right now." />
    );
};

export default Home;
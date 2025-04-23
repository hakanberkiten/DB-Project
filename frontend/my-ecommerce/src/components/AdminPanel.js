import React, { useState } from 'react';
import axios from 'axios';
import './AdminPanel.css';

const AdminPanel = () => {
    const [productId, setProductId] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [stockData, setStockData] = useState({ product_item_id: '', quantity: '' });
    const [cardData, setCardData] = useState({
        user_id: '', cardHolderName: '', cardType: '',
        cardNumber: '', expirationMonth: '', expirationYear: '', cvv: ''
    });

    const [userResults, setUserResults] = useState([]);
    const [priceStats, setPriceStats] = useState(null);
    const [resultMsg, setResultMsg] = useState('');
    const [error, setError] = useState('');
    const [stockMessage, setStockMessage] = useState('');
    const [stockError, setStockError] = useState('');

    const fetchUsers = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/admin/users-by-product/${productId}`);
            setUserResults(res.data);
            setError('');
        } catch {
            setError('Failed to fetch users.');
            setUserResults([]);
        }
    };

    const fetchPriceStats = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/admin/category-price-stats/${categoryId}`);
            setPriceStats(res.data);
            setError('');
        } catch {
            setError('Failed to fetch stats.');
            setPriceStats(null);
        }
    };

    const simulateStockUpdate = async () => {
        try {
            await axios.post('http://localhost:5000/api/admin/update-stock', {
                product_item_id: stockData.product_item_id,
                quantity: parseInt(stockData.quantity),
            });
            setStockMessage('✅ Stock updated successfully!');
            setStockError('');
        } catch {
            setStockError('❌ Failed to update stock.');
            setStockMessage('');
        }
    };


    const addCardToUser = async () => {
        try {
            await axios.post('http://localhost:5000/api/admin/add-card', cardData);
            setResultMsg('Card added successfully!');
            setError('');
        } catch {
            setError('Failed to add card.');
            setResultMsg('');
        }
    };

    const deleteProduct = async () => {
        try {
            await axios.delete(`http://localhost:5000/api/admin/delete-product/${productId}`);
            setResultMsg('Product deleted successfully!');
            setError('');
        } catch {
            setError('Failed to delete product.');
            setResultMsg('');
        }
    };

    return (
        <div className="admin-panel-container">
            <h2>🛠 Admin Panel</h2>

            {/* USERS BY PRODUCT */}
            <div className="admin-section">
                <h4>1. Users who ordered a product</h4>
                <input type="text" placeholder="Product ID" value={productId} onChange={e => setProductId(e.target.value)} />
                <button onClick={fetchUsers}>Fetch Users</button>
                {userResults.length > 0 && (
                    <ul className="response-list">
                        {userResults.map((u, i) => (
                            <li key={i}><strong>{u.Username}</strong> ({u.Email}) - Order ID: {u.OrderID}</li>
                        ))}
                    </ul>
                )}
            </div>

            {/* PRICE STATS */}
            <div className="admin-section">
                <h4>2. Price stats for category</h4>
                <input type="text" placeholder="Category ID" value={categoryId} onChange={e => setCategoryId(e.target.value)} />
                <button onClick={fetchPriceStats}>Fetch Stats</button>
                {priceStats && (
                    <ul className="response-list">
                        <li>Minimum Price: ${priceStats.min_price}</li>
                        <li>Maximum Price: ${priceStats.max_price}</li>
                        <li>Average Price: ${priceStats.avg_price}</li>
                    </ul>
                )}
            </div>

            {/* SIMULATE STOCK */}
            <div className="admin-section">
                <h4>3. Update stock</h4>
                <input type="text" placeholder="Product Item ID" value={stockData.product_item_id} onChange={e => setStockData({ ...stockData, product_item_id: e.target.value })} />
                <input type="number" placeholder="New Quantity" value={stockData.quantity} onChange={e => setStockData({ ...stockData, quantity: e.target.value })} />
                <button onClick={simulateStockUpdate}>Update Stock</button>
                {stockMessage && <p className="success-msg">{stockMessage}</p>}
                {stockError && <p className="error-msg">{stockError}</p>}
            </div>


            {/* ADD CARD */}
            <div className="admin-section">
                <h4>4. Add card to user</h4>
                {Object.entries(cardData).map(([key, value]) => (
                    <input
                        key={key}
                        type="text"
                        placeholder={key.replace(/([A-Z])/g, ' $1')}
                        value={value}
                        onChange={e => setCardData({ ...cardData, [key]: e.target.value })}
                    />
                ))}
                <button onClick={addCardToUser}>Add Card</button>
            </div>

            {/* DELETE PRODUCT */}
            <div className="admin-section">
                <h4>5. Delete product from system</h4>
                <input type="text" placeholder="Product ID" value={productId} onChange={e => setProductId(e.target.value)} />
                <button onClick={deleteProduct}>Delete Product</button>
            </div>

            {resultMsg && <div className="success-msg">{resultMsg}</div>}
            {error && <div className="error-msg">{error}</div>}
        </div>
    );
};

export default AdminPanel;

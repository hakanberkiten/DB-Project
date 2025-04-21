// src/components/Cart.js
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CartContext } from '../contexts/CartContext';

const Cart = () => {
  const { cartItems, setCartItems } = useContext(CartContext);
  const navigate = useNavigate();

  // 🧮 Sepet toplamı hesapla
  const totalAmount = cartItems.reduce(
    (sum, item) => sum + parseFloat(item.Price ?? 0) * (item.quantity ?? 1),
    0
  );

  // ✅ Siparişi tamamla
  const handleCheckout = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      alert("Please login.");
      navigate('/login');
      return;
    }

    try {
      const res = await axios.get(`http://localhost:5000/api/userdata/${user.user_id}`);
      const { hasAddress, hasCard } = res.data;

      if (!hasAddress || !hasCard) {
        alert("Please enter your address and card information first.");
        navigate('/profile');
        return;
      }

      const cart_items = cartItems.map(item => ({
        product_item_id: item.product_item_id,
        quantity: item.quantity ?? 1
      }));

      const orderRes = await axios.post('http://localhost:5000/api/orders', {
        user_id: user.user_id,
        address_id: 1,
        payment_method: 'CreditCard',
        total_amount: totalAmount,
        cart_items
      });

      alert(`Order completed! Order No: ${orderRes.data.order_id}`);
      setCartItems([]);
      navigate('/');
    } catch (err) {
      console.error("Order error:", err);
      alert("An error occurred while creating the order.");
    }
  };


  return (
    <div style={{ padding: '20px' }}>
      <h2>Your Cart</h2>
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          {cartItems.map((item, index) => (
            <div
              key={index}
              style={{ borderBottom: '1px solid #ccc', padding: '10px 0' }}
            >
              <h4>{item.name}</h4>
              <p>Price: ${parseFloat(item.Price ?? 0).toFixed(2)}</p>
              <p>Quantity: {item.quantity ?? 1}</p>
            </div>
          ))}
          <h3>Total: ${totalAmount.toFixed(2)}</h3>
          <button onClick={handleCheckout}>Complete Purchase</button>
        </>
      )}
    </div>
  );
};

export default Cart;

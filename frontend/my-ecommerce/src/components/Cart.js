import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CartContext } from '../contexts/CartContext';
import './Cart.css';

const Cart = () => {
  const { cartItems, setCartItems } = useContext(CartContext);
  const navigate = useNavigate();

  // Calculate total amount
  const totalAmount = cartItems.reduce(
    (sum, item) => sum + parseFloat(item.Price ?? 0) * (item.quantity ?? 1),
    0
  );

  // Update quantity of an item
  const updateQuantity = (index, newQuantity) => {
    if (newQuantity < 1) return;

    const newCartItems = [...cartItems];
    newCartItems[index].quantity = newQuantity;
    setCartItems(newCartItems);
  };

  // Remove item from cart
  const removeItem = (index) => {
    const newCartItems = [...cartItems];
    newCartItems.splice(index, 1);
    setCartItems(newCartItems);
  };

  // Checkout process
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
    <div className="cart-container">
      <h2 className="cart-title">Your Cart</h2>

      {cartItems.length === 0 ? (
        <p className="empty-cart-message">Your cart is empty.</p>
      ) : (
        <>
          <div className="cart-items">
            {cartItems.map((item, index) => (
              <div key={index} className="cart-item">
                <img
                  src={item.image || 'https://via.placeholder.com/100'}
                  alt={item.name}
                  className="cart-item-image"
                />


                <div className="cart-item-details">
                  <h4 className="cart-item-name">{item.name}</h4>
                  <p className="cart-item-price">${parseFloat(item.Price ?? 0).toFixed(2)}</p>

                  <div className="cart-item-actions">
                    <div className="quantity-control">
                      <button
                        className="quantity-btn"
                        onClick={() => updateQuantity(index, (item.quantity ?? 1) - 1)}
                      >
                        -
                      </button>
                      <span className="quantity-input">{item.quantity ?? 1}</span>
                      <button
                        className="quantity-btn"
                        onClick={() => updateQuantity(index, (item.quantity ?? 1) + 1)}
                      >
                        +
                      </button>
                    </div>
                    <button
                      className="remove-btn"
                      onClick={() => removeItem(index)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="subtotal">
              <span>Subtotal:</span>
              <span>${totalAmount.toFixed(2)}</span>
            </div>
            <div className="total">
              <span>Total:</span>
              <span>${totalAmount.toFixed(2)}</span>
            </div>
            <button className="checkout-btn" onClick={handleCheckout}>
              Complete Purchase
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
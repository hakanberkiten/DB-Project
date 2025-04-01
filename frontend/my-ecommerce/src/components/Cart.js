import React, { useContext } from 'react';
import { CartContext } from '../contexts/CartContext';

const Cart = () => {
  const { cartItems } = useContext(CartContext);

  const totalPrice = cartItems.reduce((sum, item) => sum + parseFloat(item.price), 0);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Your Cart</h2>
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div>
          {cartItems.map((item, index) => (
            <div key={index} style={{ border: '1px solid #ddd', padding: '10px', marginBottom: '10px' }}>
              <h3>{item.name}</h3>
              <p>Price: ${item.price}</p>
              <p>Discount: {item.discount}</p>
              {item.image && (
                <img src={item.image} alt={item.name} style={{ width: '100px' }} />
              )}
            </div>
          ))}
          <h3>Total: ${totalPrice.toFixed(2)}</h3>
        </div>
      )}
    </div>
  );
};

export default Cart;
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import './ProductList.css';
import { CartContext } from '../contexts/CartContext';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [filterText, setFilterText] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);

  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/api/products');
      setProducts(response.data);
      setFilteredProducts(response.data);
    } catch (error) {
      console.error("Error retrieving products:", error);
    }
  };

  const handleFilter = () => {
    const filtered = products.filter(product => {
      const matchesText = product.name.toLowerCase().includes(filterText.toLowerCase());
      const price = parseFloat(product.price);
      const minValid = minPrice === '' || price >= parseFloat(minPrice);
      const maxValid = maxPrice === '' || price <= parseFloat(maxPrice);
      return matchesText && minValid && maxValid;
    });
    setFilteredProducts(filtered);
  };

  return (
    <div className="product-list-container">
      <h2>Products</h2>
      <div className="filters">
        <input
          type="text"
          placeholder="Search products..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        />
        <input
          type="number"
          placeholder="Min Price"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
        />
        <input
          type="number"
          placeholder="Max Price"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />
        <button onClick={handleFilter}>Filter</button>
      </div>
      <div className="products-grid">
        {filteredProducts.map(product => (
          <div className="product-card" key={product.id}>
            <h3>{product.name}</h3>
            <p>Price: ${product.price}</p>
            <p>Discount: {product.discount}</p>
            {product.image && (
              <img src={product.image} alt={product.name} />
            )}
            <button onClick={() => addToCart(product)}>Add to Cart</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;
// src/components/ProductList.js
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import './ProductList.css';
import { CartContext } from '../contexts/CartContext';
import { Link } from 'react-router-dom';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const { addToCart } = useContext(CartContext);
  const [search, setSearch] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const fetchProducts = async (category = '') => {
    try {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (search) params.append('search', search);
      if (minPrice) params.append('min_price', minPrice);
      if (maxPrice) params.append('max_price', maxPrice);

      const res = await axios.get(`http://localhost:5000/api/products?${params.toString()}`);
      console.log("Fetched products:", res.data);

      setProducts(res.data);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleCategoryChange = (e) => {
    const selected = e.target.value;
    setSelectedCategory(selected);
    fetchProducts(selected);
  };

  return (
    <div className="product-list-container">
      <h2>Products</h2>

      <div className="filters">
        <select value={selectedCategory} onChange={handleCategoryChange}>
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Search (name)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
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
        <button onClick={() => fetchProducts(selectedCategory)}>Filter</button>
      </div>

      <div className="products-grid">
        {products.map((product) => (
          <div className="product-card" key={product.product_item_id}>
            <Link to={`/product/${product.id}`}>
              <h3>{product.name}</h3>
            </Link>
            <p>Price: ${parseFloat(product.Price).toFixed(2)}</p>
            {product.image && (
              <img
                src={product.image}
                alt={product.name}
                style={{ width: '120px', height: 'auto' }}
              />
            )}
            <button onClick={() => addToCart({
              ...product,
              image: product.image || product.ProductImage  // garanti
            })}>
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;

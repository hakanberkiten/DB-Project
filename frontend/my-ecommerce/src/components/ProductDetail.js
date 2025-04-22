import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const ProductDetail = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);

    useEffect(() => {
        axios.get(`http://localhost:5000/api/products/${id}`)
            .then(res => setProduct(res.data))
            .catch(err => console.error("Error fetching product details:", err));
    }, [id]);

    if (!product) return <p>Loading...</p>;
    const genderMap = {
        0: "Unisex",
        1: "Male",
        2: "Female"
    };

    // JSX içinde

    return (
        <div style={{ padding: '2rem' }}>
            <h2>{product.name}</h2>
            <img src={product.image} alt={product.name} width="200" /><br />
            <p><strong>Description:</strong> {product.description}</p>
            <p><strong>Price:</strong> ${parseFloat(product.price).toFixed(2)}</p>
            <p>
                <strong>Gender:</strong>{" "}
                {{
                    0: "Unisex",
                    1: "Male",
                    2: "Female"
                }[parseInt(product.Gender)] || "Unknown"}
            </p>

        </div>
    );
};

export default ProductDetail;

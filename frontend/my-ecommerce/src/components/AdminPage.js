import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';


const AdminPage = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));

    useEffect(() => {
        if (!user || user.role !== "Admin") {
            navigate('/');
        }
    }, [user]);
    return (
        <div style={{ padding: '2rem' }}>
            <h2>Admin Panel</h2>
            <ul>
                <li><button>List customers per product</button></li>
                <li><button>Show category price stats</button></li>
                <li><button>Order product & change stock</button></li>
                <li><button>Add card for customer</button></li>
                <li><button>Remove product from system & carts</button></li>
            </ul>
        </div>
    );
};

export default AdminPage;

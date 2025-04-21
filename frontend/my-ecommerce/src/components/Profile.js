import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Profile = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const [address, setAddress] = useState({
        addressLine: '',
        city: '',
        postalCode: ''
    });
    const [card, setCard] = useState({
        cardHolderName: '',
        cardNumber: '',
        expirationMonth: '',
        expirationYear: ''
    });

    const [editMode, setEditMode] = useState(false);

    useEffect(() => {
        if (user) {
            fetchProfileData();
        }
    }, []);

    const fetchProfileData = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/profile/${user.user_id}`);
            if (res.data) {
                if (res.data.address) {
                    setAddress({
                        addressLine: res.data.address.AddressLine || '',
                        city: res.data.address.City || '',
                        postalCode: res.data.address.PostalCode || ''
                    });
                }
                if (res.data.card) {
                    setCard({
                        cardHolderName: res.data.card.CardHolderName || '',
                        cardNumber: res.data.card.CardNumber || '',
                        expirationMonth: res.data.card.ExpirationMonth || '',
                        expirationYear: res.data.card.ExpirationYear || ''
                    });
                }
            }
        } catch (err) {
            console.error('Failed to fetch profile data:', err);
        }
    };

    const handleSave = async () => {
        try {
            await axios.post(`http://localhost:5000/api/profile`, {
                user_id: user.user_id,
                address,
                card
            });
            alert('Information updated successfully');
            setEditMode(false);
        } catch (err) {
            console.error('Save error:', err);
            alert('Failed to save information');
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Your Profile Information</h2>

            <h3>Address Information</h3>
            <input
                type="text"
                placeholder="Address"
                value={address.addressLine}
                onChange={(e) => setAddress({ ...address, addressLine: e.target.value })}
                disabled={!editMode}
            />
            <input
                type="text"
                placeholder="City"
                value={address.city}
                onChange={(e) => setAddress({ ...address, city: e.target.value })}
                disabled={!editMode}
            />
            <input
                type="text"
                placeholder="Postal Code"
                value={address.postalCode}
                onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                disabled={!editMode}
            />

            <h3>Card Information</h3>
            <input
                type="text"
                placeholder="Card Holder Name"
                value={card.cardHolderName}
                onChange={(e) => setCard({ ...card, cardHolderName: e.target.value })}
                disabled={!editMode}
            />
            <input
                type="text"
                placeholder="Card Number"
                value={card.cardNumber}
                onChange={(e) => setCard({ ...card, cardNumber: e.target.value })}
                disabled={!editMode}
            />
            <input
                type="text"
                placeholder="Month"
                value={card.expirationMonth}
                onChange={(e) => setCard({ ...card, expirationMonth: e.target.value })}
                disabled={!editMode}
            />
            <input
                type="text"
                placeholder="Year"
                value={card.expirationYear}
                onChange={(e) => setCard({ ...card, expirationYear: e.target.value })}
                disabled={!editMode}
            />

            <div style={{ marginTop: '20px' }}>
                {!editMode ? (
                    <button onClick={() => setEditMode(true)}>Edit</button>
                ) : (
                    <button onClick={handleSave}>Save</button>
                )}
            </div>
        </div>
    );
};

export default Profile;

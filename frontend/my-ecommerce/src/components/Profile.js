import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Profile = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const [editMode, setEditMode] = useState(false);

    const [address, setAddress] = useState({
        addressLine: '',
        city: '',
        postalCode: ''
    });

    const [card, setCard] = useState({
        cardHolderName: '',
        cardType: '',
        cardNumber: '',
        expirationMonth: '',
        expirationYear: '',
        cvv: ''
    });

    useEffect(() => {
        if (user) {
            fetchProfile();
        }
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/profile/${user.user_id}`);
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
                    cardType: res.data.card.CardType || '',
                    cardNumber: res.data.card.CardNumber || '',
                    expirationMonth: res.data.card.ExpirationMonth || '',
                    expirationYear: res.data.card.ExpirationYear || '',
                    cvv: res.data.card.CVV || ''
                });
            }
        } catch (err) {
            console.error("Profile does not showed up", err);
        }
    };

    const handleSave = async () => {
        try {
            await axios.post('http://localhost:5000/api/profile', {
                user_id: user.user_id,
                address,
                card
            });
            alert("Profile updated");
            setEditMode(false);
        } catch (err) {
            console.error("Saving error:", err);
            alert("Profile could not update");
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Profile Information</h2>

            <h3>Address Information</h3>
            <input type="text" value={address.addressLine} placeholder="Address"
                onChange={(e) => setAddress({ ...address, addressLine: e.target.value })} disabled={!editMode} />
            <input type="text" value={address.city} placeholder="City"
                onChange={(e) => setAddress({ ...address, city: e.target.value })} disabled={!editMode} />
            <input type="text" value={address.postalCode} placeholder="Postal Code"
                onChange={(e) => setAddress({ ...address, postalCode: e.target.value })} disabled={!editMode} />

            <h3>Card Information</h3>
            <input type="text" value={card.cardHolderName} placeholder="Card Holder Name"
                onChange={(e) => setCard({ ...card, cardHolderName: e.target.value })} disabled={!editMode} />
            <input type="text" value={card.cardType} placeholder="Card Type (VISA/MASTER)"
                onChange={(e) => setCard({ ...card, cardType: e.target.value })} disabled={!editMode} />
            <input type="text" value={card.cardNumber} placeholder="Card Number"
                onChange={(e) => setCard({ ...card, cardNumber: e.target.value })} disabled={!editMode} />
            <input type="text" value={card.expirationMonth} placeholder="Month"
                onChange={(e) => setCard({ ...card, expirationMonth: e.target.value })} disabled={!editMode} />
            <input type="text" value={card.expirationYear} placeholder="Year"
                onChange={(e) => setCard({ ...card, expirationYear: e.target.value })} disabled={!editMode} />
            <input type="text" value={card.cvv} placeholder="CVV"
                onChange={(e) => setCard({ ...card, cvv: e.target.value })} disabled={!editMode} />

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

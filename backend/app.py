from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
from werkzeug.security import generate_password_hash
from datetime import datetime
from werkzeug.security import check_password_hash

app = Flask(__name__)
CORS(app)

# --- MySQL Config ---
db_config = {
    'host': '127.0.0.1',
    'port': 3305,
    'database': 'mydb',
    'user': 'root',
    'password': '123456'
}


def get_db_connection():
    try:
        connection = mysql.connector.connect(**db_config)
        if connection.is_connected():
            return connection
    except Error as e:
        print("MySQL bağlantı hatası:", e)
    return None

# --- ROUTES ---

@app.route('/')
def home():
    return jsonify({'message': 'API is running'})
@app.route('/api/products', methods=['GET'])
def get_products():
    category = request.args.get('category')
    search = request.args.get('search')
    min_price = request.args.get('min_price')
    max_price = request.args.get('max_price')

    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Veritabanına bağlanılamadı"}), 500

    cursor = connection.cursor(dictionary=True)

    query = """
        SELECT 
            pi.ProductItemID AS product_item_id,
            p.ProductID AS id,
            p.ProductName AS name,
            p.Price,
            p.ProductImage AS image
        FROM productitem pi
        JOIN product p ON pi.ProductID = p.ProductID
        WHERE 1=1
    """
    params = []

    if category:
        query += " AND p.CategoryID = %s"
        params.append(category)

    if search:
        query += " AND p.ProductName LIKE %s"
        params.append(f"%{search}%")

    if min_price:
        query += " AND p.Price >= %s"
        params.append(min_price)

    if max_price:
        query += " AND p.Price <= %s"
        params.append(max_price)

    cursor.execute(query, tuple(params))
    products = cursor.fetchall()
    cursor.close()
    connection.close()
    return jsonify(products)


# Adres kaydetme
@app.route('/api/profile/address', methods=['POST'])
def save_address():
    data = request.json
    cur = get_db_connection().cursor()
    cur.execute("""
        INSERT INTO address (UserID, AddressLine, City, State, PostalCode, Country, AddressType)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
    """, (data['user_id'], data['addressLine'], data['city'], data['state'], data['postalCode'], data['country'], data['addressType']))
    get_db_connection().commit()
    return jsonify({"message": "Adres kaydedildi"}), 201

# Kart kaydetme
@app.route('/api/profile/card', methods=['POST'])
def save_card():
    card = request.json
    cursor = get_db_connection().cursor()
    # Kart güncelle/ekle
    cursor.execute("SELECT * FROM cardinfo WHERE UserID = %s",)
    if cursor.fetchone():
        cursor.execute("""
            UPDATE cardinfo SET CardHolderName=%s, CardNumber=%s, ExpirationMonth=%s, ExpirationYear=%s, CVV=%s
            WHERE UserID=%s
        """, (
            card['cardHolderName'], 
            card['cardNumber'], 
            card['expirationMonth'], 
            card['expirationYear'], 
            card.get('CVV', 0),  # <--- burada CVV'yi garanti altına al
        ))
    else:
        cursor.execute("""
            INSERT INTO cardinfo (UserID, CardHolderName, CardNumber, ExpirationMonth, ExpirationYear, CVV)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            card['cardHolderName'], 
            card['cardNumber'], 
            card['expirationMonth'], 
            card['expirationYear'], 
            card.get('CVV', 0)  # <--- burada da CVV'yi 0 olarak ekle
        ))

        return jsonify({"message": "Kart kaydedildi"}), 201

@app.route('/api/userdata/<int:user_id>', methods=['GET'])
def get_user_data(user_id):
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Veritabanına bağlanılamadı"}), 500

    cursor = connection.cursor(dictionary=True)

    # Adres var mı?
    cursor.execute("SELECT COUNT(*) as count FROM address WHERE UserID = %s", (user_id,))
    address_result = cursor.fetchone()

    # Kart var mı?
    cursor.execute("SELECT COUNT(*) as count FROM cardinfo WHERE UserID = %s", (user_id,))
    card_result = cursor.fetchone()

    cursor.close()
    connection.close()

    return jsonify({
        "hasAddress": address_result['count'] > 0,
        "hasCard": card_result['count'] > 0
    })
# Profil bilgilerini kaydet/güncelle
@app.route('/api/profile', methods=['POST'])
def update_profile():
    data = request.json
    user_id = data.get("user_id")
    address = data.get("address")
    card = data.get("card")

    conn = get_db_connection()
    cursor = conn.cursor()

    # Adres kontrol
    cursor.execute("SELECT * FROM address WHERE UserID = %s", (user_id,))
    if cursor.fetchone():
        cursor.execute("""
            UPDATE address SET AddressLine=%s, City=%s, PostalCode=%s
            WHERE UserID=%s
        """, (address['addressLine'], address['city'], address['postalCode'], user_id))
    else:
        cursor.execute("""
            INSERT INTO address (UserID, AddressLine, City, PostalCode)
            VALUES (%s, %s, %s, %s)
        """, (user_id, address['addressLine'], address['city'], address['postalCode']))

    # Kart kontrol
    cursor.execute("SELECT * FROM cardinfo WHERE UserID = %s", (user_id,))
    if cursor.fetchone():
        cursor.execute("""
            UPDATE cardinfo SET CardHolderName=%s, CardType=%s, CardNumber=%s,
            ExpirationMonth=%s, ExpirationYear=%s, CVV=%s
            WHERE UserID=%s
        """, (
            card['cardHolderName'], card['cardType'], card['cardNumber'],
            card['expirationMonth'], card['expirationYear'], card.get('cvv', 0), user_id
        ))
    else:
        cursor.execute("""
            INSERT INTO cardinfo (UserID, CardHolderName, CardType, CardNumber, 
            ExpirationMonth, ExpirationYear, CVV)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (
            user_id, card['cardHolderName'], card['cardType'], card['cardNumber'],
            card['expirationMonth'], card['expirationYear'], card.get('cvv', 0)
        ))

    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "Profil bilgileri güncellendi"})

@app.route('/api/profile/<int:user_id>', methods=['POST'])
def save_profile(user_id):
    data = request.json
    
    address = data.get("address")
    card = data.get("card")

    if not address or not card:
        return jsonify({"error": "Eksik bilgi gönderildi."}), 400

    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "Veritabanına bağlanılamadı."}), 500

    cursor = conn.cursor()

    try:
        # 1. Adres kaydet
        cursor.execute("""
            INSERT INTO address (UserID, AddressLine, City, State, PostalCode, Country, AddressType)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (
            user_id,
            address.get("addressLine"),
            address.get("city"),
            address.get("state"),
            address.get("postalCode"),
            address.get("country"),
            address.get("addressType")
        ))

        # 2. Kart bilgisi kaydet
        cursor.execute("""
            INSERT INTO cardinfo (UserID, CardHolderName, CardType, CardNumber, ExpirationMonth, ExpirationYear, CVV)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (
            user_id,
            card.get("cardHolderName"),
            card.get("cardType"),
            card.get("cardNumber"),
            card.get("expirationMonth"),
            card.get("expirationYear"),
            card.get("cvv")
        ))

        conn.commit()
        return jsonify({"message": "Profil başarıyla kaydedildi!"}), 201

    except mysql.connector.Error as e:
        conn.rollback()
        print("Hata:", e)
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "Kullanıcı adı ve şifre gerekli"}), 400

    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Veritabanı bağlantısı sağlanamadı"}), 500

    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT * FROM user WHERE Username = %s", (username,))
    user = cursor.fetchone()
    cursor.close()
    connection.close()

    if not user or not check_password_hash(user['Password'], password):
        return jsonify({"error": "Geçersiz kullanıcı adı veya şifre"}), 401

    return jsonify({
        "message": "Giriş başarılı",
        "user_id": user['UserID'],
        "username": user['Username'],
        "role": user['UserRole']
    }), 200
    
    
@app.route('/api/profile/<int:user_id>', methods=['GET'])
def get_profile(user_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM address WHERE UserID = %s LIMIT 1", (user_id,))
    address = cursor.fetchone()

    cursor.execute("SELECT * FROM cardinfo WHERE UserID = %s LIMIT 1", (user_id,))
    card = cursor.fetchone()

    cursor.close()
    conn.close()

    return jsonify({"address": address, "card": card})


# ✅ GET One Product by ID
@app.route('/api/products/<int:product_id>', methods=['GET'])
def get_product_detail(product_id):
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Veritabanına bağlanılamadı"}), 500

    cursor = connection.cursor(dictionary=True)
    cursor.execute("""
        SELECT ProductID AS id,
               ProductName AS name,
               ProductDescription AS description,
               Price AS price,
               Gender,
               Discount,
               ProductImage AS image
        FROM product
        WHERE ProductID = %s
    """, (product_id,))
    product = cursor.fetchone()
    cursor.close()
    connection.close()

    if not product:
        return jsonify({"error": "Ürün bulunamadı"}), 404

    return jsonify(product)


@app.route('/api/orders', methods=['POST'])
def create_order():
    data = request.json
    user_id        = data.get('user_id')
    address_id     = data.get('address_id')
    payment_method = data.get('payment_method')
    total_amount   = data.get('total_amount')
    cart_items     = data.get('cart_items', [])

    if not all([user_id, address_id, payment_method, total_amount, cart_items]):
        return jsonify({"error": "Eksik sipariş verisi"}), 400

    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "Veritabanına bağlanılamadı"}), 500

    cur = conn.cursor()

    try:
        # 1) order tablosuna ekle
        cur.execute("""
            INSERT INTO `order` (UserID, OrderDate, AddressID, PaymentMethod, Status, TotalAmount)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            user_id,
            datetime.now(),
            address_id,
            payment_method,
            "Pending",
            total_amount
        ))

        order_id = cur.lastrowid

        # 2) orderitem tablosuna ekle
        for item in cart_items:
            cur.execute("""
                INSERT INTO orderitem (OrderID, ProductItemID, Quantity)
                VALUES (%s, %s, %s)
            """, (
                order_id,
                item['product_item_id'],   # dikkat: frontend bu key ile göndermeli
                item['quantity']
            ))

        conn.commit()
        return jsonify({"message": "Sipariş tamamlandı", "order_id": order_id}), 201

    except Error as e:
        conn.rollback()
        print("Sipariş hatası:", e)
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()
        conn.close()


@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.json
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    phone = data.get('phone')

    if not all([username, email, password]):
        return jsonify({'error': 'Eksik alanlar var'}), 400

    connection = get_db_connection()
    if connection is None:
        return jsonify({'error': 'Veritabanına bağlanılamadı'}), 500

    cursor = connection.cursor()

    # Check if user exists
    cursor.execute("SELECT * FROM user WHERE Username = %s OR Email = %s", (username, email))
    if cursor.fetchone():
        return jsonify({'error': 'Bu kullanıcı adı veya email zaten mevcut'}), 409

    hashed_password = generate_password_hash(password)

    cursor.execute("""
        INSERT INTO user (Username, Email, Password, PhoneNumber, UserRole, CreatedAt)
        VALUES (%s, %s, %s, %s, %s, %s)
    """, (username, email, hashed_password, phone, "Customer", datetime.now()))

    connection.commit()
    cursor.close()
    connection.close()

    return jsonify({'message': 'Kayıt başarılı!'}), 201
# ✅ GET Cart by User ID
@app.route('/api/cart/<int:user_id>', methods=['GET'])
def get_cart(user_id):
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Veritabanına bağlanılamadı"}), 500

    cursor = connection.cursor(dictionary=True)
    query = """
        SELECT p.ProductID AS id, p.ProductName AS name, p.Price, p.Discount, p.ProductImage AS image,
               ci.Quantity
        FROM cartitem ci
        JOIN shoppingcart sc ON ci.CartID = sc.CartID
        JOIN productitem pi ON ci.ProductItemID = pi.ProductItemID
        JOIN product p ON pi.ProductID = p.ProductID
        WHERE sc.UserID = %s
    """
    cursor.execute(query, (user_id,))
    items = cursor.fetchall()
    cursor.close()
    connection.close()
    return jsonify(items)


# ✅ Add Item to Cart
@app.route('/api/cart', methods=['POST'])
def add_to_cart():
    data = request.json
    user_id = data.get('user_id')
    product_item_id = data.get('product_item_id')
    quantity = data.get('quantity', 1)

    if not user_id or not product_item_id:
        return jsonify({"error": "Eksik veri gönderildi"}), 400

    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Veritabanına bağlanılamadı"}), 500

    cursor = connection.cursor()

    # Get or create cart
    cursor.execute("SELECT CartID FROM shoppingcart WHERE UserID = %s", (user_id,))
    result = cursor.fetchone()
    if result:
        cart_id = result[0]
    else:
        cursor.execute("INSERT INTO shoppingcart (UserID) VALUES (%s)", (user_id,))
        cart_id = cursor.lastrowid

    # Add product to cart
    cursor.execute("""
        INSERT INTO cartitem (CartID, ProductItemID, Quantity)
        VALUES (%s, %s, %s)
        ON DUPLICATE KEY UPDATE Quantity = Quantity + %s
    """, (cart_id, product_item_id, quantity, quantity))

    connection.commit()
    cursor.close()
    connection.close()

    return jsonify({"message": "Ürün sepete eklendi"}), 201


# ✅ Get All Categories
@app.route('/api/categories', methods=['GET'])
def get_categories():
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Veritabanına bağlanılamadı"}), 500

    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT CategoryID AS id, CategoryName AS name FROM category")
    categories = cursor.fetchall()
    cursor.close()
    connection.close()
    return jsonify(categories)


# ✅ Run Server
if __name__ == '__main__':
    app.run(debug=True)

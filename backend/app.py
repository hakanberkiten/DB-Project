# app.py
from flask import Flask, jsonify
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error

app = Flask(__name__)
CORS(app)

db_config = {
    'host': '127.0.0.1',
    'port': 3305,            # Kendi port numaranızı kullanın
    'database': 'mydb',
    'user': 'root',
    'password': '123456'
}

def get_db_connection():
    """
    Veritabanına bağlanır ve bağlantıyı döndürür.
    Bağlantı sağlanamazsa None döner.
    """
    try:
        connection = mysql.connector.connect(**db_config)
        if connection.is_connected():
            print("Connection successful")
            return connection
    except Error as e:
        print("MySQL bağlantı hatası:", e)
    return None

@app.route('/')
def home():
    return "Hello, World!"

@app.route('/api/products', methods=['GET'])
def get_products():
    """
    MySQL veritabanındaki 'product' tablosundan ürünleri çekip JSON formatında döndürür.
    """
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Veritabanına bağlanılamadı"}), 500

    cursor = connection.cursor(dictionary=True)
    query = """
    SELECT
        ProductID as id,
        ProductName as name,
        Price as price,
        Discount as discount,
        ProductImage as image
    FROM product
    """
    cursor.execute(query)
    rows = cursor.fetchall()
    cursor.close()
    connection.close()

    return jsonify(rows)

if __name__ == '__main__':
    app.run(debug=True)

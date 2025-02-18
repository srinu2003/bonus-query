from flask import Flask, request, jsonify
import mysql.connector
from mysql.connector import Error
from flask_cors import CORS
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)


def create_connection():
    connection = None
    try:
        connection = mysql.connector.connect(
            host=os.getenv('DB_HOST'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD')
        )
    except Error as e:
        print(f"The error '{e}' occurred")
    return connection

def initialize_database():
    connection = create_connection()
    cursor = connection.cursor()
    
    with open('schema.sql', 'r') as file:
        schema = file.read()
    
    for statement in schema.split(';'):
        if statement.strip():
            cursor.execute(statement)
    
    connection.commit()
    cursor.close()
    connection.close()

@app.route('/bonus', methods=['POST'])
def submit():
    cursor = None
    connection = None

    try:
        if request.content_type.startswith('application/json'):
            data = request.get_json()
        elif request.content_type.startswith('application/x-www-form-urlencoded'):
            data = request.form
        elif request.content_type.startswith('multipart/form-data'):
            data = request.form.to_dict(flat=True)
        else:
            return jsonify({"message": "Content-Type must be application/json, application/x-www-form-urlencoded, or multipart/form-data"}), 415
        
        if 'name' not in data or 'email' not in data or 'income' not in data:
            return jsonify({"message": "Invalid request. Please provide all the required fields."}), 400
        
        connection = create_connection()
        cursor = connection.cursor()
        cursor.execute("USE bonus_log")
        query = "INSERT INTO entries (name, email, income) VALUES (%s, %s, %s)"
        values = (data['name'], data['email'], data['income'])
        cursor.execute(query, values)
        connection.commit()
        bonus = int(data['income']) * 0.25
        return jsonify({"message": "Entry added successfully!", "bonus": bonus}), 201
    except Error as e:
        print(f"The error '{e}' occurred")
        return jsonify({"message": "An error occurred while adding the entry."}), 500
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

@app.route('/bonus', methods=['GET'])
def get_entries():
    cursor = None
    connection = None

    try:
        connection = create_connection()
        cursor = connection.cursor()
        cursor.execute("USE bonus_log")
        cursor.execute("SELECT * FROM entries")
        entries = cursor.fetchall()
        return jsonify(entries), 200
    except Error as e:
        print(f"The error '{e}' occurred")
        return jsonify({"message": "An error occurred while fetching the entries."}), 500
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

@app.route('/bonus', methods=['DELETE'])
def delete_entries():
    cursor = None
    connection = None

    try:
        connection = create_connection()
        cursor = connection.cursor()
        cursor.execute("USE bonus_log")
        cursor.execute("TRUNCATE TABLE entries")
        connection.commit()
        return jsonify({"message": "All entries have been deleted successfully!"}), 200
    except Error as e:
        print(f"The error '{e}' occurred")
        return jsonify({"message": "An error occurred while deleting the entries."}), 500
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

if __name__ == '__main__':
    initialize_database()
    app.run(port=5000, debug=True)
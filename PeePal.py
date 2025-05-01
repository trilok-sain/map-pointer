# Final combined version with filter, rating range, and search functionality

import bcrypt
import sqlite3
import re
import os
import requests
import geopandas as gpd
from shapely.geometry import Point
from math import radians, cos, sin, sqrt, atan2

# ----------------------------- USER SYSTEM -----------------------------

class User:
    def __init__(self, username, email, gender, password, security_question, security_answer):
        self.username = username
        self.email = email
        self.gender = gender
        self.password = self.hash_password(password)
        self.security_question = security_question
        self.security_answer = self.hash_password(security_answer)

    def hash_password(self, password):
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(password.encode(), salt)

    def verify_password(self, entered_password):
        return bcrypt.checkpw(entered_password.encode(), self.password)

    def verify_security_answer(self, entered_answer):
        return bcrypt.checkpw(entered_answer.encode(), self.security_answer)

class UserDatabase:
    def __init__(self, db_name="users.db"):
        self.db_name = db_name
        self.create_table()

    def reset_database(self):
        if os.path.exists(self.db_name):
            os.remove(self.db_name)
        self.create_table()

    def create_table(self):
        conn = sqlite3.connect(self.db_name)
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT,
                email TEXT UNIQUE,
                gender TEXT,
                password BLOB,
                security_question TEXT,
                security_answer BLOB
            )
        """)
        conn.commit()
        conn.close()

    def save_user(self, user):
        if self.email_exists(user.email):
            print("❌ Email already exists. Please use a different one.")
            return False
        conn = sqlite3.connect(self.db_name)
        cursor = conn.cursor()
        cursor.execute("INSERT INTO users (username, email, gender, password, security_question, security_answer) VALUES (?, ?, ?, ?, ?, ?)",
                       (user.username, user.email, user.gender, user.password, user.security_question, user.security_answer))
        conn.commit()
        conn.close()
        print("✅ User registered successfully!")
        return True

    def email_exists(self, email):
        conn = sqlite3.connect(self.db_name)
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
        user = cursor.fetchone()
        conn.close()
        return user is not None

    def authenticate_user(self, username, email, password):
        conn = sqlite3.connect(self.db_name)
        cursor = conn.cursor()
        cursor.execute("SELECT password FROM users WHERE username = ? AND email = ?", (username, email))
        user_data = cursor.fetchone()
        conn.close()
        if user_data:
            return bcrypt.checkpw(password.encode(), user_data[0])
        return False

    def reset_password(self, username, email, security_answer, new_password):
        conn = sqlite3.connect(self.db_name)
        cursor = conn.cursor()
        cursor.execute("SELECT security_answer FROM users WHERE username = ? AND email = ?", (username, email))
        user_data = cursor.fetchone()
        if user_data and bcrypt.checkpw(security_answer.encode(), user_data[0]):
            new_hashed_password = bcrypt.hashpw(new_password.encode(), bcrypt.gensalt())
            cursor.execute("UPDATE users SET password = ? WHERE username = ? AND email = ?", (new_hashed_password, username, email))
            conn.commit()
            conn.close()
            print("✅ Password reset successfully!")
            return True
        conn.close()
        print("❌ Incorrect security answer.")
        return False

# ----------------------------- WASHROOM SYSTEM -----------------------------

class Washroom:
    def __init__(self, id, name, latitude, longitude, accessible, baby_friendly, unisex):
        self.id = id
        self.name = name
        self.latitude = latitude
        self.longitude = longitude
        self.accessible = accessible
        self.baby_friendly = baby_friendly
        self.unisex = unisex

    def save_to_db(self, cursor):
        cursor.execute("""
            INSERT OR IGNORE INTO washrooms (id, name, latitude, longitude, wheelchair, baby_changing, unisex)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (self.id, self.name, self.latitude, self.longitude, self.accessible, self.baby_friendly, self.unisex))

class WashroomDatabase:
    def __init__(self, db_name="washrooms.db"):
        self.db_name = db_name
        self.setup_database()

    def setup_database(self):
        conn = sqlite3.connect(self.db_name)
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS washrooms (
                id INTEGER PRIMARY KEY,
                name TEXT,
                latitude REAL,
                longitude REAL,
                wheelchair TEXT,
                baby_changing TEXT,
                unisex TEXT
            )
        """)
        conn.commit()
        conn.close()

    def save_washrooms(self, washrooms):
        conn = sqlite3.connect(self.db_name)
        cursor = conn.cursor()
        for washroom in washrooms:
            washroom.save_to_db(cursor)
        conn.commit()
        conn.close()

    def populate_from_gdf(self, gdf):
        washrooms = []
        for idx, row in gdf.iterrows():
            washrooms.append(Washroom(
                id=row['id'],
                name=row['name'],
                latitude=row['geometry'].y,
                longitude=row['geometry'].x,
                accessible=row['wheelchair'].lower() == 'yes',
                baby_friendly=row['baby_changing'].lower() == 'yes',
                unisex=row['unisex'].lower() == 'yes'
            ))
        self.save_washrooms(washrooms)

    def search(self, keyword=None, accessible=None, baby_friendly=None, unisex=None):
        conn = sqlite3.connect(self.db_name)
        cursor = conn.cursor()
        query = "SELECT * FROM washrooms WHERE 1=1"
        params = []
        if keyword:
            query += " AND name LIKE ?"
            params.append(f"%{keyword}%")
        if accessible is not None:
            query += " AND wheelchair = ?"
            params.append("1" if accessible else "0")
        if baby_friendly is not None:
            query += " AND baby_changing = ?"
            params.append("1" if baby_friendly else "0")
        if unisex is not None:
            query += " AND unisex = ?"
            params.append("1" if unisex else "0")
        cursor.execute(query, params)
        results = cursor.fetchall()
        conn.close()
        return results

    def find_nearby(self, latitude, longitude, radius_km=2.0):
        def haversine(lat1, lon1, lat2, lon2):
            R = 6371
            dlat = radians(lat2 - lat1)
            dlon = radians(lon2 - lon1)
            a = sin(dlat/2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)**2
            c = 2 * atan2(sqrt(a), sqrt(1 - a))
            return R * c

        conn = sqlite3.connect(self.db_name)
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM washrooms")
        all_washrooms = cursor.fetchall()
        conn.close()

        nearby = []
        for washroom in all_washrooms:
            dist = haversine(latitude, longitude, washroom[2], washroom[3])
            if dist <= radius_km:
                nearby.append((washroom, dist))
        return sorted(nearby, key=lambda x: x[1])

# ----------------------------- API POPULATION -----------------------------

overpass_url = "http://overpass-api.de/api/interpreter"
overpass_query = """
[out:json];
(
  area["name"="Jaipur"]["boundary"="administrative"];
  area["name"="Ajmer"]["boundary"="administrative"];
  area["name"="Udaipur"]["boundary"="administrative"];
  area["name"="Jodhpur"]["boundary"="administrative"];
)->.searchAreas;
(
  node["amenity"="toilets"](area.searchAreas);
  way["amenity"="toilets"](area.searchAreas);
  relation["amenity"="toilets"](area.searchAreas);
);
out center;
"""
response = requests.get(overpass_url, params={'data': overpass_query})
data = response.json()
records = []
for elem in data['elements']:
    tags = elem.get('tags', {})
    lat = elem.get('lat') or elem.get('center', {}).get('lat')
    lon = elem.get('lon') or elem.get('center', {}).get('lon')
    if lat and lon:
        records.append({
            'id': elem['id'],
            'name': tags.get('name', 'Unnamed'),
            'wheelchair': tags.get('wheelchair', 'no'),
            'baby_changing': tags.get('baby_changing', 'no'),
            'unisex': tags.get('unisex', 'no'),
            'geometry': Point(lon, lat)
        })
gdf = gpd.GeoDataFrame(records, crs="EPSG:4326")
db = WashroomDatabase()
db.populate_from_gdf(gdf)
print("All washrooms have been added to the database!")

import sys
import os
import paho.mqtt.client as paho
from pymongo import MongoClient
from datetime import datetime
import threading
import signal
from dotenv import load_dotenv

load_dotenv()

mongo_uri = os.getenv("MONGO_URI")
mongo_db_name = os.getenv("MONGO_DB")
mongo_collection_name = os.getenv("MONGO_COLLECTION")

mongo_client = MongoClient(mongo_uri)
db = mongo_client[mongo_db_name]
collection = db[mongo_collection_name]

mqtt_host = os.getenv("MQTT_HOST")
mqtt_port = int(os.getenv("MQTT_PORT", 1883))
mqtt_user = os.getenv("MQTT_USER")
mqtt_pass = os.getenv("MQTT_PASS")

topics = ["lm35_temp", "humidity", "bmp280_temp", "pressure", "lux", "wind", "rain", "dust", "gas"]

# Dictionary to store the last known values
last_values = {}
last_co2ppm_value = None

def refresh_data():
    print("Refreshing all values in the database")
    for topic, value in last_values.items():
        document = {
            "topic": topic,
            "value": value,
            "timestamp": datetime.now()
        }
        collection.insert_one(document)
    print("All values refreshed in MongoDB")
    threading.Timer(300, refresh_data).start()

def message_handling(client, userdata, msg):
    global last_co2ppm_value
    print(f"{msg.topic}: {msg.payload.decode()}")

    new_value = msg.payload.decode()

    if msg.topic == "co2ppm":
        new_value_int = int(new_value)
        if last_co2ppm_value is not None and abs(new_value_int - last_co2ppm_value) <= 10:
            print("CO2 ppm value change is less than or equal to 10. Not inserting into MongoDB.")
            return
        last_co2ppm_value = new_value_int

    elif msg.topic in last_values and last_values[msg.topic] == new_value:
        print("Duplicate value. Not inserting into MongoDB.")
        return

    document = {
        "topic": msg.topic,
        "value": new_value,
        "timestamp": datetime.now()
    }
    collection.insert_one(document)
    print("Data inserted into MongoDB")

    last_values[msg.topic] = new_value

def on_publish(client, userdata, mid):
    print("Message published")

client = paho.Client()
client.on_message = message_handling
client.on_publish = on_publish

client.username_pw_set(username=mqtt_user, password=mqtt_pass)

if client.connect(mqtt_host, mqtt_port, 60) != 0:
    print("Couldn't connect to the MQTT broker")
    sys.exit(-1)

for topic in topics:
    client.subscribe(topic, 1)

def signal_handler(sig, frame):
    print("Exiting...")
    client.loop_stop()
    client.disconnect()
    mongo_client.close()
    sys.exit(0)

signal.signal(signal.SIGINT, signal_handler)

client.loop_start()
threading.Timer(300, refresh_data).start()

print("Press CTRL+C to exit...")

signal.pause()

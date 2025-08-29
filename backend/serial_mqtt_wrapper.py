import serial
import time
import paho.mqtt.client as mqtt
import os
from dotenv import load_dotenv

load_dotenv()

broker_address = os.getenv("MQTT_HOST")
broker_port = int(os.getenv("MQTT_PORT", 1883))
mqtt_user = os.getenv("MQTT_USER")
mqtt_pass = os.getenv("MQTT_PASS")
serial_port = os.getenv("SERIAL_PORT", "/dev/ttyUSB0")
serial_baud = int(os.getenv("SERIAL_BAUD", 115200))

topics = ["stateAlarm", "nDetections", "co2ppm", "windowIsOpen", "tempDHT", "humDHT", "IsNight", "GasAlarm", "luxVal", "intruder", "gasLeak", "current1", "current2", "current3", "isLightOn"]

def on_connect(client, userdata, flags, rc):
    print("Connected with result code " + str(rc))
    client.subscribe('commands', 1)

def on_publish(client, userdata, mid):
    print("Message published")

def on_message(client, userdata, msg):
    global msg_true
    print("Received message from MQTT subscriber:", msg.payload)
    msg_true = 1
    send_to_serial(msg.payload)
    return msg.payload

def send_to_serial(data):
    global msg_true
    ser.reset_output_buffer()
    time.sleep(0.5)
    ser.reset_input_buffer()
    time.sleep(1)
    ser.write(data)
    time.sleep(1)
    ser.reset_input_buffer()
    time.sleep(1)
    msg_true = 0
    time.sleep(1)

def read_from_serial():
    ser.write(b"r")
    time.sleep(0.1)
    while True:
        data = ser.readline().strip().decode("latin-1")
        if data:
            print("Received data:", data)
            numbers = data.split(" ")
            for i, number in enumerate(numbers):
                topic = topics[i]
                print("Publishing", number, "to topic:", topic)
                client.publish(topic, number, 1)
            break

client = mqtt.Client()
client.on_connect = on_connect
client.on_publish = on_publish
client.on_message = on_message

client.username_pw_set(username=mqtt_user, password=mqtt_pass)
client.connect(broker_address, broker_port, 60)

ser = serial.Serial(port=serial_port, baudrate=serial_baud)
msg_true = 0
if not ser.isOpen():
    ser.open()

client.loop_start()

try:
    time.sleep(120)
    while True:
        if msg_true == 0:
            read_from_serial()
        ser.reset_input_buffer()
        time.sleep(1)
except KeyboardInterrupt:
    print("Interrupted")
    client.loop_stop()
    ser.close()

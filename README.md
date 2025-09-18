# SmartHouse MQTT App
[![Ask DeepWiki](https://devin.ai/assets/askdeepwiki.png)](https://deepwiki.com/andreitoma59/SmartHouse-MQTT-App)

This repository contains the full-stack implementation of a Smart Home monitoring and control system. It includes a React Native mobile application, a Python backend for data processing and communication, and Arduino code for hardware interaction. The system uses MQTT for real-time communication between the components.

## Features

-   **Real-time Monitoring:** A mobile dashboard displays live data from sensors, including temperature and humidity.
-   **Device Control:** Remotely control various aspects of your home:
    -   HVAC (Heating and Cooling) based on a target temperature.
    -   Lighting (On/Off).
    -   Security Alarm (Arm/Disarm).
    -   Windows (Open/Close).
    -   Gas Leak Alarm.
-   **Data Visualization:** View historical sensor data (temperature, CO2 levels, power consumption, etc.) in interactive graphs with selectable date ranges.
-   **Push Notifications:** Receive alerts for critical events like intruder detection and reminders to turn on lights at night.
-   **Emergency Power Down:** A feature to shut down all connected electrical components in an emergency.

## System Architecture

The project is composed of several key components that work together:

1.  **React Native Mobile App (Frontend):** The user interface for interacting with the smart home system. It connects to the MQTT broker to receive live data and publish control commands. It also fetches historical data from the REST API for the graphs.

2.  **Python Backend:**
    -   `serial_mqtt_wrapper.py`: This script acts as a bridge between the Arduino board (connected via a serial port) and the MQTT broker. It subscribes to the `commands` topic to receive instructions from the app and forwards them to the Arduino. It also reads sensor data from the Arduino and publishes it to various MQTT topics.
    -   `mqtt_sub_publishdatabase_prod.py`: Subscribes to all sensor data topics on the MQTT broker. It processes and filters this data before storing it in a MongoDB database for historical record-keeping.
    -   `api_rest.py`: A Flask-based REST API that serves the historical sensor data stored in MongoDB. The mobile app queries this API to display data in the graphs section.

3.  **Arduino (Hardware Controller):** The `main_arduino.ino` sketch runs on an Arduino board, which is connected to various sensors and actuators. It reads values from sensors (DHT11, PIR, LDR, MQ Gas, ACS712 current sensors, RFID reader) and controls actuators (relays, servo motor, buzzer) based on commands received via the serial connection from the Python wrapper.

4.  **MQTT Broker:** The central communication backbone. All components connect to the broker to publish and subscribe to messages, enabling real-time, event-driven communication.

5.  **MongoDB:** A NoSQL database used to store time-series data from all the sensors.

## Technology Stack

-   **Frontend:** React Native, React Navigation, `sp-react-native-mqtt`, `react-native-svg-charts`, `axios`
-   **Backend:** Python, Flask, Paho-MQTT, PyMongo, python-dotenv
-   **Hardware:** Arduino
-   **Database:** MongoDB
-   **Communication:** MQTT, REST API, Serial

## Setup and Installation

### 1. Prerequisites

-   An Arduino board with connected sensors and actuators as defined in `backend/Arduino/main_arduino.ino`.
-   A running MQTT Broker (e.g., Mosquitto).
-   A running MongoDB instance.
-   Python 3.x and Node.js installed on your machine.

### 2. Hardware (Arduino)

1.  Open `backend/Arduino/main_arduino.ino` in the Arduino IDE.
2.  Install the required libraries from the Library Manager:
    -   `Adafruit Unified Sensor`
    -   `DHT sensor library`
    -   `Adafruit GFX Library`
    -   `Adafruit SSD1306`
    -   `PN532` (from Elechouse)
    -   `ACS712`
3.  Verify the pin connections match the definitions in the code.
4.  Upload the sketch to your Arduino board.

### 3. Backend

1.  Navigate to the `backend` directory.
2.  Create a `.env` file and populate it with your configuration details, following this example:

    ```env
    # MQTT Configuration
    MQTT_HOST=your_mqtt_broker_ip
    MQTT_PORT=1883
    MQTT_USER=your_mqtt_user
    MQTT_PASS=your_mqtt_password

    # MongoDB Configuration
    MONGO_URI=mongodb://your_mongo_user:your_mongo_password@your_mongo_ip:27017/
    MONGO_DB=sensorData
    MONGO_COLLECTION=readings
    
    # Serial Port Configuration
    SERIAL_PORT=/dev/ttyUSB0 # or your Arduino's serial port (e.g., COM3 on Windows)
    SERIAL_BAUD=115200
    ```

3.  Install the required Python packages:

    ```bash
    pip install paho-mqtt pymongo flask flask-cors python-dotenv pyserial
    ```

4.  Run the backend services in separate terminal windows:

    ```bash
    # Terminal 1: Serial-MQTT Bridge
    python serial_mqtt_wrapper.py

    # Terminal 2: MQTT-Database Subscriber
    python mqtt_sub_publishdatabase_prod.py

    # Terminal 3: REST API for historical data
    python api_rest.py
    ```

### 4. Mobile App (React Native)

1.  Clone the repository and navigate to the root directory.

2.  Update the IP addresses for your MQTT broker and REST API in the following files:
    -   `components/mqtt.js`: Change the `uri` in `MQTT.createClient` to your MQTT broker's address.
    -   `screens/Graphs.js`: Change the URL in the `axios.get` call to your Flask API's address.

3.  Install project dependencies:

    ```bash
    npm install
    ```

4.  Start the Metro bundler:

    ```bash
    npm start
    ```

5.  In a new terminal, run the application on your desired platform (ensure an emulator is running or a device is connected):

    ```bash
    # For Android
    npm run android

    # For iOS
    npm run ios
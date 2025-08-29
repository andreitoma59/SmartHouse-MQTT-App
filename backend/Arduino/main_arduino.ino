/*
 * +---------------------------------------------------+
 *               PROIECT LICENTA ARDUINO PART V1
 * +---------------------------------------------------+
 * Library PN532: https://github.com/elechouse/PN532
 * DHT Sensor Library: https://github.com/adafruit/DHT-sensor-library
 * Adafruit Unified Sensor Lib: https://github.com/adafruit/Adafruit_Sensor
 */

/* +---------------+
 * |   LIBRARII   |
 * +---------------+
 */

//DHT
#include <Adafruit_Sensor.h>
#include <DHT.h>
#include <DHT_U.h>
//OLED
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
//SERVO MOTOR
#include <Servo.h>
//RFID
#include <PN532_HSU.h>
#include <PN532.h>

#include "ACS712.h"

/* +-----------------+
 * |   DEFINITII   |
 * +-----------------+
 */

//DHT
#define DHTPIN 5      // Digital pin connected to the DHT sensor
#define DHTTYPE DHT11  // DHT 11

//OLED
#define SCREEN_WIDTH 128  // OLED display width, in pixels
#define SCREEN_HEIGHT 64  // OLED display height, in pixels
#define MQPin A0
#define LDRPin A1         // Analog pin connected to the LDR
#define LDRThreshold 10  // Threshold for determining if it's night
#define co2Zero 291
#define COOLDOWN_PERIOD 3000

// Known resistor value for the voltage divider
#define R_FIXED 10000.0  // 10k ohms

// Calibration values for LDR
float resistanceAtFullIlluminance = 15400.0;  // 15.4 kΩ la 50 lux
float luxAtFullIlluminance = 50.0;            // 50 lux la 15.4 kΩ

// Relay control pins
#define RELAY1_PIN 13
#define RELAY2_PIN 12
#define RELAY3_PIN 11
#define RELAY4_PIN 7
#define RELAY5_PIN 6

// LED
#define GREEN_LED_PIN 46
#define RED_LED_PIN 47

// CURRENT MEASURE
#define ACS_PIN_1 A14 // Assuming 12V DC
#define ACS_PIN_2 A13 // Assuming 220V AC
#define ACS_PIN_3 A15 // Assuming 12V DC

ACS712 sensor1(ACS_PIN_1, 5.0, 1023, 100); // 20A module, 100mV per A
ACS712 sensor2(ACS_PIN_2, 5.0, 1023, 100); // 20A module, 100mV per A
ACS712 sensor3(ACS_PIN_3, 5.0, 1023, 100); // 20A module, 100mV per A

//RFID
PN532_HSU pn532hsu(Serial1);
PN532 nfc(pn532hsu);

/* +-------------+
 * |   OBIECTE   |
 * +-------------+
 */

//DHT
DHT_Unified dht(DHTPIN, DHTTYPE);

//OLED
// Declaration for an SSD1306 display connected to I2C (SDA, SCL pins)
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

//SERVO MOTOR
Servo myservo;

/* +--------------------+
 * |   SENZORI PINOUT   |
 * +--------------------+
 */
// BUZZER
int buzzer = 9;
// PIR SENSOR
int pirPin = 10;      // Input for HC-S501
int nDetections = 0;  //Count the number of times movement was detected during the alarm is connected
int oneTime = 0;      //Only add one each time movement was detected
int pirValue;
unsigned long lastMotionTime = 0;

/* +--------------------+
 * | VARIABILE SENZORI  |
 * +--------------------+
 */

//DHT
float tempDHT = 0.0;
float humDHT = 0.0;
//Ioconfig percentage
int wait = 0;
//GAS SENSOR
bool gasLeak = false;
int co2ppm = 0;
uint16_t gasVal;
//SERVO MOTOR
bool windowIsOpen = false;
bool wantWindowOpen = false;
bool auxWindow = false;
// LDR
int lightVal;
float luxVal;
bool isNight;
// STATE ALARM
bool stateAlarm = false;
bool intruder = false;
// Gas Alarm
bool GasAlarm = true;
// Bec
bool isLightOn = false;

// RFID
byte authorizedUID[] = {0x54, 0x50, 0x98, 0xBA}; // The UID of the authorized card
byte guestUID[] = {0xC4, 0x4C, 0xE2, 0xBA};

// CURRENT MEASURE
float current1 = 0;
float current2 = 0;
float current3 = 0;
int targetTemp = 0; // Target temperature set by the user

/* +-------------------+
 * | FUNCTII AUXILIARE |
 * +-------------------+
 */

void ioConfig() {
  pinMode(pirPin, INPUT);  //Movement sensor INPUT
  pinMode(buzzer, OUTPUT);  //initialize the buzzer pin as an output
  pinMode(RELAY1_PIN, OUTPUT);  // Initialize the relay 1 pin as an output
  pinMode(RELAY2_PIN, OUTPUT);  // Initialize the relay 2 pin as an output
  pinMode(RELAY3_PIN, OUTPUT);   // Initialize the relay 3 pin as an output
  pinMode(RELAY4_PIN, OUTPUT);   // Initialize the relay 4 pin as an output
  pinMode(RELAY5_PIN, OUTPUT);

  digitalWrite(RELAY1_PIN, HIGH);  // Ensure relay 1 is off at startup
  digitalWrite(RELAY2_PIN, HIGH);  // Ensure relay 2 is off at startup
  digitalWrite(RELAY3_PIN, HIGH);
  digitalWrite(RELAY4_PIN, HIGH);
  digitalWrite(RELAY5_PIN, HIGH);

  pinMode(GREEN_LED_PIN, OUTPUT);  // Initialize the green LED pin as an output
  pinMode(RED_LED_PIN, OUTPUT);    // Initialize the red LED pin as an output

  myservo.attach(8);
  myservo.write(90);

  // Initialize PN532
  Serial1.begin(115200);
  nfc.begin();
  uint32_t versiondata = nfc.getFirmwareVersion();
  if (!versiondata) {
    while (1); // halt
  }

  dht.begin();
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) { // Confirm the address
    Serial.println(F("SSD1306 allocation failed"));
    for (;;);
  }
  delay(2000);
  display.clearDisplay();

  display.setTextSize(1);
  display.setTextColor(WHITE);
  display.setCursor(0, 0);
  // Display static text
  display.println("SmartHome IoT System");
  display.display();
  for (int i = 0; i < 4; i++) {
    display.clearDisplay();
    display.setCursor(0, 10);
    display.setTextSize(1);
    display.println("Please wait until all");
    display.setCursor(20, 20);
    display.println("the modules are");
    display.setCursor(45, 30);
    display.println("loaded:");
    display.setCursor(50, 50);
    display.setTextSize(2);
    display.println(wait);
    display.setCursor(80, 50);
    display.println("%");
    display.display();
    wait += 25;
    delay(30000);
  }

  // Calculate and set the midpoint for each ACS712 sensor based on the average of the fluctuating voltages
  sensor1.autoMidPoint(); // Average voltage for sensor 1
  sensor2.autoMidPoint(); // Average voltage for sensor 2
  sensor3.autoMidPoint(); // Average voltage for sensor 3
}

void valuesToOLED() {
  display.clearDisplay();

  display.setCursor(0, 0);
  display.setTextSize(1);
  // Display static text
  display.println("SmartHome IoT System");

  display.setCursor(0, 20);
  display.setTextSize(2);
  // Display temperature
  display.println("Temp:");
  display.setTextSize(1);
  display.setCursor(60, 23);
  display.println(tempDHT);
  display.setCursor(95, 23);
  display.println("C");

  display.setCursor(12, 40);
  display.setTextSize(2);
  // Display temperature
  display.println("Hum:");

  display.setTextSize(1);
  display.setCursor(60, 43);
  display.println(humDHT);
  display.setCursor(95, 43);
  display.println("%");
  if (gasLeak) {
    display.clearDisplay();
    display.setTextSize(2);
    display.setCursor(30, 10);
    // Display temperature
    display.println("| Gas");

    display.setCursor(30, 40);
    // Display temperature
    display.println("| Leak!");
  }
  display.display();
}

void readTempHum() {
  // Get temperature event and print its value.
  sensors_event_t event;
  dht.temperature().getEvent(&event);

  if (isnan(event.temperature)) {
    //Serial.println(F("Error reading temperature!"));
  } else {
    tempDHT = event.temperature;
  }
  // Get humidity event and print its value.
  dht.humidity().getEvent(&event);
  if (isnan(event.relative_humidity)) {
    //Serial.println(F("Error reading humidity!"));
  } else {
    humDHT = event.relative_humidity;
  }

  valuesToOLED();
}

void readMQData() {
  int co2now[10];   //int array for co2 readings
  int co2raw = 0;   //int for raw value of co2
  int co2comp = 0;  //int for compensated co2
  co2ppm = 0;       //int for calculated ppm
  int zzz = 0;      //int for averaging
  int grafX = 0;    //int for x value of graph

  for (int x = 0; x < 10; x++) {  //sample co2 10x over 2 seconds
    gasVal = analogRead(MQPin);
    co2now[x] = gasVal;
    //delay(200);
  }

  for (int x = 0; x < 10; x++) {  //add samples together
    zzz = zzz + co2now[x];
  }
  co2raw = zzz / 10;                          //divide samples by 10
  co2comp = co2raw - co2Zero;                 //get compensated value
  co2ppm = map(co2comp, 0, 1023, 400, 5000);  //map value for atmospheric levels

  if (co2ppm >= 400 && GasAlarm == true) {

    if (!wantWindowOpen) {
      //The window will be closed after
      auxWindow = true;
    }

    //Open Window if closed
    myservo.write(140);
    windowIsOpen = true;
    gasLeak = true;
    digitalWrite(buzzer, HIGH);
    delay(20);  //wait for 2ms
    digitalWrite(buzzer, LOW);
    delay(20);  //wait for 2ms

  } else if (co2ppm <= 350) {

    //Gas leak fixed
    gasLeak = false;

    //Close Window if do not want to be opened
    if (!wantWindowOpen) {
      myservo.write(90);
      windowIsOpen = false;
    }
  }
}

void readLDR() {
  // Citește valoarea de la senzorul LDR
  lightVal = analogRead(LDRPin);
  
  // Calculează tensiunea corespunzătoare valorii citite
  float voltage = lightVal * (5.0 / 1023.0);
  
  // Calculează rezistența senzorului LDR
  float resistance = (5.0 - voltage) * R_FIXED / voltage;
  
  // Convertește rezistența în lux folosind valorile de calibrare
  luxVal = luxAtFullIlluminance * (resistanceAtFullIlluminance / resistance);

  if (luxVal < LDRThreshold) {
    isNight = true;
  } else {
    isNight = false;
  }
}

void readRFID() {
  uint8_t success;
  uint8_t uid[] = { 0, 0, 0, 0, 0, 0, 0 }; // Buffer to store the returned UID
  uint8_t uidLength; // Length of the UID (4 or 7 bytes depending on the card type)

  // Wait for an NFC card to be present
  success = nfc.readPassiveTargetID(PN532_MIFARE_ISO14443A, uid, &uidLength);
  
  if (success) {
    bool authorized = true;
    for (byte i = 0; i < uidLength; i++) {
      if (uid[i] != authorizedUID[i]) {
        authorized = false;
        break;
      }
    }

    if (authorized) {
      if (stateAlarm) {
        // Welcome phase
        stateAlarm = false;
        display.clearDisplay();
        display.setTextSize(2);
        display.setCursor(10, 10);
        display.println("Welcome,");
        display.setCursor(20, 30);
        display.println("Toma!");
        display.display();
        // Welcome sound
        digitalWrite(buzzer, HIGH);
        delay(500);
        digitalWrite(buzzer, LOW);
      } else {
        // Goodbye phase
        stateAlarm = true;
        display.clearDisplay();
        display.setTextSize(2);
        display.setCursor(10, 10);
        display.println("Alarm");
        display.setCursor(20, 30);
        display.println("Armed");
        display.display();
        // Goodbye sound
        digitalWrite(buzzer, HIGH);
        delay(100);
        digitalWrite(buzzer, LOW);
        delay(100);
        digitalWrite(buzzer, HIGH);
        delay(100);
        digitalWrite(buzzer, LOW);
      }
    }
  }
}

void readACSValues() {
  // Read current from each ACS712 sensor
  current1 = sensor1.mA_DC();
  current2 = sensor2.mA_AC_sampling();
  current3 = sensor3.mA_DC();
}

void sendValues() {
  Serial.print(stateAlarm);
  Serial.print(" ");
  Serial.print(nDetections);
  Serial.print(" ");
  Serial.print(co2ppm);
  Serial.print(" ");
  Serial.print(windowIsOpen);
  Serial.print(" ");
  Serial.print(tempDHT);
  Serial.print(" ");
  Serial.print(humDHT);
  Serial.print(" ");
  Serial.print(isNight);
  Serial.print(" ");
  Serial.print(GasAlarm);
  Serial.print(" ");
  Serial.print(luxVal);
  Serial.print(" ");
  Serial.print(intruder);
  Serial.print(" ");
  Serial.print(gasLeak);
  Serial.print(" ");
  Serial.print(current1 / -1000.0); // Convert mA to A
  Serial.print(" ");
  Serial.print(current2 / 1000.0); // Convert mA to A
  Serial.print(" ");
  Serial.print(current3 / 1000.0); // Convert mA to A
  Serial.print(" ");
  Serial.print(isLightOn);
  Serial.println();
}

void recieveCommands() {
  if (Serial.available() > 0) {
    String command = Serial.readStringUntil('\n');
    command.trim(); // Remove any extra whitespace

    if (command.startsWith("t")) {
      // Handle temperature setpoint command
      int setpoint = command.substring(1).toInt();
      targetTemp = setpoint;
    } else if (command == "r") {
      // Send the values to the serial
      sendValues();
    } else if (command == "f") {
      // Turn OFF the alarm
      stateAlarm = false;
      nDetections = 0;
    } else if (command == "n") {
      // Turn ON the alarm
      stateAlarm = true;
      nDetections = 0;
    } else if (command == "w") {
      // Open Window
      if (!auxWindow) {
        wantWindowOpen = true;
        windowIsOpen = true;
        myservo.write(140);
      }
      auxWindow = false;
    } else if (command == "m") {
      // Close Window
      wantWindowOpen = false;
      windowIsOpen = false;
      myservo.write(90);
    } else if (command == "g") {
      GasAlarm = false;
    } else if (command == "h") {
      GasAlarm = true;
    } else if (command == "d") {
      // Turn on the lights
      digitalWrite(RELAY3_PIN, LOW);
      isLightOn = true;
    } else if (command == "e") {
      // Turn off the lights
      digitalWrite(RELAY3_PIN, HIGH);
      isLightOn = false;
    } else if (command == "x") {
      // Turn off all relays
      digitalWrite(RELAY1_PIN, HIGH);
      digitalWrite(RELAY2_PIN, HIGH);
      digitalWrite(RELAY3_PIN, HIGH);
      digitalWrite(RELAY4_PIN, HIGH);
      digitalWrite(RELAY5_PIN, LOW);
      digitalWrite(GREEN_LED_PIN, LOW);  // Turn off green LED
      digitalWrite(RED_LED_PIN, LOW);   // Turn on red LED
    } else if (command == "y") {
      // Open only the relay 5
      digitalWrite(RELAY5_PIN, HIGH);
    }
  }
}

void controlTemperature() {
  int tempDHT_int = static_cast<int>(tempDHT);
  if (targetTemp != 0) {
    if (tempDHT_int < targetTemp) {
      // Activate heating mode
      digitalWrite(RELAY1_PIN, HIGH);
      digitalWrite(RELAY2_PIN, LOW);
      digitalWrite(RELAY4_PIN, LOW);
    } else if (tempDHT_int > targetTemp) {
      // Activate cooling mode
      digitalWrite(RELAY1_PIN, LOW);
      digitalWrite(RELAY2_PIN, HIGH);
      digitalWrite(RELAY4_PIN, LOW);
    } else {
      // Turn off both relays
      digitalWrite(RELAY1_PIN, HIGH);
      digitalWrite(RELAY2_PIN, HIGH);
      digitalWrite(RELAY4_PIN, HIGH);
      targetTemp=0;
    }
  }
}

void setup() {
  Serial.begin(115200);  // Initialize serial communications with the PC
  while (!Serial);  // Do nothing if no serial port is opened (added for Arduinos based on ATMEGA32U4)
  ioConfig();
}

void loop() {
  recieveCommands();
  readTempHum();
  readMQData();
  readLDR();
  readRFID();
  readACSValues();

  // Citește starea curentă a senzorului PIR
  pirValue = digitalRead(pirPin);
  unsigned long currentTime = millis();

  // Logica de detectare a mișcării, independentă de starea alarmei
  if (pirValue == HIGH && currentTime - lastMotionTime > COOLDOWN_PERIOD) {
    nDetections++;  // Incrementează la orice detectare de mișcarepe
    lastMotionTime = currentTime; // Actualizează timpul ultimei mișcări

    if (stateAlarm) {
      // Actions to take when alarm is on
      digitalWrite(buzzer, HIGH);
      delay(2);  // Buzz for 2ms
      digitalWrite(buzzer, LOW);
      delay(2);  // Wait for 2ms
      intruder = true;
    }
    // Optional: Additional actions when alarm is off could also be included here if needed
  }

  if (stateAlarm) {
    // Alarm is on, turn on the red LED and turn off the green LED
    digitalWrite(GREEN_LED_PIN, LOW);  // Turn off green LED
    digitalWrite(RED_LED_PIN, HIGH);   // Turn on red LED
  } else {
    // Alarm is off, turn on the green LED and turn off the red LED
    digitalWrite(GREEN_LED_PIN, HIGH);  // Turn on green LED
    digitalWrite(RED_LED_PIN, LOW);     // Turn off red LED
    intruder=false;
  }

  // Adjust heating/cooling mode based on current temperature and target temperature
  controlTemperature();
}

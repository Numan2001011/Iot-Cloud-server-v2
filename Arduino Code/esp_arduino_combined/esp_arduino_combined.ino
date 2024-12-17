#include <DHT.h>
#include <WiFi.h>
#include <HTTPClient.h>


// Use Serial2 on the ESP32 for communication with Arduino
#define RX2 16  // Define RX pin for Serial2
#define TX2 17  // Define TX pin for Serial2

HardwareSerial arduinoSerial(2);  // Use Serial2 for communication with Arduino

const char* ssid = "Noman";       // Local Wi-Fi SSID
const char* password = "12345678"; // Local Wi-Fi Password

// Pin definitions for ESP32
#define DHTPIN 4 // GPIO34 connected to DHT sensor data pin
#define DHTTYPE DHT11 // Define the type of DHT sensor (DHT11)

// Initialize DHT sensor
DHT dht(DHTPIN, DHTTYPE);

// Pin definitions for Ultrasonic Sensor
#define TRIG_PIN 23 // GPIO23 connected to Ultrasonic Sensor's TRIG pin
#define ECHO_PIN 22 // GPIO22 connected to Ultrasonic Sensor's ECHO pin

// Pin definition for LED
#define LED_PIN 5 // GPIO10 connected to the LED

// Threshold for distance (in cm)
const int DISTANCE_THRESHOLD = 25;

// Variables for distance calculation
float duration_us, distance_cm;
// Timer variables
unsigned long lastSendTime = 0; // Stores the last send time
const unsigned long interval = 5000; // 5-second interval

WiFiServer server(80);

String baseurl = "http://192.168.43.165:5000/sendespdata/";

// Variables to store sensor data
int humidity = 0;
int temperature = 0;
int soil_value = 0;

void setup() {
  // Initialize serial communication
  Serial.begin(9600);

  // Set pin modes
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(LED_PIN, OUTPUT);

  // Initialize DHT sensor
  dht.begin();


  // Short delay for sensor stabilization
  delay(20000);
  WiFi.begin(ssid, password);

  Serial.print("Connecting to local Wi-Fi...");
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.print(".");
  }
  Serial.println("\nConnected to local Wi-Fi!");

  server.begin();
  arduinoSerial.begin(9600, SERIAL_8N1, RX2, TX2); // ESP32
}

void loop() {

  if (arduinoSerial.available()) {
        String data = arduinoSerial.readStringUntil('\n'); // Read until newline
        data.trim(); // Remove any leading/trailing whitespace
        Serial.println("Received from Arduino: " + data); // Print the received value

        // Optionally convert the received data to an integer
        soil_value = data.toInt();
        Serial.println("Parsed Sensor Value: " + String(soil_value));
    }
    
    // Add a small delay to prevent flooding
    delay(100);
  // Read humidity and temperature
  humidity = dht.readHumidity();
  temperature = dht.readTemperature();

  // Check if readings are valid
  if (isnan(humidity) || isnan(temperature)) {
    Serial.println("Failed to read from DHT sensor!");
    return;
  }

  // Print humidity and temperature to Serial Monitor
  Serial.print("Humidity: ");
  Serial.print(humidity);
  Serial.print(" %\t");
  Serial.print("Temperature: ");
  Serial.print(temperature);
  Serial.println(" *C");
  Serial.print("Soil:");
  Serial.println(soil_value);


  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  // Measure duration of the ECHO pin pulse
  duration_us = pulseIn(ECHO_PIN, HIGH);

  // Calculate the distance in cm
  if (duration_us > 0) {
    distance_cm = (duration_us * 0.034) / 2;
  } else {
    distance_cm = -1; // Invalid reading
  }

  // Print distance to Serial Monitor
  Serial.print("Distance: ");
  if (distance_cm > 0) {
    Serial.print(distance_cm);
    Serial.println(" cm");
  } else {
    Serial.println("Out of range");
  }

  // Check if the distance is below the threshold
  if (distance_cm > 0 && distance_cm < DISTANCE_THRESHOLD) {
    digitalWrite(LED_PIN, HIGH); // Turn on LED
    delay(100);
    digitalWrite(LED_PIN, LOW); // Turn on LED
    delay(100);
    digitalWrite(LED_PIN, HIGH); // Turn on LED
    delay(100);
    digitalWrite(LED_PIN, LOW); // Turn on LED
    delay(100);
    digitalWrite(LED_PIN, HIGH); // Turn on LED
    delay(100);
    digitalWrite(LED_PIN, LOW); // Turn on LED
    delay(100);
    digitalWrite(LED_PIN, HIGH); // Turn on LED
    delay(100);
    digitalWrite(LED_PIN, LOW); // Turn on LED
    delay(100);
    digitalWrite(LED_PIN, HIGH); // Turn on LED
    delay(100);
    digitalWrite(LED_PIN, LOW); // Turn on LED
    delay(100);
    digitalWrite(LED_PIN, HIGH); // Turn on LED

  } else {
    digitalWrite(LED_PIN, LOW);  // Turn off LED
  }

  // Add a short delay before the next loop
  delay(1000);

    unsigned long currentTime = millis();
  if (currentTime - lastSendTime >= interval ) {
    lastSendTime = currentTime;

    if (humidity > 0 && humidity < 200 || temperature > 0 && temperature < 200){
      // Construct the URL with actual values
    String fullUrl = baseurl + "Humidity167MOV=" + String(humidity) + "&&" + "Temperature16OD59=" + String(temperature) + "&&" + "Soil16NEYW=" + String(soil_value);

    HTTPClient http;
    http.begin(fullUrl); // Set the URL

    // Send GET request
    int httpResponseCode = http.GET();

    if (httpResponseCode > 0) {
      Serial.println("Response Code: " + String(httpResponseCode));
      String payload = http.getString();
      Serial.println("Response: " + payload);
    } else {
      Serial.println("Error sending GET request");
    }

    http.end(); // End the HTTP connection
  }

    }

    
}

#include <SoftwareSerial.h>

SoftwareSerial espSerial(2, 3); // Rx, Tx pin of nodemcu

const int sensor_pin = A0;
const int relayPin = 7;


void setup() {
  Serial.begin(9600);	
  espSerial.begin(9600);
  pinMode(sensor_pin, INPUT);
  pinMode(relayPin, OUTPUT);
  
}

void loop() {
//Relay off
  // digitalWrite(relayPin, HIGH);
  float moisture_percentage;
  int sensor_value;
  sensor_value = analogRead(sensor_pin);
  Serial.print(sensor_value);

  espSerial.print(sensor_value);
  
  moisture_percentage = ( 100 - ( (sensor_value/1023.00) * 100 ) );
  Serial.print(" Moisture Percentage = ");
  Serial.print(moisture_percentage);
  Serial.print("%\n");
  delay(1000);

  

  if(sensor_value>600){
    Serial.println("Pump ON");
    digitalWrite(relayPin, LOW);
    delay(10000);
  }
  else if(sensor_value>350 && sensor_value<600){
    Serial.print("Pump ON ");
    digitalWrite(relayPin, LOW);
    delay(5000);
  }
  else{
    Serial.print("Pump OFF ");
    digitalWrite(relayPin, HIGH);
    delay(1000);
  }
  

}
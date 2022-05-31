#include <ArduinoJson.h>
#include <ESP8266HTTPClient.h>
#include <ESP8266WiFi.h>
#include <WiFiClientSecure.h>
#include <Wire.h>
const int MAX_LEN = 10;

const char *ssid = "J_IOT";
const char *password = "jjjj1234";
String url = "https://embedded-project.vercel.app/api/user";
void i2cWrite(int deviceID, String message) {
  Wire.beginTransmission(deviceID);
  char buf[4];
  buf[3] = '\0';
  sprintf(buf, "%03u", message.length());
  Wire.write(buf);
  Wire.endTransmission(deviceID);
  Wire.beginTransmission(deviceID);
  Wire.write(message.c_str());
  Wire.endTransmission(deviceID);
}
void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  Serial.println("");
  Serial.print("Connecting");
  while (WiFi.status() != WL_CONNECTED) {
    delay(300);
    Serial.print(".");
  }

  Serial.println("");
  Serial.print("Connected to ");
  Serial.println(ssid);
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
  Wire.begin(); // join i2c bus (address optional for master)
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    WiFiClientSecure client;
    client.setInsecure();

    HTTPClient https;
    int idx = 0;
    char recv_card_id[MAX_LEN + 1];
    Wire.requestFrom(8, MAX_LEN);    // request 10 bytes from peripheral device #8
    while (Wire.available()) {  // peripheral may send less than requested
      recv_card_id[idx++] = Wire.read(); // receive a byte as character
    }
    recv_card_id[MAX_LEN] = '\0';
    if (idx > 0) {
      if (https.begin(client, url)) {
        String post_data = "card_id=" + String(recv_card_id);
        Serial.println("Requesting " + url + " With data: " + post_data);
        https.addHeader("Content-Type", "application/x-www-form-urlencoded");
        int httpCode = https.POST(post_data);
        Serial.println("Response code: " + String(httpCode));
        Wire.write("test");
        if (httpCode == 404) {
          // User not found
          i2cWrite(8, "2");
        }
        else if (httpCode > 0) {
          String response = https.getString();
          DynamicJsonDocument doc(1024);
          deserializeJson(doc, response);
          if (!strcmp(doc["status"], "checked_in")) {
            // Check in 1 - OK 1 - Check in
            String first_name = doc["first_name"];
            i2cWrite(8, "11" + first_name);
          } else if (!strcmp(doc["status"], "checked_out")){
            // Check in 1 - OK 0 - Check out
            String first_name = doc["first_name"];
            i2cWrite(8, "10" + first_name);
          } else if (!strcmp(doc["status"], "room_full")){
            i2cWrite(8, "12" + String(doc["occupancy"]) + "/" + String(doc["capacity"]));
          }
          Serial.println(response);
        } else {
          i2cWrite(8, "0");
          Wire.write("Request Error");
        }
        https.end();
        Serial.println("Done");
      } else {
        Serial.printf("[HTTPS] Unable to connect\n");

      }
    }
  }
  delay(100);
}

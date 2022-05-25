#include <ESP8266HTTPClient.h>
#include <ESP8266WiFi.h>
#include <WiFiClientSecure.h>
#include <Wire.h>
const int MAX_LEN = 10;

const char *ssid = "meenmeen";
const char *password = "molar=mol/L";
String url = "https://embedded-project.vercel.app/api/user";

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  Serial.println("");
  Serial.print("Connecting");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
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
        if (httpCode > 0) {
          Serial.println(https.getString());
        }
        https.end();
      } else {
        Serial.printf("[HTTPS] Unable to connect\n");
      }
    }
  }
  delay(100);
}

#include <ESP8266HTTPClient.h>
#include <ESP8266WiFi.h>
#include <WiFiClientSecure.h>
#include <Wire.h>

const char *ssid = "iPhone";
const char *password = "11111111";
String url = "https://embedded-project.vercel.app/api/user?student_id=";

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
    char recv_student_id[11];
    Wire.requestFrom(8, 10);    // request 6 bytes from peripheral device #8
    while (Wire.available()) {  // peripheral may send less than requested
      recv_student_id[idx++] = Wire.read(); // receive a byte as character
    }
    recv_student_id[10] = '\0';
    if (idx == 10) {
      char buf[100];
      sprintf(buf, "%s%s", url.c_str(), recv_student_id);
      String fullUrl(buf);
      Serial.println("Requesting " + fullUrl);
      if (https.begin(client, fullUrl)) {
        int httpCode = https.GET();
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
//  delay(100);
}

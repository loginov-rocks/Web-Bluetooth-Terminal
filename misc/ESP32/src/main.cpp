#include <Arduino.h>

#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEServer.h>
#include <BLE2902.h>

const uint16_t serviceUuid = 0xFFE0;
const uint16_t characteristicUuid = 0xFFE1;

BLEServer *pServer = NULL;
BLEService *pService = NULL;
BLECharacteristic *pCharacteristic = NULL;
bool deviceConnected = false;
bool oldDeviceConnected = false;

class MyServerCallbacks : public BLEServerCallbacks
{
  void onConnect(BLEServer *pServer)
  {
    deviceConnected = true;
  };

  void onDisconnect(BLEServer *pServer)
  {
    deviceConnected = false;
  }
};

class MyCharacteristicCallbacks : public BLECharacteristicCallbacks
{
  void onWrite(BLECharacteristic *pCharacteristic)
  {
    Serial.println("Central device has written to the characteristic!");
    std::string rxValue = pCharacteristic->getValue();

    if (rxValue.length() > 0)
    {
      Serial.print("Received messages: \"");

      for (int i = 0; i < rxValue.length(); i++)
      {
        Serial.print(rxValue[i]);
      }

      Serial.println("\"");
    }
  }

  void onRead(BLECharacteristic *pCharacteristic)
  {
    // Handle the read event (e.g., return the sensor data)
    Serial.println("Central device is reading the characteristic!");
  }

  void onNotify(BLECharacteristic *pCharacteristic)
  {
    // Handle notification event
    Serial.println("Notification sent!");
  }
};

void setup()
{
  Serial.begin(115200);

  Serial.println("Set up BLE...");

  BLEDevice::init("ESP32");

  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());

  pService = pServer->createService(serviceUuid);

  pCharacteristic = pService->createCharacteristic(
      characteristicUuid,
      BLECharacteristic::PROPERTY_READ |
          BLECharacteristic::PROPERTY_WRITE |
          BLECharacteristic::PROPERTY_NOTIFY);
  pCharacteristic->addDescriptor(new BLE2902());
  pCharacteristic->setCallbacks(new MyCharacteristicCallbacks());

  pService->start();

  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(serviceUuid);
  pAdvertising->setScanResponse(false);
  pAdvertising->setMinPreferred(0x0);
  BLEDevice::startAdvertising();

  Serial.println("BLE setup was successful!");
}

void loop()
{
  if (deviceConnected)
  {
    pCharacteristic->setValue("Test\n");
    pCharacteristic->notify();
    Serial.println("Device is connected, idle...");
    delay(1000);
  }

  if (!deviceConnected && oldDeviceConnected)
  {
    Serial.println("Device disconnected!");
    delay(1000);
    pServer->startAdvertising();
    Serial.println("Start advertising");
    oldDeviceConnected = deviceConnected;
  }

  if (deviceConnected && !oldDeviceConnected)
  {
    oldDeviceConnected = deviceConnected;
    Serial.println("Device connected!");
  }
}

#include <Arduino.h>

String receiveBuffer = "";
bool isReceiveBufferComplete = false;

String transmitBuffer = "";
bool isTransmitBufferComplete = false;

void setup()
{
  Serial.begin(115200);
  Serial.println("Type a complete message and press Enter to send");

  Serial3.begin(9600);
  delay(1000);
}

void loop()
{
  // Receive first to prioritize incoming messages.
  // Read incoming data from the Bluetooth module.
  while (Serial3.available())
  {
    char c = Serial3.read();

    // Build a message until the line ending is found.
    if (c != '\n' && c != '\r')
    {
      receiveBuffer += c;
    }
    else if (receiveBuffer.length() > 0)
    {
      // Complete message received.
      isReceiveBufferComplete = true;
    }
  }

  // Display the complete received message.
  if (isReceiveBufferComplete)
  {
    Serial.print("Message received: \"");
    Serial.print(receiveBuffer);
    Serial.println("\"");

    // Clear buffer for next message.
    receiveBuffer = "";
    isReceiveBufferComplete = false;
  }

  // Transmit second after handling received messages.
  // Read incoming data from the Serial (user terminal).
  while (Serial.available() && !isTransmitBufferComplete)
  {
    char c = Serial.read();

    // Optional: uncomment to echo character on input.
    Serial.write(c);

    // Build a message until the line ending is found.
    if (c != '\n' && c != '\r')
    {
      transmitBuffer += c;
    }
    else if (transmitBuffer.length() > 0)
    {
      // Complete message received.
      isTransmitBufferComplete = true;
    }
  }

  // Send a complete message to the Bluetooth module.
  if (isTransmitBufferComplete)
  {
    Serial.print("Transmitting message: \"");
    Serial.print(transmitBuffer);
    Serial.println("\"...");

    // Send with line endings required by the Bluetooth module used.
    Serial3.print(transmitBuffer);
    Serial3.print("\r\n");

    // Clear buffer for next message.
    transmitBuffer = "";
    isTransmitBufferComplete = false;
  }
}

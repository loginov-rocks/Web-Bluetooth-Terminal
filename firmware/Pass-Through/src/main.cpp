#include <Arduino.h>

String inputBuffer = "";
bool commandComplete = false;

void setup()
{
  Serial.begin(115200);
  Serial.println("AT Command Interface Started");
  Serial.println("Type complete command and press Enter");

  Serial3.begin(9600);
  delay(1000);
}

void loop()
{
  // BT to Serial
  while (Serial3.available())
  {
    char c = Serial3.read();
    Serial.write(c);
  }

  // Build command from Serial input
  while (Serial.available() && !commandComplete)
  {
    char c = Serial.read();

    // Echo character
    Serial.write(c);

    // Add to buffer if not a line ending
    if (c != '\n' && c != '\r')
    {
      inputBuffer += c;
    }
    else if (inputBuffer.length() > 0)
    {
      // Line ending received with data in buffer
      commandComplete = true;
    }
  }

  // Send complete command
  if (commandComplete)
  {
    Serial.print("\r\nSending command: ");
    Serial.println(inputBuffer);

    // Send with proper line endings
    Serial3.print(inputBuffer);
    Serial3.print("\r\n");

    // Reset for next command
    inputBuffer = "";
    commandComplete = false;
  }
}

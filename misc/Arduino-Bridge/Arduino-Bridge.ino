/**
 * https://github.com/1oginov/Web-Bluetooth-Terminal/tree/master/misc/Arduino-Bridge/Arduino-Bridge.ino
 *
 * Wire HM-10 bluetooth module to the Arduino Uno:
 * RX  - 3
 * TX  - 2
 * GND - GND
 * VCC - 5V
 *
 * If you use Arduino with additional UARTs, you can simply remove `SoftwareSerial`
 * and replace `SerialBt` with the `Serial` you use (e.g. `Serial1`, `Serial2`
 * or `Serial3` for Arduino Mega).
 */

#include <SoftwareSerial.h>

#define PC_SERIAL_BAUDRATE  9600
#define BT_SERIAL_BAUDRATE  9600

SoftwareSerial SerialBt(2, 3);

void setup()
{
    Serial.begin(PC_SERIAL_BAUDRATE);
    SerialBt.begin(BT_SERIAL_BAUDRATE);
}

void loop()
{
    if (SerialBt.available()) {
        Serial.write(SerialBt.read());
    }

    if (Serial.available()) {
        SerialBt.write(Serial.read());
    }
}


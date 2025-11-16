# Serial Pass-Through with Message Buffering

This sketch provides serial pass-through between `Serial` (USB) and the `Serial3` (Bluetooth module) with line-based
message buffering.

Messages are buffered until a line ending (`\n` or `\r`) is detected, then transmitted or displayed as complete
messages. This is required for Bluetooth modules that expect line-terminated messages instead of character-by-character
streaming.

Receive: Incoming data from the Bluetooth module (`Serial3`) is buffered and displayed when complete.

Transmit: User input from `Serial` is buffered and sent to the Bluetooth module (`Serial3`) when complete.

When the Bluetooth module is not connected to an external device, messages are sent to the module itself for
configuration using `AT` commands.

When an external device connects to the Bluetooth module, messages are exchanged with that device over Bluetooth.

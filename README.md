# Web Bluetooth Terminal

[![Web App CI](https://github.com/loginov-rocks/Web-Bluetooth-Terminal/actions/workflows/web-app-ci.yml/badge.svg)](https://github.com/loginov-rocks/Web-Bluetooth-Terminal/actions/workflows/web-app-ci.yml)
[![CD](https://github.com/loginov-rocks/Web-Bluetooth-Terminal/actions/workflows/cd.yml/badge.svg)](https://github.com/loginov-rocks/Web-Bluetooth-Terminal/actions/workflows/cd.yml)

[https://loginov-rocks.github.io/Web-Bluetooth-Terminal/](https://loginov-rocks.github.io/Web-Bluetooth-Terminal/) — try
it out, see how it works on [YouTube](https://www.youtube.com/watch?v=BNXN_931W_M), read tutorial on
[Medium](https://loginov-rocks.medium.com/how-to-make-a-web-app-for-your-own-bluetooth-low-energy-device-arduino-2af8d16fdbe8)
(English) or on [Habr](https://habr.com/ru/articles/339146/) (Russian).

Web Bluetooth Terminal is a website that can **connect** with the remote devices which support **Bluetooth Low Energy**
(also called Bluetooth Smart) and **exchange data bidirectionally**. It can be installed on your homescreen as an
application and work offline.

**Killer feature:** the application establishes **serial communication** over BLE that is not provided by the
specification, but needed if you want to make your own BLE IoT devices using affordable bluetooth modules.

![Teaser](https://raw.githubusercontent.com/loginov-rocks/Web-Bluetooth-Terminal/main/docs/Teaser.png)

The application utilises BLE service (`0xFFE0`) and characteristic (`0xFFE1`) available in low cost BLE modules based
for example on CC2541 chip, such as HM-10, JDY-08, AT-09, CC41-A and other. Also, it bypasses 20 bytes limit specific
for GATT characteristics by keeping incoming messages in a buffer and waiting for the end of line characters.

Check [Bluetooth Low Energy (Smart) device](#bluetooth-low-energy-smart-device) and
[How to use this app as a base for my own project?](#how-to-use-this-app-as-a-base-for-my-own-project)
sections for a quick start and to find out how to make your own project. Also, I've made
[4-DOF Robot Arm](https://github.com/loginov-rocks/4-DOF-Robot-Arm) as a showcase project.

## Features

**Accessible via browser** — just go to the [website](https://loginov-rocks.github.io/Web-Bluetooth-Terminal/) and
you'll get the full featured application, it is not needed to install anything.

**Cross-platform** — as long as the app is accessible via browser, you can use it with the desktop or with the smart
phone [browser](#browser).

**Installable** — if you don't want to remember the website address, you can add it to the homescreen.

**Works offline** after installation on your homescreen, since it is a Progressive Web Application.

And... it have **auto scrolling!** Enabled by default, but you can scroll the terminal to the top on more than a half of
the terminal window height to disable it. Scroll to the bottom to enable it again. Rocket science!

## Requirements

### Browser

One of browsers which supports Web Bluetooth API by default
([Chrome Platform Status](https://chromestatus.com/feature/5264933985976320),
[Can I use](https://caniuse.com/web-bluetooth)):

1. Chrome for desktop 56+
2. Chrome for Android 56+
3. Opera 43+
4. Opera for Android 43+

All this browsers support other necessary features, such as [ES6 classes](https://caniuse.com/es6-class) and PWA
capabilities ([Web App Manifest](https://caniuse.com/sr_web-app-manifest) and
[Service Workers](https://caniuse.com/serviceworkers)), so I don't pay attention to it here.

### Bluetooth Low Energy (Smart) device

Different BLE devices implement their own services and characteristics to communicate with, but you can build your own
simple device: you just need a BLE module (e.g. HM-10, JDY-08, AT-09, CC41-A) and an Arduino Uno. Wire it and upload the
[bridge sketch](https://github.com/loginov-rocks/Web-Bluetooth-Terminal/blob/main/firmware/Arduino-Bridge/Arduino-Bridge.ino).

Pay attention to what voltage level your BLE module consumes, since it can vary from device to device! Read
specifications, you may need to connect your BLE module to the `3.3V` pin and use voltage level shifter between `TX` and
`RX` pins.

![Arduino Uno to BLE module wiring scheme](https://raw.githubusercontent.com/loginov-rocks/Web-Bluetooth-Terminal/main/firmware/Arduino-Bridge/Scheme.png)

Open Serial Monitor in Arduino IDE, switch baudrate to `9600` and line endings to `Both NL & CR`. Next, launch the
[Web Bluetooth Terminal](https://loginov-rocks.github.io/Web-Bluetooth-Terminal/) and connect to your module. Now you're
able to make a small talk between the Terminal and the Serial Monitor!

#### BLE module configuration

When a BLE module is waiting for connection it can be configured with `AT` commands. So if you have troubles trying to
make BLE module work as expected you can use following commands, but again, read specifications! Here are some commands
I use with CC41-A module:

* `AT+DEFAULT` — resets the module to the defaults;
* `AT+RESET` — resets the module softly;
* `AT+ROLE` — gets the module working mode;
* `AT+ROLE0` — makes the module to work in slave mode, waiting for connection from other devices;
* `AT+NAME` — gets the module name;
* `AT+NAMESimon` — sets the module name to `Simon`;
* `AT+PIN` — gets the module pin (password);
* `AT+PIN123456` — sets the module pin to `123456`;
* `AT+UUID` — gets the module service UUID;
* `AT+CHAR` — gets the module characteristic UUID.

Commands can be case insensitive and may need to be terminated with `CR` (`\r`) and `LF` (`\n`).

## How to use this app as a base for my own project?

You can fork this repository and implement features specific to your needs. Don't forget that application should be
accessible via HTTPS protocol to enable Web Bluetooth API feature, so you can use
[GitHub Pages](https://pages.github.com) switching the source to the `gh-pages` branch of your repository.

To use development capabilities, you'll need [Node.js](https://nodejs.org), [npm](https://www.npmjs.com) especially.
Install it, clone the repository and install `npm` dependencies:

```sh
git clone https://github.com/loginov-rocks/Web-Bluetooth-Terminal.git
cd Web-Bluetooth-Terminal
npm install
```

### Npm scripts

After installing `npm` dependencies, you can use some simple scripts that can be helpful:

* `npm run build` copies used vendors files and generates `css/style.css`;
* `npm run js:vendor` copies used vendors JavaScript files into the `js` directory;
* `npm run lint` lints JavaScript files;
* `npm run styles` generates `css/style.css` from SCSS sources placed in the `scss` directory;
* `npm run styles:vendor` copies used vendors stylesheets into the `css` directory;
* `npm run watch:styles` watches for changes made to the files placed in the `scss` directory and runs `npm run styles`
command.

### BluetoothTerminal.js API

Also, you can install [bluetooth-terminal](https://github.com/loginov-rocks/bluetooth-terminal) package or
[directly download the file](https://www.npmjs.com/package/bluetooth-terminal?activeTab=code) (`dist/BluetoothTerminal.js`)
containing `BluetoothTerminal` class written in ES6 and use it as you want. Here is a simple code snippet that can be
helpful for a quick start:

```js
// Create a BluetoothTerminal instance with the default configuration.
const bluetoothTerminal = new BluetoothTerminal();

// Set a callback that will be called when an incoming message from the
// connected device is received.
bluetoothTerminal.onReceive((message) => {
  console.info(`Message received: "${message}"`);
});

// Open the browser Bluetooth device picker to select a device if none was
// previously selected, establish a connection with the selected device, and
// initiate communication.
bluetoothTerminal.connect()
  .then(() => {
    // Retrieve the name of the currently connected device.
    console.info(`Device "${this.getDeviceName()}" successfully connected`);
    
    // Send a message to the connected device.
    return bluetoothTerminal.send('Simon says: Hello, world!');
  });

// Later, disconnect from the currently connected device and clean up
// associated resources.
// bluetoothTerminal.disconnect();
```

## Reference

1. [Web Bluetooth Specification](https://webbluetoothcg.github.io/web-bluetooth/)
2. [Web Bluetooth Samples](https://googlechrome.github.io/samples/web-bluetooth/)
3. [Interact with Bluetooth devices on the Web](https://developer.chrome.com/docs/capabilities/bluetooth)
4. [Progressive Web Apps](https://web.dev/explore/progressive-web-apps)
5. [Service Worker Toolbox](https://github.com/GoogleChromeLabs/sw-toolbox/)

## Gists

1. https://gist.github.com/loginov-rocks/8aeb19f207b1da53eaa553faa7aa8a51
2. https://gist.github.com/loginov-rocks/c0709f22540c01cf532ec0d311f059e2
3. https://gist.github.com/loginov-rocks/0e4ff696195863e99853b126aca8ecb1
4. https://gist.github.com/loginov-rocks/ad98c6a48394d48c3252d7694ffb5e57
5. https://gist.github.com/loginov-rocks/1156e4581ec9f68a20cc6acb1cd6e52a
6. https://gist.github.com/loginov-rocks/26d9714acbfbcb723c79bb8e23128e3c
7. https://gist.github.com/loginov-rocks/f918a2b11b98d20808a12a8c923e74bc
8. https://gist.github.com/loginov-rocks/d23a840d2c38b88ed3f55f2be62bf7ba
9. https://gist.github.com/loginov-rocks/4cf8d0d720dafcf52781748d5c975452
10. https://gist.github.com/loginov-rocks/fa0478f085410d1f59ede2f653af0e5c
11. https://gist.github.com/loginov-rocks/44c7a144a1548ab08426bc675854d183
12. https://gist.github.com/loginov-rocks/e03b1dd9e038eaf4eb65413d97a34678
13. https://gist.github.com/loginov-rocks/b39e4e5c6d0c95b404172ad04baf8b28
14. https://gist.github.com/loginov-rocks/140ee65772f87ab775cb94cae850eb3a
15. https://gist.github.com/loginov-rocks/b060cecbe50f09f40e2c29f6e3b7dc67
16. https://gist.github.com/loginov-rocks/c88f7eed3bfaa8685b594a2e19813a43
17. https://gist.github.com/loginov-rocks/58a1b7428f9a3bbc71a49ef36bea6e34
18. https://gist.github.com/loginov-rocks/49e208008b95da9c8de985c15f383dd8
19. https://gist.github.com/loginov-rocks/8451dcae975e746e3283c7190a75441e
20. https://gist.github.com/loginov-rocks/f0bd2c16640c9493e19df8262afeb995

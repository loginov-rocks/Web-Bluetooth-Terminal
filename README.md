# Web Bluetooth Terminal

[![devDependencies Status](https://david-dm.org/1oginov/Web-Bluetooth-Terminal/dev-status.svg)](https://david-dm.org/1oginov/Web-Bluetooth-Terminal?type=dev)

![Favicon](https://1oginov.github.io/Web-Bluetooth-Terminal/icons/favicon-16x16.png)
[https://1oginov.github.io/Web-Bluetooth-Terminal](https://1oginov.github.io/Web-Bluetooth-Terminal/) — try it out,
see how it works on [YouTube](https://www.youtube.com/watch?v=BNXN_931W_M) or read tutorial on
[Habrahabr](https://habrahabr.ru/post/339146/)

Web Bluetooth Terminal is a website that can **connect** with the remote devices which support **Bluetooth Low Energy**
(also called Bluetooth Smart) and **exchange data bidirectionally**. It can be installed on your homescreen as an
application and work offline.

**Killer feature:** the application establishes **serial communication** over BLE that is not provided by the
specification, but needed if you want to make your own BLE IoT devices using affordable bluetooth modules.

![Teaser](https://raw.githubusercontent.com/1oginov/Web-Bluetooth-Terminal/master/misc/Teaser.png)

The application utilises BLE service (`0xFFE0`) and characteristic (`0xFFE1`) available in low cost BLE modules based
for example on CC2541 chip, such as HM-10, JDY-08, AT-09, CC41-A and other. Also, it bypasses 20 bytes limit specific
for GATT characteristics by keeping incoming messages in a buffer and waiting for the end of line characters.

Check [Bluetooth Low Energy (Smart) device](#bluetooth-low-energy-smart-device) and
[How to use this app as a base for my own project or to contribute?](#how-to-use-this-app-as-a-base-for-my-own-project-or-to-contribute)
sections for a quick start and to find out how to make your own project. Also, I've made
[MeArm Controller](https://github.com/1oginov/MeArm-Controller) as a showcase project.

## Features

**Accessible via browser** — just go to the [website](https://1oginov.github.io/Web-Bluetooth-Terminal/) and you'll get
the full-featured application, it is not needed to install anything.

**Cross-platform** — as long as the app is accessible via browser, you can use it with the desktop or with the smart
phone [browser](#browser).

**Installable** — if you don't want to remember the website address, you can add it to the homescreen.

**Works offline** after installation on your homescreen, because it is Progressive Web Application.

And... it have **auto scrolling!** Enabled by default, but you can scroll the terminal to the top on more than a half of
the terminal's window height to disable it. Scroll to the bottom to enable it again. Rocket science!

## Requirements

### Browser

One of browsers which supports Web Bluetooth API by default
([Chrome Platform Status](https://www.chromestatus.com/feature/5264933985976320/),
[Can I use](http://caniuse.com/#feat=web-bluetooth)):

1. Chrome for desktop 56+
2. Chrome for Android 56+
3. Opera 43+
4. Opera for Android 43+

All this browsers supports other necessary features, such as [ES6 classes](http://caniuse.com/#feat=es6-class) and PWA
capabilities ([Web App Manifest](http://caniuse.com/#feat=web-app-manifest) and
[Service Workers](http://caniuse.com/#feat=serviceworkers)), so I don't pay attention to this here.

### Bluetooth Low Energy (Smart) device

Different BLE devices implements their own services and characteristics to communicate with, but you can build your own
simple device: you just need a BLE module (e.g. HM-10, JDY-08, AT-09, CC41-A) and an Arduino Uno. Wire it and upload the
[bridge sketch](https://raw.githubusercontent.com/1oginov/Web-Bluetooth-Terminal/master/misc/Arduino-Bridge/Arduino-Bridge.ino).

Pay attention to what voltage level your BLE module consuming, since this can vary from device to device! Read a
specifications, you may need to connect your BLE module to the `3.3V` pin and use voltage level shifter between `TX` and
`RX` pins.

![Arduino Uno to BLE module wiring scheme](https://raw.githubusercontent.com/1oginov/Web-Bluetooth-Terminal/master/misc/Arduino-Bridge/Scheme.png)

Open the Serial Monitor in Arduino IDE, switch baudrate to `9600` and line endings to `Both NL & CR`. Next, launch the
[Web Bluetooth Terminal](https://1oginov.github.io/Web-Bluetooth-Terminal/) and connect to your module. Now you're able
to make small talk between the Terminal and the Serial Monitor!

#### BLE module configuration

When the BLE module is waiting for connection it can be configured with `AT` commands. So if you have troubles trying to
make BLE module work as expected you can use following commands, but again, read a specifications! Here are some
commands that I use with CC41-A module:

* `AT+DEFAULT` — resets the module to the defaults;
* `AT+RESET` — resets the module softly;
* `AT+ROLE` — get the module's working mode;
* `AT+ROLE0` — makes the module to work in slave mode, waiting for connection from other devices;
* `AT+NAME` — gets the module's name;
* `AT+NAMESimon` — sets the module's name to `Simon`;
* `AT+PIN` — gets the module's pin (password);
* `AT+PIN123456` — sets the module's pin to `123456`;
* `AT+UUID` — gets the module's service UUID;
* `AT+CHAR` — gets the module's characteristic UUID.

Commands can be case insensitive and may needs to be terminated with `CR` (`\r`) and `LF` (`\n`).

## How to use this app as a base for my own project or to contribute?

You can fork this repository and implement features specific to your needs. Don't forget that application should be
accessible via HTTPS protocol to enable Web Bluetooth API feature, so you can use
[GitHub Pages](https://pages.github.com/) switching the source to the `master` branch for your repository.

If you want to contribute, please use the [dev](https://github.com/1oginov/Web-Bluetooth-Terminal/tree/dev/) branch. 

To use development capabilities, you'll need [Node.js](https://nodejs.org/), [npm](https://www.npmjs.com/) specifically.
Install it, clone the repository and install `npm` dependencies:

```sh
$ git clone https://github.com/1oginov/Web-Bluetooth-Terminal.git
$ cd Web-Bluetooth-Terminal
$ npm install
```

### npm scripts (tasks)

After installing `npm` dependencies, you can use some simple scripts that can be helpful:

* `npm run build` copies used vendors' files and generates `css/style.css`;
* `npm run js:vendor` copies used vendors' javascript files to the `js` directory;
* `npm run styles` generates `css/style.css` from SCSS sources located in the `scss` directory;
* `npm run styles:vendor` copies used vendors' stylesheets to the `css` directory;
* `npm run watch:styles` watches for changes made to the files located in the `scss` directory and runs `npm run styles`
command.

### BluetoothTerminal.js API

Also, you can install [bluetooth-terminal](https://github.com/1oginov/bluetooth-terminal) package or
[directly download the file](https://raw.githubusercontent.com/1oginov/bluetooth-terminal/master/BluetoothTerminal.js)
containing `BluetoothTerminal` class written in ES6 and use it as you want. Here is a simple code snippet that can be
helpful for a quick start:

```javascript
// Obtain configured instance
let terminal = new BluetoothTeminal();

// Override `receive` method to handle incoming data as you want
terminal.receive = function(data) {
  alert(data);
};

// Request the device for connection and get its name after successful connection
terminal.connect().then(() => {
  alert(terminal.getDeviceName() + ' is connected!');
});

// Send something to the connected device
terminal.send('Simon says: Hello, world!');

// Disconnect from the connected device
terminal.disconnect();
```

## Reference

1. [Web Bluetooth Specification](https://webbluetoothcg.github.io/web-bluetooth/)
2. [Web Bluetooth Samples](https://googlechrome.github.io/samples/web-bluetooth/)
3. [Interact with Bluetooth devices on the Web](https://developers.google.com/web/updates/2015/07/interact-with-ble-devices-on-the-web/)
4. [Progressive Web Apps](https://developers.google.com/web/progressive-web-apps/)
5. [Service Worker Toolbox](https://github.com/GoogleChromeLabs/sw-toolbox/)

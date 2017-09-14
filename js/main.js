const SERVICE_UUID = 0xFFE0;
const CHARACTERISTIC_UUID = 0xFFE1;

let connectButton = document.getElementById('connect');
let disconnectButton = document.getElementById('disconnect');
let consoleContainer = document.getElementById('console');
let terminalContainer = document.getElementById('terminal');
let inputField = document.getElementById('input');
let sendButton = document.getElementById('send');

let bluetoothDevice = null;
let bluetoothCharacteristic = null;

connectButton.addEventListener('click', () => connect(bluetoothDevice));

disconnectButton.addEventListener('click', () => {
  disconnect(bluetoothDevice);

  if (bluetoothCharacteristic) {
    bluetoothCharacteristic.removeEventListener('characteristicvaluechanged',
        handleCharacteristicValueChanged);
    bluetoothCharacteristic = null;
  }

  bluetoothDevice = null;
});

sendButton.addEventListener('click', () => {
  send(bluetoothCharacteristic, inputField.value);
  inputField.value = '';
});

function connect(device) {
  return (device ? Promise.resolve(device) : requestBluetoothDevice()).
      then(connectDeviceAndCacheCharacteristic).
      then(startNotifications).
      catch(error => log(error));
}

function disconnect(device) {
  if (!device) {
    return;
  }

  log('Disconnecting from "' + device.name + '" bluetooth device...');

  device.removeEventListener('gattserverdisconnected', handleDisconnection);

  if (!device.gatt.connected) {
    log('"' + device.name + '" bluetooth device is already disconnected');
    return;
  }

  device.gatt.disconnect();

  log('"' + device.name + '" bluetooth device disconnected');
}

function requestBluetoothDevice() {
  log('Requesting bluetooth device...');

  return navigator.bluetooth.requestDevice({
    filters: [{services: [SERVICE_UUID]}],
  }).
      then(device => {
        log('"' + device.name + '" bluetooth device selected');

        bluetoothDevice = device; // remember device
        bluetoothDevice.addEventListener('gattserverdisconnected',
            handleDisconnection);

        return bluetoothDevice;
      });
}

function connectDeviceAndCacheCharacteristic(device) {
  if (device.gatt.connected && bluetoothCharacteristic) { // check remembered characteristic
    return Promise.resolve(bluetoothCharacteristic);
  }

  log('Connecting to GATT server...');

  return device.gatt.connect().
      then(server => {
        log('GATT server connected', 'Getting service...');

        return server.getPrimaryService(SERVICE_UUID);
      }).
      then(service => {
        log('Service found', 'Getting characteristic...');

        return service.getCharacteristic(CHARACTERISTIC_UUID);
      }).
      then(characteristic => {
        log('Characteristic found');

        bluetoothCharacteristic = characteristic; // remember characteristic

        return bluetoothCharacteristic;
      });
}

function startNotifications(characteristic) {
  log('Starting notifications...');

  return characteristic.startNotifications().
      then(() => {
        log('Notifications started');

        characteristic.addEventListener('characteristicvaluechanged',
            handleCharacteristicValueChanged);
      });
}

function stopNotifications(characteristic) {
  log('Stopping notifications...');

  return characteristic.stopNotifications().
      then(() => {
        log('Notifications stopped');

        characteristic.removeEventListener('characteristicvaluechanged',
            handleCharacteristicValueChanged);
      });
}

function handleDisconnection(event) {
  let device = event.target;

  log('"' + device.name +
      '" bluetooth device disconnected, trying to reconnect...');

  connectDeviceAndCacheCharacteristic(device).
      then(startNotifications).
      catch(error => log(error));
}

function handleCharacteristicValueChanged(event) {
  let value = new TextDecoder().decode(event.target.value);

  logToTerminal('> ' + value);
}

function send(characteristic, message) {
  if (!characteristic) {
    return;
  }

  logToTerminal('< ' + message);

  characteristic.writeValue(str2ab(message + '\n'));
}

function log(...messages) {
  let html = messages.join('<br>') + '<br>';

  messages.forEach(message => console.log(message));
  consoleContainer.insertAdjacentHTML('beforeend', html);
}

function logToTerminal(message) {
  let html = message + '<br>';

  terminalContainer.insertAdjacentHTML('beforeend', html);
}

function str2ab(str) {
  let buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
  let bufView = new Uint16Array(buf);

  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }

  return buf;
}

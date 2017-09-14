const SERVICE_UUID = 0xFFE0;
const CHARACTERISTIC_UUID = 0xFFE1;

let connectionButton = document.getElementById('connection');
let consoleDiv = document.getElementById('console');

let bluetoothDevice = null;
let bluetoothCharacteristic = null;

connectionButton.addEventListener('click', function(event) {
  return (bluetoothDevice ? Promise.resolve() : requestBluetoothDevice()).
      then(connectDeviceAndCacheCharacteristic).
      catch(error => log(error));
});

function requestBluetoothDevice() {
  log('Requesting bluetooth device...');

  return navigator.bluetooth.requestDevice({
    filters: [{services: [SERVICE_UUID]}],
  }).
      then(device => {
        log('Bluetooth device found');

        bluetoothDevice = device;
        bluetoothDevice.addEventListener('gattserverdisconnected',
            handleDisconnection);

        return bluetoothDevice;
      });
}

function connectDeviceAndCacheCharacteristic() {
  if (bluetoothDevice.gatt.connected && bluetoothCharacteristic) {
    return Promise.resolve();
  }

  log('Connecting to GATT server...');

  return bluetoothDevice.gatt.connect().
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

        bluetoothCharacteristic = characteristic;

        return bluetoothCharacteristic;
      });
}

function log(...messages) {
  let html = messages.join('<br>') + '<br>';

  messages.forEach(message => console.log(message));
  consoleDiv.insertAdjacentHTML('beforeend', html);
}

function handleDisconnection() {
  log('Bluetooth device disconnected');

  return connectDeviceAndCacheCharacteristic().
      catch(error => log(error));
}

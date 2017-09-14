const SERVICE_UUID = 0xFFE0;
const CHARACTERISTIC_UUID = 0xFFE1;

let connectionButton = document.getElementById('connection');
let consoleDiv = document.getElementById('console');

connectionButton.addEventListener('click', function(event) {
  connect();
});

function connect() {
  return navigator.bluetooth.requestDevice({
    filters: [{services: [SERVICE_UUID]}],
  }).
      then(device => {
        log('Device connected');
        console.log(device);
        return device.gatt.connect();
      }).
      then(server => {
        log('Server connected');
        console.log(server);
        return server.getPrimaryService(SERVICE_UUID);
      }).
      then(service => {
        log('Service found');
        console.log(service);
        return service.getCharacteristic(CHARACTERISTIC_UUID);
      }).
      then(characteristic => {
        log('Characteristic found');
        console.log(characteristic);
        return characteristic;
      }).
      catch(error => {
        log(error);
      });
}

function log(text) {
  let html = text + '<br>';

  console.log(text);
  consoleDiv.insertAdjacentHTML('beforeend', html);
}

class BluetoothConnection {
  constructor(serviceUuid, characteristicUuid) {
    /**
     * String representing end of line for output data
     * @type {string}
     * @private
     */
    _writeEol = '\r\n';

    /**
     * Character representing end of line for input data
     * @type {string}
     * @private
     */
    _readEol = '\n';

    /**
     * Buffer containing not ended input data
     * @type {string}
     * @private
     */
    _readBuffer = '';

    this._device = null;
    this._characteristic = null;

    this._boundHandleDisconnection = this._handleDisconnection.bind(this);
    this._boundHandleCharacteristicValueChanged =
        this._handleCharacteristicValueChanged.bind(this);

    this._serviceUuid = serviceUuid;
    this._characteristicUuid = characteristicUuid;

    // TODO: Separate UI from model
    this._consoleContainer = document.getElementById('console');
    this._terminalContainer = document.getElementById('terminal');
  }

  connect() {
    return this._connectToDevice(this._device);
  }

  disconnect() {
    this._disconnectFromDevice(this._device);

    if (this._characteristic) {
      this._characteristic.removeEventListener('characteristicvaluechanged',
          this._boundHandleDisconnection);
      this._characteristic = null;
    }

    this._device = null;
  }

  _connectToDevice(device) {
    return (device ? Promise.resolve(device) : this._requestBluetoothDevice()).
        then(device => this._connectDeviceAndCacheCharacteristic(device)).
        then(characteristic => this._startNotifications(characteristic)).
        catch(error => this._log(error));
  }

  _disconnectFromDevice(device) {
    if (!device) {
      return;
    }

    this._log('Disconnecting from "' + device.name + '" bluetooth device...');

    device.removeEventListener('gattserverdisconnected',
        this._boundHandleDisconnection);

    if (!device.gatt.connected) {
      this._log('"' + device.name +
          '" bluetooth device is already disconnected');
      return;
    }

    device.gatt.disconnect();

    this._log('"' + device.name + '" bluetooth device disconnected');
  }

  _requestBluetoothDevice() {
    this._log('Requesting bluetooth device...');

    return navigator.bluetooth.requestDevice({
      filters: [{services: [this._serviceUuid]}],
    }).
        then(device => {
          this._log('"' + device.name + '" bluetooth device selected');

          this._device = device; // remember device
          this._device.addEventListener('gattserverdisconnected',
              this._boundHandleDisconnection);

          return this._device;
        });
  }

  _connectDeviceAndCacheCharacteristic(device) {
    if (device.gatt.connected && this._characteristic) { // check remembered characteristic
      return Promise.resolve(this._characteristic);
    }

    this._log('Connecting to GATT server...');

    return device.gatt.connect().
        then(server => {
          this._log('GATT server connected', 'Getting service...');

          return server.getPrimaryService(this._serviceUuid);
        }).
        then(service => {
          this._log('Service found', 'Getting characteristic...');

          return service.getCharacteristic(this._characteristicUuid);
        }).
        then(characteristic => {
          this._log('Characteristic found');

          this._characteristic = characteristic; // remember characteristic

          return this._characteristic;
        });
  }

  _startNotifications(characteristic) {
    this._log('Starting notifications...');

    return characteristic.startNotifications().
        then(() => {
          this._log('Notifications started');

          characteristic.addEventListener('characteristicvaluechanged',
              this._boundHandleCharacteristicValueChanged);
        });
  }

  _stopNotifications(characteristic) {
    this._log('Stopping notifications...');

    return characteristic.stopNotifications().
        then(() => {
          this._log('Notifications stopped');

          characteristic.removeEventListener('characteristicvaluechanged',
              this._boundHandleCharacteristicValueChanged);
        });
  }

  _handleDisconnection(event) {
    let device = event.target;

    this._log('"' + device.name +
        '" bluetooth device disconnected, trying to reconnect...');

    this._connectDeviceAndCacheCharacteristic(device).
        then(characteristic => this._startNotifications(characteristic)).
        catch(error => this._log(error));
  }

  _handleCharacteristicValueChanged(event) {
    let value = new TextDecoder().decode(event.target.value);

    for (let c of value) {
      if (c === this._readEol) {
        let data = this._readBuffer.trim();
        this._readBuffer = '';

        if (data) {
          this._logIncoming(data);
          this._getData(data);
        }
      }
      else {
        this._readBuffer += c;
      }
    }
  }

  _getData(data) {
    // Handle incoming data here
  }

  send(message) {
    if (!this._characteristic) {
      return;
    }

    this._sendToCharacteristic(this._characteristic, message);
  }

  _sendToCharacteristic(characteristic, message) {
    this._logOutcoming(message);

    // End of line ('\r\n') added here because without it Chrome not sending
    // data appropriately, it is discovered empirically, no documentation
    // provided, so it can be changed at some time
    characteristic.writeValue(this.constructor._str2ab(message +
        this._writeEol));
  }

  _log(...messages) {
    let html = messages.join('<br>') + '<br>';

    messages.forEach(message => console.log(message));

    // TODO: Separate UI from model
    this._consoleContainer.insertAdjacentHTML('beforeend', html);
  }

  _logIncoming(data) {
    // TODO: Separate output logic
    this._logToTerminal('> ' + data);
  }

  _logOutcoming(data) {
    // TODO: Separate output logic
    this._logToTerminal('< ' + data);
  }

  _logToTerminal(message) {
    let html = message + '<br>';

    // TODO: Separate UI from model
    this._terminalContainer.insertAdjacentHTML('beforeend', html);
  }

  static _str2ab(str) {
    let buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
    let bufView = new Uint8Array(buf);

    for (let i = 0, strLen = str.length; i < strLen; i++) {
      bufView[i] = str.charCodeAt(i);
    }

    return buf;
  }
}

let connection = new BluetoothConnection(0xFFE0, 0xFFE1);

let connectButton = document.getElementById('connect');
let disconnectButton = document.getElementById('disconnect');
let inputField = document.getElementById('input');
let sendButton = document.getElementById('send');

connectButton.addEventListener('click', () => connection.connect());

disconnectButton.addEventListener('click', () => connection.disconnect());

sendButton.addEventListener('click', () => {
  connection.send(inputField.value);
  inputField.value = '';
});

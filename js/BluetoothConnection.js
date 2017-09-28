/**
 * BluetoothConnection class
 */
class BluetoothConnection {
  /**
   * Constructor
   *
   * @param {number} serviceUuid Service UUID
   * @param {number} characteristicUuid Characteristic UUID
   */
  constructor(serviceUuid, characteristicUuid) {
    /**
     * String representing end of line for output data
     * @type {string}
     * @private
     */
    this._writeEol = '\n';

    /**
     * Character representing end of line for input data
     * @type {string}
     * @private
     */
    this._readEol = '\n';

    /**
     * Buffer containing not ended input data
     * @type {string}
     * @private
     */
    this._readBuffer = '';

    /**
     * Max characteristic value length
     * @type {number}
     * @private
     */
    this._maxCharacteristicValueLength = 20;

    /**
     * Write to characteristic delay
     * @type {number}
     * @private
     */
    this._writeToCharacteristicDelay = 100;

    this._device = null; // device object cache
    this._characteristic = null; // characteristic object cache

    // Bound functions used to add and remove appropriate event handlers
    this._boundHandleDisconnection = this._handleDisconnection.bind(this);
    this._boundHandleCharacteristicValueChanged =
        this._handleCharacteristicValueChanged.bind(this);

    this._serviceUuid = serviceUuid;
    this._characteristicUuid = characteristicUuid;
  }

  /**
   * Launch bluetooth device selector and connect to the selected device
   *
   * @returns {Promise} Promise which will be fulfilled when notifications will
   *                    be started
   */
  connect() {
    return this._connectToDevice(this._device);
  }

  /**
   * Disconnect from the connected device
   */
  disconnect() {
    this._disconnectFromDevice(this._device);

    if (this._characteristic) {
      this._characteristic.removeEventListener('characteristicvaluechanged',
          this._boundHandleCharacteristicValueChanged);
      this._characteristic = null;
    }

    this._device = null;
  }

  /**
   * Send data to the connected device
   *
   * @param {string} data Data
   * @returns {boolean} Is sent
   */
  send(data) {
    data = String(data);

    if (!data || !this._characteristic) {
      return false;
    }

    data += this._writeEol;

    if (data.length > this._maxCharacteristicValueLength) {
      let chunks = this.constructor._splitByLength(data,
          this._maxCharacteristicValueLength);

      this._writeToCharacteristic(this._characteristic, chunks[0]);

      for (let i = 1; i < chunks.length; i++) {
        setTimeout(() => {
          this._writeToCharacteristic(this._characteristic, chunks[i]);
        }, i * this._writeToCharacteristicDelay);
      }
    }
    else {
      this._writeToCharacteristic(this._characteristic, data);
    }

    return true;
  }

  /**
   * Data receiving handler which called whenever the new data comes from
   * the connected device, override this to handle incoming data
   *
   * @param {string} data Data
   */
  receive(data) {
    // Handle incoming data
  }

  /**
   * Get the connected device name
   *
   * @returns {string}
   */
  getDeviceName() {
    if (!this._device) {
      return '';
    }

    return this._device.name;
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
          this.receive(data);
        }
      }
      else {
        this._readBuffer += c;
      }
    }
  }

  _writeToCharacteristic(characteristic, data) {
    characteristic.writeValue(new TextEncoder().encode(data));
  }

  _log(...messages) {
    messages.forEach(message => console.log(message));
  }

  static _splitByLength(string, length) {
    return string.match(new RegExp('(.|[\r\n]){1,' + length + '}', 'g'));
  }
}

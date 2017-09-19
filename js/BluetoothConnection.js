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
    this._writeEol = '\r\n';

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
          this._boundHandleDisconnection);
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
    if (!data || !this._characteristic) {
      return false;
    }

    this._writeToCharacteristic(this._characteristic, String(data));

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
    // End of line ('\r\n') added here because without it Chrome not sending
    // data appropriately, it is discovered empirically, no documentation
    // provided, so it can be changed at some time
    characteristic.writeValue(this.constructor._str2ab(data + this._writeEol));
  }

  _log(...messages) {
    messages.forEach(message => console.log(message));
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

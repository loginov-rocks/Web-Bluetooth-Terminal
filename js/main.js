class BluetoothApplication extends BluetoothConnection {
  constructor(serviceUuid, characteristicUuid) {
    super(serviceUuid, characteristicUuid);

    this._consoleContainer = document.getElementById('console');
    this._terminalContainer = document.getElementById('terminal');
  }

  send(data) {
    if (super.send(data)) {
      this._logToTerminal('< ' + data);
    }
  }

  receive(data) {
    this._logToTerminal('> ' + data);
  }

  _log(...messages) {
    super._log(...messages);

    let html = messages.join('<br>') + '<br>';
    this._consoleContainer.insertAdjacentHTML('beforeend', html);
  }

  _logToTerminal(message) {
    let html = message + '<br>';
    this._terminalContainer.insertAdjacentHTML('beforeend', html);
  }
}

let connection = new BluetoothApplication(0xFFE0, 0xFFE1);

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

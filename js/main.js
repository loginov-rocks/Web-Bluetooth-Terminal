// UI elements
let connectButton = document.getElementById('connect');
let disconnectButton = document.getElementById('disconnect');

let deviceNameLabel = document.getElementById('device-name');
let terminalContainer = document.getElementById('terminal');
let consoleContainer = document.getElementById('console');

let inputField = document.getElementById('input');
let sendButton = document.getElementById('send');

// Helpers
function logToTerminal(message) {
  let html = message + '<br>';
  terminalContainer.insertAdjacentHTML('beforeend', html);
}

// Create bluetooth connection instance
let connection = new BluetoothConnection(0xFFE0, 0xFFE1);

// Implement own send function to log outcoming data to the terminal element
function send(data) {
  if (connection.send(data)) {
    logToTerminal('< ' + data);
  }
}

// Override receive method to log incoming data to the terminal element
connection.receive = function(data) {
  logToTerminal('> ' + data);
};

// Override connection's log method to output messages to the console element
connection._log = function(...messages) {
  // We cannot use `super._log()` here
  messages.forEach(message => console.log(message));

  let html = messages.join('<br>') + '<br>';
  consoleContainer.insertAdjacentHTML('beforeend', html);
};

// Bind event listeners to the UI elements
connectButton.addEventListener('click', function() {
  connection.connect().
      then(() => {
        deviceNameLabel.textContent = connection.getDeviceName();
      });
});

disconnectButton.addEventListener('click', function() {
  connection.disconnect();
  deviceNameLabel.textContent = '';
});

sendButton.addEventListener('click', function() {
  send(inputField.value);
  inputField.value = '';
});

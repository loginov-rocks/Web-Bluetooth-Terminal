// UI elements
let connectButton = document.getElementById('connect');
let disconnectButton = document.getElementById('disconnect');

let deviceNameLabel = document.getElementById('device-name');
let terminalContainer = document.getElementById('terminal');

let inputField = document.getElementById('input');
let sendButton = document.getElementById('send');

// Helpers
let defaultDeviceName = 'Terminal';

function logToTerminal(message, type = '') {
  let element = '<div' + (type ? ' class="' + type + '"' : '') + '>' + message +
      '</div>';
  terminalContainer.insertAdjacentHTML('beforeend', element);
}

// Create bluetooth connection instance
let connection = new BluetoothConnection(0xFFE0, 0xFFE1);

// Implement own send function to log outcoming data to the terminal element
function send(data) {
  if (connection.send(data)) {
    logToTerminal(data, 'out');
  }
}

// Override receive method to log incoming data to the terminal element
connection.receive = function(data) {
  logToTerminal(data, 'in');
};

// Override connection's log method to output messages to the console element
connection._log = function(...messages) {
  // We cannot use `super._log()` here
  messages.forEach(message => {
    console.log(message);
    logToTerminal(message);
  });
};

// Bind event listeners to the UI elements
connectButton.addEventListener('click', function() {
  connection.connect().
      then(() => {
        deviceNameLabel.textContent = connection.getDeviceName() ?
            connection.getDeviceName() : defaultDeviceName;
      });
});

disconnectButton.addEventListener('click', function() {
  connection.disconnect();
  deviceNameLabel.textContent = defaultDeviceName;
});

sendButton.addEventListener('click', function() {
  send(inputField.value);
  inputField.value = '';
});

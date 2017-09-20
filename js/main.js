// UI elements
let deviceNameLabel = document.getElementById('device-name');
let connectButton = document.getElementById('connect');
let disconnectButton = document.getElementById('disconnect');
let terminalContainer = document.getElementById('terminal');
let sendForm = document.getElementById('send-form');
let inputField = document.getElementById('input');

// Helpers
let defaultDeviceName = 'Terminal';
let terminalAutoScrollingLimit = terminalContainer.offsetHeight / 2;
let isTerminalAutoScrolling = true;

function scrollElement(element) {
  let scrollTop = element.scrollHeight - element.offsetHeight;

  if (scrollTop > 0) {
    element.scrollTop = scrollTop;
  }
}

function logToTerminal(message, type = '') {
  let element = '<div' + (type ? ' class="' + type + '"' : '') + '>' + message +
      '</div>';

  terminalContainer.insertAdjacentHTML('beforeend', element);

  if (isTerminalAutoScrolling) {
    scrollElement(terminalContainer);
  }
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

sendForm.addEventListener('submit', function(event) {
  event.preventDefault();

  send(inputField.value);

  inputField.value = '';
  inputField.focus();
});

// Switch terminal auto scrolling if it scrolls out of bottom
terminalContainer.addEventListener('scroll', function() {
  let scrollTopOffset = terminalContainer.scrollHeight -
      terminalContainer.offsetHeight - terminalAutoScrollingLimit;

  isTerminalAutoScrolling = (scrollTopOffset < terminalContainer.scrollTop);
});

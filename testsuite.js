const net = require('net');

const HOST = '127.0.0.1'; // or the server IP
const PORT = 16834;

const client = net.createConnection({ host: HOST, port: PORT }, () => {
  console.log(`Connected to ${HOST}:${PORT}`);

  // Send the "reset" command
  client.write('getcurrentsplitname\n'); // \n if the server expects newline-delimited commands
});

// Handle server responses
client.on('data', (data) => {
  console.log('Server says:', data.toString());
});

// Handle disconnect
client.on('end', () => {
  console.log('Disconnected from server');
});

// Handle errors
client.on('error', (err) => {
  console.error('Error:', err.message);
});

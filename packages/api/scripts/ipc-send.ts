// file: scripts/send-ipc-message.ts
import net from 'node:net';

const [socketPath, message] = process.argv.slice(2);

if (!socketPath || !message) {
  console.error('[send-ipc-message] Usage: <socketPath> <message>');
  process.exit(1);
}

const client = net.createConnection(socketPath);

client.on('connect', () => {
  client.write(message + '\n', () => {
    setTimeout(() => {
      client.end();
    }, 100);
  });
});

client.on('error', (err) => {
  console.error('[send-ipc-message] Error:', err.message);
});

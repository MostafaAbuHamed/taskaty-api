const http = require('node:http');
const app = require('./app.js');

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`Taskaty API listening on http://localhost:${PORT}`);
});

server.on('error', (err) => {
  // The common one is EADDRINUSE: the port is already taken.
  console.error(`Server failed to start: ${err.message}`);
  process.exit(1);
});

// Graceful shutdown: stop accepting new connections, let in-flight ones finish,
// then exit. Without this, Ctrl+C kills the process mid-request.
function shutdown(signal) {
  console.log(`\n${signal} received, shutting down.`);
  server.close(() => {
    console.log('Closed remaining connections.');
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

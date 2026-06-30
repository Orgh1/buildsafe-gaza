'use strict';

const app = require('./app');
const { PORT } = require('./config');

const server = app.listen(PORT, () => {
  console.log(`\n  BuildSafe Gaza is running:  http://localhost:${PORT}\n`);
});

// Graceful shutdown
function shutdown(signal) {
  console.log(`\n${signal} received — shutting down...`);
  server.close(() => process.exit(0));
}
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

module.exports = server;

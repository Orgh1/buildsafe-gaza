'use strict';

const app = require('./app');
const db = require('./db');
const { PORT } = require('./config');

// Auto-seed demo data on a fresh/empty database (helps first run, teammates, and cloud deploys)
try {
  const empty = db.prepare('SELECT COUNT(*) AS n FROM engineers').get().n === 0;
  if (empty) {
    require('./db/seed').seed();
    console.log('Initialized empty database with demo data.');
  }
} catch (err) {
  console.error('Auto-seed skipped:', err.message);
}

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

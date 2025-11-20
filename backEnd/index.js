// Entry point: only import app and start the server
const { app, PORT } = require('./src/app');
const { initCron } = require('./src/cron');

// Global handlers to avoid silent crashes in development
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception thrown:', err);
});

app.listen(PORT, async () => {
  console.log(`Polymarket backend running on port ${PORT}`);
  // start cron
  await initCron();
  console.log('Cron job started');
});

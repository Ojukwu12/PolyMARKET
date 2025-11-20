// cron.js – run by node-cron every 10 minutes
const cron = require('node-cron');
const marketStore = require('./services/marketStore.service');
const { connect } = require('./config/db');

async function initCron() {
  await connect();
  // every 10 minutes
  cron.schedule('*/10 * * * *', async () => {
    console.log('Running market sync cron...');
    try {
      await marketStore.syncMarkets();
      console.log('Market sync complete');
    } catch (err) {
      console.error('Cron error:', err && err.message ? err.message : err);
    }
  });

  // run once immediately at start
  setTimeout(() => {
    console.log('Initial market sync...');
    marketStore.syncMarkets().catch(console.error);
  }, 2000);
}

module.exports = { initCron };

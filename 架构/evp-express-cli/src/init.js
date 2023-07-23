module.exports = async function() {
  console.log('Initializing the server...');
  await require('./config').init();
  require('express-async-errors');
  await require('./utils/knex').init();
}
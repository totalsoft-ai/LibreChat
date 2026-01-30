const path = require('path');
const mongoose = require('mongoose');
require('module-alias')({ base: path.resolve(__dirname, '..', 'api') });
const { Balance, User } = require('~/db/models');
const { askQuestion, silentExit } = require('./helpers');
const connect = require('./connect');

(async () => {
  console.log('\x1b[35m%s\x1b[0m', 'Create Balance Record Script');
  console.log('This script creates a balance record for a user.\n');

  await connect();

  const email = await askQuestion('Enter user email: ');

  // Find user
  const user = await User.findOne({ email }).lean();
  if (!user) {
    console.log('\x1b[31m%s\x1b[0m', `User with email "${email}" not found!`);
    silentExit(1);
    return;
  }

  console.log('\x1b[32m%s\x1b[0m', `Found user: ${user.name || user.username || email}`);
  console.log(`User ID: ${user._id}`);

  // Check if balance already exists
  const existingBalance = await Balance.findOne({ user: user._id });
  if (existingBalance) {
    console.log('\x1b[33m%s\x1b[0m', '\nBalance record already exists!');
    console.log(`Endpoint limits: ${existingBalance.endpointLimits?.length || 0}`);

    const update = await askQuestion('\nDo you want to add/update an endpoint limit? (yes/no): ');
    if (update.toLowerCase() !== 'yes') {
      console.log('\x1b[31m%s\x1b[0m', 'Operation cancelled');
      silentExit(0);
      return;
    }
  }

  console.log('\n\x1b[36m%s\x1b[0m', 'This script creates endpoint-specific limits for a user.');
  console.log('Examples: azureOpenAI, bedrock, Assistant, anthropic, openAI\n');

  const endpoint = await askQuestion('Enter endpoint name: ');
  if (!endpoint) {
    console.log('\x1b[31m%s\x1b[0m', 'Endpoint name is required!');
    silentExit(1);
    return;
  }

  const limitStr = await askQuestion('Enter token credits limit (default: 50000): ');
  const limit = limitStr ? parseInt(limitStr) : 50000;

  if (existingBalance) {
    // Update/add endpoint limit
    const existingLimitIndex = existingBalance.endpointLimits?.findIndex(el => el.endpoint === endpoint);
    if (existingLimitIndex >= 0) {
      existingBalance.endpointLimits[existingLimitIndex].tokenCredits = limit;
      console.log('\x1b[33m%s\x1b[0m', `\nUpdating existing endpoint limit for "${endpoint}"`);
    } else {
      if (!existingBalance.endpointLimits) {
        existingBalance.endpointLimits = [];
      }
      existingBalance.endpointLimits.push({
        endpoint,
        tokenCredits: limit,
        enabled: true,
        autoRefillEnabled: false,
        refillAmount: 0,
        refillIntervalValue: 30,
        refillIntervalUnit: 'days',
        lastRefill: new Date(),
        lastUsed: new Date(),
      });
      console.log('\x1b[32m%s\x1b[0m', `\nAdding new endpoint limit for "${endpoint}"`);
    }
    await existingBalance.save();
    console.log('\x1b[32m%s\x1b[0m', '✓ Endpoint limit updated successfully!');
  } else {
    // Create new balance record with endpoint limit
    const balance = new Balance({
      user: user._id,
      endpointLimits: [{
        endpoint,
        tokenCredits: limit,
        enabled: true,
        autoRefillEnabled: false,
        refillAmount: 0,
        refillIntervalValue: 30,
        refillIntervalUnit: 'days',
        lastRefill: new Date(),
        lastUsed: new Date(),
      }],
    });
    await balance.save();
    console.log('\x1b[32m%s\x1b[0m', '\n✓ Balance record created successfully!');
  }

  console.log('\x1b[35m%s\x1b[0m', `\nEndpoint: ${endpoint}`);
  console.log(`Limit: ${limit} credits`);
  console.log('The user can now see their endpoint limits in Settings → Balance\n');

  silentExit(0);
})();

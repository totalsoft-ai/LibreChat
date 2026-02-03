const path = require('path');
const mongoose = require('mongoose');
const { isEnabled } = require('@librechat/api');
const { User } = require('@librechat/data-schemas').createModels(mongoose);
require('module-alias')({ base: path.resolve(__dirname, '..', 'api') });
const { Balance } = require('~/db/models');
const { askQuestion, silentExit } = require('./helpers');
const connect = require('./connect');

/**
 * Setup Balance Script
 * Configurează balanța pentru utilizatori cu opțiuni de auto-refill
 *
 * Usage:
 *   npm run setup-balance <email> [amount] [autoRefill] [refillAmount] [interval] [intervalUnit]
 *
 * Examples:
 *   npm run setup-balance user@example.com 1000000
 *   npm run setup-balance user@example.com 500000 true 100000 7 days
 *   npm run setup-balance all 1000000 true 50000 1 days
 */

const INTERVAL_UNITS = ['seconds', 'minutes', 'hours', 'days', 'weeks', 'months'];

(async () => {
  await connect();

  console.purple('--------------------------');
  console.purple('Setup Balance & Auto-Refill Configuration');
  console.purple('--------------------------');

  // Check if balance is enabled
  if (!process.env.CHECK_BALANCE || !isEnabled(process.env.CHECK_BALANCE)) {
    console.red('Error: CHECK_BALANCE must be set to true in .env!');
    silentExit(1);
  }

  // Parse arguments
  let email = process.argv[2];
  let amount = process.argv[3];
  let autoRefill = process.argv[4];
  let refillAmount = process.argv[5];
  let refillInterval = process.argv[6];
  let intervalUnit = process.argv[7];

  // Show usage if no arguments
  if (!email) {
    console.orange('Usage: npm run setup-balance <email|all> [amount] [autoRefill] [refillAmount] [interval] [intervalUnit]');
    console.orange('');
    console.orange('Arguments:');
    console.orange('  email          - User email or "all" for all users');
    console.orange('  amount         - Initial balance (default: 20000 = $1 USD)');
    console.orange('  autoRefill     - Enable auto-refill (true/false, default: false)');
    console.orange('  refillAmount   - Amount to refill (default: 20000 = $0.10 USD)');
    console.orange('  interval       - Refill interval value (default: 1)');
    console.orange('  intervalUnit   - Unit: seconds/minutes/hours/days/weeks/months (default: days)');
    console.orange('');
    console.orange('Examples:');
    console.orange('  npm run setup-balance user@example.com 1000000');
    console.orange('  npm run setup-balance user@example.com 500000 true 100000 7 days');
    console.orange('  npm run setup-balance all 1000000 true 50000 1 days');
    console.purple('--------------------------');

    email = await askQuestion('Email (or "all" for all users):');
  }

  // Prompt for missing values
  if (!amount) {
    const input = await askQuestion('Initial balance (default: 20000 credits = $1):');
    amount = input || '20000';
  }
  amount = parseInt(amount);

  if (!autoRefill) {
    const input = await askQuestion('Enable auto-refill? (yes/no, default: no):');
    autoRefill = input.toLowerCase() === 'yes' || input.toLowerCase() === 'true';
  } else {
    autoRefill = autoRefill.toLowerCase() === 'true' || autoRefill.toLowerCase() === 'yes';
  }

  if (autoRefill) {
    if (!refillAmount) {
      const input = await askQuestion('Refill amount (default: 20000 credits = $0.10):');
      refillAmount = input || '20000';
    }
    refillAmount = parseInt(refillAmount);

    if (!refillInterval) {
      const input = await askQuestion('Refill interval value (default: 1):');
      refillInterval = input || '1';
    }
    refillInterval = parseInt(refillInterval);

    if (!intervalUnit) {
      const input = await askQuestion('Interval unit (seconds/minutes/hours/days/weeks/months, default: days):');
      intervalUnit = input || 'days';
    }
    if (!INTERVAL_UNITS.includes(intervalUnit)) {
      console.red(`Error: Invalid interval unit! Must be one of: ${INTERVAL_UNITS.join(', ')}`);
      silentExit(1);
    }
  }

  // Find users
  let users = [];
  if (email.toLowerCase() === 'all') {
    users = await User.find({}).lean();
    console.purple(`Found ${users.length} users`);

    const confirm = await askQuestion(`Update balance for ALL ${users.length} users? (yes/no):`);
    if (confirm.toLowerCase() !== 'yes') {
      console.orange('Operation cancelled');
      silentExit(0);
    }
  } else {
    if (!email.includes('@')) {
      console.red('Error: Invalid email address!');
      silentExit(1);
    }
    const user = await User.findOne({ email }).lean();
    if (!user) {
      console.red(`Error: No user found with email: ${email}`);
      silentExit(1);
    }
    users = [user];
    console.purple(`Found user: ${user.email}`);
  }

  // Update balances
  console.purple('--------------------------');
  console.purple('Updating balances...');
  console.purple('--------------------------');

  let updated = 0;
  let created = 0;
  let errors = 0;

  for (const user of users) {
    try {
      const balanceData = {
        tokenCredits: amount,
        autoRefillEnabled: autoRefill,
        lastRefill: new Date(),
      };

      if (autoRefill) {
        balanceData.refillAmount = refillAmount;
        balanceData.refillIntervalValue = refillInterval;
        balanceData.refillIntervalUnit = intervalUnit;
      }

      const existing = await Balance.findOne({ user: user._id });

      if (existing) {
        await Balance.updateOne({ user: user._id }, { $set: balanceData });
        updated++;
        console.green(`✓ Updated: ${user.email}`);
      } else {
        await Balance.create({
          user: user._id,
          ...balanceData,
        });
        created++;
        console.green(`✓ Created: ${user.email}`);
      }

      // Show details for single user
      if (users.length === 1) {
        console.purple('--------------------------');
        console.purple('Balance Configuration:');
        console.purple(`  Email:              ${user.email}`);
        console.purple(`  Initial Balance:    ${amount} credits ($${(amount / 1000000).toFixed(2)} USD)`);
        console.purple(`  Auto-Refill:        ${autoRefill ? 'Enabled' : 'Disabled'}`);
        if (autoRefill) {
          console.purple(`  Refill Amount:      ${refillAmount} credits ($${(refillAmount / 1000000).toFixed(2)} USD)`);
          console.purple(`  Refill Interval:    ${refillInterval} ${intervalUnit}`);
        }
        console.purple('--------------------------');
      }
    } catch (error) {
      errors++;
      console.red(`✗ Error for ${user.email}: ${error.message}`);
    }
  }

  // Summary
  console.purple('--------------------------');
  console.purple('Summary:');
  console.green(`  Created:  ${created}`);
  console.green(`  Updated:  ${updated}`);
  if (errors > 0) {
    console.red(`  Errors:   ${errors}`);
  }
  console.purple('--------------------------');

  if (users.length > 1) {
    console.purple('Configuration applied:');
    console.purple(`  Balance:            ${amount} credits ($${(amount / 1000000).toFixed(2)} USD)`);
    console.purple(`  Auto-Refill:        ${autoRefill ? 'Enabled' : 'Disabled'}`);
    if (autoRefill) {
      console.purple(`  Refill Amount:      ${refillAmount} credits ($${(refillAmount / 1000000).toFixed(2)} USD)`);
      console.purple(`  Refill Interval:    ${refillInterval} ${intervalUnit}`);
    }
  }

  console.green('\n✓ Balance setup completed!');
  silentExit(0);
})();

process.on('uncaughtException', (err) => {
  if (!err.message.includes('fetch failed')) {
    console.error('Uncaught error:');
    console.error(err);
  }

  if (!err.message.includes('fetch failed')) {
    process.exit(1);
  }
});

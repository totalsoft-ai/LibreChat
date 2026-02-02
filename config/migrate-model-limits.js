/**
 * LEGACY MIGRATION SCRIPT - DEPRECATED
 *
 * This script is kept for reference but should not be used.
 * The field name was changed from 'modelLimits' to 'endpointLimits' in 2025-01-30.
 *
 * Use migrate-endpoint-limits.js instead.
 *
 * Historical note: This script was used to add empty modelLimits arrays to balance
 * records before the naming refactoring to endpointLimits.
 */

const path = require('path');
const mongoose = require('mongoose');
require('module-alias')({ base: path.resolve(__dirname, '..', 'api') });
const { Balance } = require('~/db/models');
const { askQuestion, silentExit } = require('./helpers');
const connect = require('./connect');

(async () => {
  console.log('\x1b[35m%s\x1b[0m', 'Model Limits Migration Script (LEGACY - USE migrate-endpoint-limits.js INSTEAD)');
  console.log(
    "This script will add an empty modelLimits array to all balance records that don't have it.",
  );
  console.log(
    'This is a backward-compatible change that enables per-model limits functionality.\n',
  );

  await connect();

  const totalRecords = await Balance.countDocuments({});
  const recordsWithoutModelLimits = await Balance.countDocuments({
    modelLimits: { $exists: false },
  });

  console.log(`Found ${totalRecords} total balance records`);
  console.log(`Found ${recordsWithoutModelLimits} records without modelLimits field\n`);

  if (recordsWithoutModelLimits === 0) {
    console.log(
      '\x1b[32m%s\x1b[0m',
      'All records already have modelLimits field. No migration needed.',
    );
    silentExit(0);
    return;
  }

  const proceed = await askQuestion('Proceed with migration? (yes/no): ');
  if (proceed.toLowerCase() !== 'yes') {
    console.log('\x1b[31m%s\x1b[0m', 'Migration cancelled');
    silentExit(0);
    return;
  }

  console.log('\nStarting migration...');

  try {
    // Add empty modelLimits array to all records that don't have it
    const result = await Balance.updateMany(
      { modelLimits: { $exists: false } },
      { $set: { modelLimits: [] } },
    );

    console.log('\x1b[32m%s\x1b[0m', '\nMigration completed successfully!');
    console.log('\x1b[35m%s\x1b[0m', `Modified ${result.modifiedCount} records`);

    // Verify migration
    const remainingRecords = await Balance.countDocuments({
      modelLimits: { $exists: false },
    });

    if (remainingRecords === 0) {
      console.log(
        '\x1b[32m%s\x1b[0m',
        'Verification passed: All records now have modelLimits field',
      );
    } else {
      console.log(
        '\x1b[33m%s\x1b[0m',
        `Warning: ${remainingRecords} records still missing modelLimits field`,
      );
    }
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', 'Migration failed:', error);
    silentExit(1);
    return;
  }

  silentExit(0);
})();

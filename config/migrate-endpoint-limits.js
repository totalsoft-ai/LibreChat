const path = require('path');
const mongoose = require('mongoose');
require('module-alias')({ base: path.resolve(__dirname, '..', 'api') });
const { Balance } = require('~/db/models');
const { askQuestion, silentExit } = require('./helpers');
const connect = require('./connect');

(async () => {
  console.log('\x1b[35m%s\x1b[0m', 'Endpoint Limits Migration Script');
  console.log(
    'This script will migrate modelLimits to endpointLimits and update field names within the limits.',
  );
  console.log('It handles two scenarios:');
  console.log('  1. Rename existing modelLimits field to endpointLimits');
  console.log('  2. Update "model" field to "endpoint" within limit objects');
  console.log(
    '  3. Add empty endpointLimits array to records that have neither field\n',
  );

  await connect();

  const totalRecords = await Balance.countDocuments({});
  const recordsWithModelLimits = await Balance.countDocuments({
    modelLimits: { $exists: true },
  });
  const recordsWithEndpointLimits = await Balance.countDocuments({
    endpointLimits: { $exists: true },
  });
  const recordsWithNeither = await Balance.countDocuments({
    modelLimits: { $exists: false },
    endpointLimits: { $exists: false },
  });

  console.log(`Found ${totalRecords} total balance records`);
  console.log(`  - ${recordsWithModelLimits} records with OLD 'modelLimits' field (need migration)`);
  console.log(`  - ${recordsWithEndpointLimits} records with NEW 'endpointLimits' field (already migrated)`);
  console.log(`  - ${recordsWithNeither} records with neither field (need initialization)\n`);

  if (recordsWithModelLimits === 0 && recordsWithNeither === 0) {
    console.log(
      '\x1b[32m%s\x1b[0m',
      'All records already migrated. No migration needed.',
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

  console.log('\nStarting migration...\n');

  try {
    let totalModified = 0;

    // Step 1: Migrate records with modelLimits field to endpointLimits
    if (recordsWithModelLimits > 0) {
      console.log('Step 1: Migrating modelLimits → endpointLimits...');

      // Get all records with modelLimits
      const recordsToMigrate = await Balance.find({
        modelLimits: { $exists: true }
      }).lean();

      console.log(`  Processing ${recordsToMigrate.length} records...`);

      for (const record of recordsToMigrate) {
        const endpointLimits = record.modelLimits.map(limit => {
          // Rename 'model' field to 'endpoint' within each limit object
          const { model, ...rest } = limit;
          return {
            endpoint: model,
            ...rest
          };
        });

        // Update the record: set endpointLimits and remove modelLimits
        await Balance.updateOne(
          { _id: record._id },
          {
            $set: { endpointLimits },
            $unset: { modelLimits: '' }
          }
        );
        totalModified++;
      }

      console.log(`  ✓ Migrated ${totalModified} records from modelLimits to endpointLimits\n`);
    }

    // Step 2: Initialize empty endpointLimits for records with neither field
    if (recordsWithNeither > 0) {
      console.log('Step 2: Initializing empty endpointLimits arrays...');

      const result = await Balance.updateMany(
        {
          modelLimits: { $exists: false },
          endpointLimits: { $exists: false }
        },
        { $set: { endpointLimits: [] } },
      );

      console.log(`  ✓ Initialized ${result.modifiedCount} records with empty endpointLimits\n`);
      totalModified += result.modifiedCount;
    }

    console.log('\x1b[32m%s\x1b[0m', 'Migration completed successfully!');
    console.log('\x1b[35m%s\x1b[0m', `Total modified: ${totalModified} records\n`);

    // Verify migration
    const finalStats = {
      withModelLimits: await Balance.countDocuments({ modelLimits: { $exists: true } }),
      withEndpointLimits: await Balance.countDocuments({ endpointLimits: { $exists: true } }),
      withNeither: await Balance.countDocuments({
        modelLimits: { $exists: false },
        endpointLimits: { $exists: false },
      }),
    };

    console.log('Final verification:');
    console.log(`  - Records with OLD 'modelLimits': ${finalStats.withModelLimits}`);
    console.log(`  - Records with NEW 'endpointLimits': ${finalStats.withEndpointLimits}`);
    console.log(`  - Records with neither: ${finalStats.withNeither}`);

    if (finalStats.withModelLimits === 0 && finalStats.withNeither === 0) {
      console.log('\n\x1b[32m%s\x1b[0m', '✓ Verification passed: All records successfully migrated!');
    } else {
      console.log(
        '\n\x1b[33m%s\x1b[0m',
        `⚠ Warning: ${finalStats.withModelLimits + finalStats.withNeither} records still need migration`,
      );
    }
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', 'Migration failed:', error);
    silentExit(1);
    return;
  }

  silentExit(0);
})();

#!/usr/bin/env node
/**
 * Usage:
 *   DRY RUN:  node scripts/cleanup_db.js --dry
 *   EXECUTE: node scripts/cleanup_db.js --execute
 *
 * Environment variables:
 *   MONGO_URI      (required)
 *   DB_NAME        (optional) default: from the URI
 *   ADMIN_QUERY    (optional) JSON string, e.g. '{"role":"admin"}' or '{"isAdmin":true}'
 *
 * Safety:
 *   - This script will abort unless either --dry or --execute is provided.
 *   - It refuses to execute if ADMIN_QUERY matches 0 documents.
 *   - Always create a backup with mongodump before executing.
 */
const { MongoClient } = require('mongodb');
const argv = require('minimist')(process.argv.slice(2));

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('ERROR: Set MONGO_URI in environment.');
  process.exit(2);
}
const DB_NAME = process.env.DB_NAME || undefined;
const ADMIN_QUERY = process.env.ADMIN_QUERY ? JSON.parse(process.env.ADMIN_QUERY) : { role: 'admin' };

const MODE_DRY = argv.dry === true || argv._.includes('dry') || argv._.includes('--dry');
const MODE_EXEC = argv.execute === true || argv._.includes('execute') || argv._.includes('--execute');

if (!MODE_DRY && !MODE_EXEC) {
  console.error('Specify --dry (report only) or --execute (perform deletion).');
  process.exit(2);
}

(async () => {
  const client = new MongoClient(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    await client.connect();
    const db = DB_NAME ? client.db(DB_NAME) : client.db();
    console.log('Connected to DB:', db.databaseName);
    const collNames = (await db.listCollections({}, { nameOnly: true }).toArray())
      .map(c => c.name)
      .filter(n => !n.startsWith('system.'));

    console.log('Collections found:', collNames.join(', '));

    // Check admins exist
    const usersExists = collNames.includes('users');
    if (!usersExists) {
      console.warn('No users collection found. Admin preservation skipped.');
    } else {
      const adminCount = await db.collection('users').countDocuments(ADMIN_QUERY);
      console.log(`Admin predicate: ${JSON.stringify(ADMIN_QUERY)}, matching admins: ${adminCount}`);
      if (MODE_EXEC && adminCount === 0) {
        throw new Error('ABORT: ADMIN_QUERY matched 0 documents. Refusing to execute to prevent deleting all admin accounts.');
      }
    }

    // Dry run: report what would be deleted
    if (MODE_DRY) {
      console.log('--- DRY RUN REPORT ---');
      for (const coll of collNames) {
        if (coll === 'users' && usersExists) {
          const total = await db.collection(coll).countDocuments();
          const admins = await db.collection(coll).countDocuments(ADMIN_QUERY);
          console.log(`- ${coll}: total=${total}, admins=${admins}, would delete=${total - admins}`);
        } else {
          const total = await db.collection(coll).countDocuments();
          console.log(`- ${coll}: total=${total}, would delete=ALL`);
        }
      }
      console.log('DRY RUN complete. No changes made.');
      return;
    }

    // Execute: perform cleanup
    console.log('--- EXECUTING CLEANUP ---');
    // keep a temporary preserved collection (fail if already present)
    const preservedName = 'preserved_admins';
    const existing = await db.listCollections({ name: preservedName }, { nameOnly: true }).toArray();
    if (existing.length > 0) {
      throw new Error(`${preservedName} already exists. Drop it first or change preservedName.`);
    }

    if (usersExists) {
      const admins = await db.collection('users').find(ADMIN_QUERY).toArray();
      if (admins.length === 0) {
        throw new Error('No admins found for ADMIN_QUERY. Aborting.');
      }
      console.log(`Preserving ${admins.length} admin documents into ${preservedName}`);
      await db.collection(preservedName).insertMany(admins, { ordered: false });
    }

    for (const coll of collNames) {
      if (coll === preservedName) continue;
      if (coll === 'users' && usersExists) {
        const res = await db.collection(coll).deleteMany({ $nor: [ADMIN_QUERY] });
        console.log(`Deleted ${res.deletedCount} non-admin docs from ${coll}`);
      } else {
        const res = await db.collection(coll).deleteMany({});
        console.log(`Cleared ${res.deletedCount} documents from ${coll}`);
      }
    }

    // Reinsert or ensure users collection only contains preserved admins
    if (usersExists) {
      await db.collection('users').deleteMany({});
      const preservedDocs = await db.collection(preservedName).find().toArray();
      if (preservedDocs.length > 0) {
        await db.collection('users').insertMany(preservedDocs);
        console.log(`Reinserted ${preservedDocs.length} preserved admin docs into users`);
      }
      await db.collection(preservedName).drop();
    }

    console.log('Cleanup execution complete.');
  } catch (err) {
    console.error('ERROR:', err);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
})();

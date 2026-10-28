import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI || '';
const options = {};

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

export function isMongoConfigured(): boolean {
  return Boolean(process.env.MONGODB_URI && process.env.MONGODB_URI.trim().startsWith('mongodb'));
}

export async function getMongoClient(): Promise<MongoClient | null> {
  if (!isMongoConfigured()) {
    return null;
  }

  const connectionUri = process.env.MONGODB_URI || uri;

  if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    if (!global._mongoClientPromise) {
      client = new MongoClient(connectionUri, options);
      global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
  } else {
    // In production mode, it's best to not use a global variable.
    if (!clientPromise) {
      client = new MongoClient(connectionUri, options);
      clientPromise = client.connect();
    }
  }

  try {
    return await clientPromise;
  } catch (err) {
    console.error('[MongoDB] Connection error:', err);
    // Reset cached promise so subsequent requests can retry after network/IP access is resolved
    global._mongoClientPromise = undefined;
    clientPromise = null;
    return null;
  }
}

export async function getDb(dbName = 'msi_db'): Promise<Db | null> {
  const client = await getMongoClient();
  if (!client) return null;
  return client.db(process.env.MONGODB_DB_NAME || dbName);
}

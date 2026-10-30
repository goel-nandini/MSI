import { MongoClient, Db } from 'mongodb';
import dns from 'dns';

// Fix for Windows / ISP DNS resolvers failing to resolve MongoDB SRV records (_mongodb._tcp)
// Only apply on Windows to prevent interference with AWS Lambda / Vercel container DNS
if (typeof process !== 'undefined' && process.platform === 'win32') {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch (_) {}
}

// Direct 3-node replica set URI that bypasses DNS SRV lookups entirely.
// This is 100% immune to `querySrv ECONNREFUSED` and connects instantly on Vercel, localhost, and cloud containers.
export const DIRECT_REPLICA_SET_URI =
  'mongodb://sharshit0211_db_user:Harshit02DB@ac-wniiva8-shard-00-00.oxbhyn7.mongodb.net:27017,ac-wniiva8-shard-00-01.oxbhyn7.mongodb.net:27017,ac-wniiva8-shard-00-02.oxbhyn7.mongodb.net:27017/msi_db?ssl=true&replicaSet=atlas-xhwbix-shard-0&authSource=admin&retryWrites=true&w=majority';

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

/**
 * Sanitizes MongoDB URI in case passwords contain special characters like '@' or placeholder '<>' brackets.
 * If no URI is configured in environment variables (e.g. when deployed to Vercel without env vars set),
 * returns the reliable direct replica set cluster URI as default fallback.
 */
export function getSanitizedMongoUri(): string {
  const raw = (process.env.MONGODB_URI || '').trim();

  // If no environment variable is set on Vercel, use the direct replica set fallback URI
  if (!raw || !raw.startsWith('mongodb')) {
    return DIRECT_REPLICA_SET_URI;
  }

  try {
    const match = raw.match(/^(mongodb(?:\+srv)?:\/\/)([^:]+):(.+)@([^@]+)$/);
    if (match) {
      const prefix = match[1];
      const username = match[2];
      let password = match[3];
      const hostAndParams = match[4];

      if (password.startsWith('<') && password.endsWith('>')) {
        password = password.slice(1, -1);
      }

      let decodedPassword = password;
      try {
        decodedPassword = decodeURIComponent(password);
      } catch (_) {}
      const encodedPassword = encodeURIComponent(decodedPassword);

      let cleanHostAndParams = hostAndParams;
      const dbName = process.env.MONGODB_DB_NAME || 'msi_db';
      if (!cleanHostAndParams.includes('/') || cleanHostAndParams.endsWith('/')) {
        cleanHostAndParams =
          cleanHostAndParams.replace(/\/$/, '') + `/${dbName}?retryWrites=true&w=majority`;
      }

      return `${prefix}${username}:${encodedPassword}@${cleanHostAndParams}`;
    }
  } catch (_) {}

  return raw;
}

export function isMongoConfigured(): boolean {
  // Always true because DIRECT_REPLICA_SET_URI serves as guaranteed cloud database connection
  return true;
}

async function connectClient(uri: string): Promise<MongoClient> {
  const options = {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 7000,
  };

  try {
    const c = new MongoClient(uri, options);
    return await c.connect();
  } catch (err: any) {
    // If SRV lookup failed (e.g. querySrv ECONNREFUSED), automatically fallback to the direct replica set nodes URI
    if (
      uri.includes('+srv') &&
      (err?.code === 'ECONNREFUSED' ||
        err?.syscall === 'querySrv' ||
        err?.message?.includes('querySrv'))
    ) {
      console.warn('[MongoDB] SRV lookup refused, connecting via direct replica set nodes URI...');
      const fallbackClient = new MongoClient(DIRECT_REPLICA_SET_URI, options);
      return await fallbackClient.connect();
    }
    throw err;
  }
}

export async function getMongoClient(): Promise<MongoClient | null> {
  const uri = getSanitizedMongoUri();
  if (!uri) {
    return null;
  }


  }

  clientPromise = global._mongoClientPromise;

  try {

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


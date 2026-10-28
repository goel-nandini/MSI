import { MongoClient, Db } from 'mongodb';
import dns from 'dns';

// Fix for Windows / ISP DNS resolvers failing to resolve MongoDB SRV records (_mongodb._tcp)
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (_) {}

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

/**
 * Sanitizes MongoDB URI in case passwords contain special characters like '@' or placeholder '<>' brackets
 */
export function getSanitizedMongoUri(): string {
  const raw = (process.env.MONGODB_URI || '').trim();
  if (!raw || !raw.startsWith('mongodb')) return '';

  try {
    // Check if URI matches format: mongodb(+srv)://username:password@host...
    const match = raw.match(/^(mongodb(?:\+srv)?:\/\/)([^:]+):(.+)@([^@]+)$/);
    if (match) {
      const prefix = match[1];
      const username = match[2];
      let password = match[3];
      const hostAndParams = match[4];

      // Remove surrounding placeholder brackets if user provided <password>
      if (password.startsWith('<') && password.endsWith('>')) {
        password = password.slice(1, -1);
      }

      // URL encode password so '@', ':', '#', etc. don't corrupt the URI
      let decodedPassword = password;
      try {
        decodedPassword = decodeURIComponent(password);
      } catch (_) {}
      const encodedPassword = encodeURIComponent(decodedPassword);

      // Ensure database name is present
      let cleanHostAndParams = hostAndParams;
      const dbName = process.env.MONGODB_DB_NAME || 'msi_db';
      if (!cleanHostAndParams.includes('/') || cleanHostAndParams.endsWith('/')) {
        cleanHostAndParams = cleanHostAndParams.replace(/\/$/, '') + `/${dbName}?retryWrites=true&w=majority`;
      }

      return `${prefix}${username}:${encodedPassword}@${cleanHostAndParams}`;
    }
  } catch (_) {}

  return raw;
}

export function isMongoConfigured(): boolean {
  const uri = getSanitizedMongoUri();
  return Boolean(uri && uri.startsWith('mongodb'));
}

export async function getMongoClient(): Promise<MongoClient | null> {
  const uri = getSanitizedMongoUri();
  if (!uri) {
    return null;
  }

  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch (_) {}

  const options = {
    serverSelectionTimeoutMS: 8000,
  };

  if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR.
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri, options);
      global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
  } else {
    // In production mode, it's best to not use a global variable.
    if (!clientPromise) {
      client = new MongoClient(uri, options);
      clientPromise = client.connect();
    }
  }

  try {
    const connectedClient = await clientPromise;
    return connectedClient;
  } catch (err: any) {
    console.error('[MongoDB] Connection error:', err?.message || err);
    // Reset promise so subsequent requests can retry
    if (process.env.NODE_ENV === 'development') {
      global._mongoClientPromise = undefined;
    }
    clientPromise = null;
    return null;
  }
}

export async function getDb(dbName = 'msi_db'): Promise<Db | null> {
  const client = await getMongoClient();
  if (!client) return null;
  return client.db(process.env.MONGODB_DB_NAME || dbName);
}

/**
 * Bunny.net Stream API Client & Helper Library
 * API Reference: https://bunny.net/docs/api-reference/stream
 * Base URL: https://video.bunnycdn.com
 */

export interface BunnyVideo {
  guid: string;
  videoLibraryId: number;
  title: string;
  dateUploaded: string;
  views: number;
  isPublic: boolean;
  length: number; // in seconds
  status: number; // 0 = Created, 1 = Uploaded, 2 = Processing, 3 = Transcoding, 4 = Finished, 5 = Error
  framerate?: number;
  rotation?: number;
  width?: number;
  height?: number;
  availableResolutions?: string;
  thumbnailCount?: number;
  encodeProgress?: number;
  storageSize?: number;
  hasMP4Fallback?: boolean;
  collectionId?: string;
  thumbnailFileName?: string;
  averageWatchTime?: number;
  totalWatchTime?: number;
  category?: string;
}

export interface BunnyCollection {
  guid: string;
  name: string;
  videoLibraryId: number;
  videoCount: number;
  totalSize: number;
  previewVideoIds?: string;
}

export interface BunnyVideoListResponse {
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
  items: BunnyVideo[];
}

export interface BunnyStreamConfig {
  libraryId: string;
  apiKey: string;
  cdnHostname?: string;
}

export const BUNNY_STREAM_BASE_URL = 'https://video.bunnycdn.com';
export const BUNNY_PLAYER_BASE_URL = 'https://player.mediadelivery.net';
export const BUNNY_CONFIG_STORAGE_KEY = 'msi_bunny_stream_config_v1';

export const DEFAULT_BUNNY_LIBRARY_ID = '782652';
export const DEFAULT_BUNNY_API_KEY = 'ff916df2-e4c8-45fd-ac66fa18ebdc-0408-456e';
export const DEFAULT_BUNNY_CDN_HOSTNAME = 'vz-f4316755-219.b-cdn.net';
export const DEFAULT_BUNNY_SAMPLE_VIDEO_ID = '175638d1-0e6d-4d8c-beaa-23f879ef5afc';
export const DEFAULT_BUNNY_EMBED_URL = 'https://player.mediadelivery.net/embed/782652/175638d1-0e6d-4d8c-beaa-23f879ef5afc';

/**
 * Convert any direct play or embed Bunny URL into the standard iframe embed URL
 * e.g. https://player.mediadelivery.net/play/782652/175638d1... -> https://player.mediadelivery.net/embed/782652/175638d1...
 */
export function toBunnyEmbedUrl(url: string): string {
  if (!url) return DEFAULT_BUNNY_EMBED_URL;
  const trimmed = url.trim();
  if (trimmed.includes('player.mediadelivery.net/play/')) {
    return trimmed.replace('/play/', '/embed/');
  }
  if (trimmed.startsWith('bunny://')) {
    const parts = trimmed.replace('bunny://', '').split('/');
    if (parts.length >= 2) {
      return `https://player.mediadelivery.net/embed/${parts[0]}/${parts[1]}`;
    }
    return `https://player.mediadelivery.net/embed/${DEFAULT_BUNNY_LIBRARY_ID}/${parts[0]}`;
  }
  return trimmed;
}

/**
 * Check if a URL or identifier points to Bunny Stream
 */
export function isBunnyVideoUrl(url: string): boolean {
  if (!url) return false;
  return (
    url.includes('mediadelivery.net') ||
    url.includes('.b-cdn.net') ||
    url.startsWith('bunny://') ||
    url.includes('782652') ||
    url.includes('175638d1-0e6d-4d8c-beaa-23f879ef5afc')
  );
}

/**
 * Resolve active Bunny Stream configuration:
 * Checks process.env first, then browser localStorage if in client.
 */
export function getBunnyStreamConfig(override?: Partial<BunnyStreamConfig>): BunnyStreamConfig {
  let libraryId =
    override?.libraryId ||
    process.env.NEXT_PUBLIC_BUNNY_STREAM_LIBRARY_ID ||
    process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID ||
    process.env.BUNNY_STREAM_LIBRARY_ID ||
    '';
  let apiKey = override?.apiKey || process.env.BUNNY_STREAM_API_KEY || '';
  let cdnHostname =
    override?.cdnHostname ||
    process.env.NEXT_PUBLIC_BUNNY_STREAM_CDN_HOSTNAME ||
    process.env.BUNNY_STREAM_CDN_HOSTNAME ||
    '';

  if (typeof window !== 'undefined' && (!libraryId || !apiKey)) {
    try {
      const stored = localStorage.getItem(BUNNY_CONFIG_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        libraryId = libraryId || parsed.libraryId || '';
        apiKey = apiKey || parsed.apiKey || '';
        cdnHostname = cdnHostname || parsed.cdnHostname || '';
      }
    } catch {
      // Fallback
    }
  }

  // Provide authentic credentials provided for MSI LMS
  if (!libraryId) libraryId = DEFAULT_BUNNY_LIBRARY_ID;
  if (!apiKey) apiKey = DEFAULT_BUNNY_API_KEY;
  if (!cdnHostname) cdnHostname = DEFAULT_BUNNY_CDN_HOSTNAME;

  return {
    libraryId: String(libraryId),
    apiKey,
    cdnHostname,
  };
}

/**
 * Save configuration overrides in client localStorage
 */
export function saveBunnyStreamConfig(config: BunnyStreamConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(BUNNY_CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch (err) {
    console.error('Failed to save Bunny Stream config to localStorage', err);
  }
}

/**
 * Build authorized headers for Bunny Stream API
 */
export function getBunnyHeaders(apiKey: string): HeadersInit {
  return {
    AccessKey: apiKey,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
}

/**
 * 1. Create a video record (Slot) in Bunny Stream
 * POST https://video.bunnycdn.com/library/{libraryId}/videos
 */
export async function createBunnyVideo(
  params: {
    title: string;
    collectionId?: string;
    thumbnailTime?: number;
  },
  config?: BunnyStreamConfig
): Promise<BunnyVideo> {
  const cfg = config || getBunnyStreamConfig();
  if (!cfg.apiKey) {
    throw new Error('Bunny Stream API key is required. Please configure your AccessKey.');
  }

  const res = await fetch(`${BUNNY_STREAM_BASE_URL}/library/${cfg.libraryId}/videos`, {
    method: 'POST',
    headers: getBunnyHeaders(cfg.apiKey),
    body: JSON.stringify({
      title: params.title,
      collectionId: params.collectionId || undefined,
      thumbnailTime: params.thumbnailTime || 0,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to create video on Bunny Stream (${res.status}): ${errorText}`);
  }

  return (await res.json()) as BunnyVideo;
}

/**
 * 2. Fetch video from external URL into Bunny Stream (Asynchronous ingestion)
 * POST https://video.bunnycdn.com/library/{libraryId}/videos/fetch
 */
export async function fetchBunnyVideoFromUrl(
  params: {
    url: string;
    title: string;
    collectionId?: string;
  },
  config?: BunnyStreamConfig
): Promise<{ success: boolean; message: string; statusCode: number; id: string }> {
  const cfg = config || getBunnyStreamConfig();
  if (!cfg.apiKey) {
    throw new Error('Bunny Stream API key is required.');
  }

  const res = await fetch(`${BUNNY_STREAM_BASE_URL}/library/${cfg.libraryId}/videos/fetch`, {
    method: 'POST',
    headers: getBunnyHeaders(cfg.apiKey),
    body: JSON.stringify({
      url: params.url,
      title: params.title,
      collectionId: params.collectionId || undefined,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to fetch video to Bunny Stream (${res.status}): ${errorText}`);
  }

  return await res.json();
}

/**
 * 3. Get single video details & encoding status
 * GET https://video.bunnycdn.com/library/{libraryId}/videos/{videoId}
 */
export async function getBunnyVideo(
  videoId: string,
  config?: BunnyStreamConfig
): Promise<BunnyVideo> {
  const cfg = config || getBunnyStreamConfig();
  if (!cfg.apiKey) {
    throw new Error('Bunny Stream API key is required.');
  }

  const res = await fetch(`${BUNNY_STREAM_BASE_URL}/library/${cfg.libraryId}/videos/${videoId}`, {
    method: 'GET',
    headers: getBunnyHeaders(cfg.apiKey),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to fetch video details (${res.status}): ${errorText}`);
  }

  return (await res.json()) as BunnyVideo;
}

/**
 * 4. List videos in video library
 * GET https://video.bunnycdn.com/library/{libraryId}/videos
 */
export async function listBunnyVideos(
  options?: {
    page?: number;
    itemsPerPage?: number;
    search?: string;
    collectionId?: string;
    orderBy?: 'date' | 'title';
  },
  config?: BunnyStreamConfig
): Promise<BunnyVideoListResponse> {
  const cfg = config || getBunnyStreamConfig();
  if (!cfg.apiKey) {
    throw new Error('Bunny Stream API key is required.');
  }

  const query = new URLSearchParams();
  if (options?.page) query.set('page', String(options.page));
  if (options?.itemsPerPage) query.set('itemsPerPage', String(options.itemsPerPage));
  if (options?.search) query.set('search', options.search);
  if (options?.collectionId) query.set('collection', options.collectionId);
  if (options?.orderBy) query.set('orderBy', options.orderBy);

  const res = await fetch(`${BUNNY_STREAM_BASE_URL}/library/${cfg.libraryId}/videos?${query.toString()}`, {
    method: 'GET',
    headers: getBunnyHeaders(cfg.apiKey),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to list Bunny Stream videos (${res.status}): ${errorText}`);
  }

  return (await res.json()) as BunnyVideoListResponse;
}

/**
 * 5. Delete video from Bunny Stream
 * DELETE https://video.bunnycdn.com/library/{libraryId}/videos/{videoId}
 */
export async function deleteBunnyVideo(
  videoId: string,
  config?: BunnyStreamConfig
): Promise<{ success: boolean; message: string }> {
  const cfg = config || getBunnyStreamConfig();
  if (!cfg.apiKey) {
    throw new Error('Bunny Stream API key is required.');
  }

  const res = await fetch(`${BUNNY_STREAM_BASE_URL}/library/${cfg.libraryId}/videos/${videoId}`, {
    method: 'DELETE',
    headers: getBunnyHeaders(cfg.apiKey),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to delete Bunny Stream video (${res.status}): ${errorText}`);
  }

  return (await res.json()) as { success: boolean; message: string };
}

/**
 * 6. List collections in video library
 * GET https://video.bunnycdn.com/library/{libraryId}/collections
 */
export async function listBunnyCollections(
  options?: { page?: number; itemsPerPage?: number },
  config?: BunnyStreamConfig
): Promise<{ totalItems: number; currentPage: number; itemsPerPage: number; items: BunnyCollection[] }> {
  const cfg = config || getBunnyStreamConfig();
  if (!cfg.apiKey) {
    throw new Error('Bunny Stream API key is required.');
  }

  const query = new URLSearchParams();
  if (options?.page) query.set('page', String(options.page));
  if (options?.itemsPerPage) query.set('itemsPerPage', String(options.itemsPerPage));

  const res = await fetch(`${BUNNY_STREAM_BASE_URL}/library/${cfg.libraryId}/collections?${query.toString()}`, {
    method: 'GET',
    headers: getBunnyHeaders(cfg.apiKey),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to list collections (${res.status}): ${errorText}`);
  }

  return await res.json();
}

/**
 * 7. Create a new collection in Bunny Stream
 * POST https://video.bunnycdn.com/library/{libraryId}/collections
 */
export async function createBunnyCollection(
  name: string,
  config?: BunnyStreamConfig
): Promise<BunnyCollection> {
  const cfg = config || getBunnyStreamConfig();
  if (!cfg.apiKey) {
    throw new Error('Bunny Stream API key is required.');
  }

  const res = await fetch(`${BUNNY_STREAM_BASE_URL}/library/${cfg.libraryId}/collections`, {
    method: 'POST',
    headers: getBunnyHeaders(cfg.apiKey),
    body: JSON.stringify({ name }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to create collection (${res.status}): ${errorText}`);
  }

  return (await res.json()) as BunnyCollection;
}

/**
 * Helper to generate modern Bunny Player Embed iframe URL
 * player.mediadelivery.net/embed/{libraryId}/{videoId}
 */
export function getBunnyPlayerEmbedUrl(
  libraryId: string | number,
  videoId: string,
  options?: {
    autoplay?: boolean;
    loop?: boolean;
    muted?: boolean;
    preload?: boolean;
    responsive?: boolean;
  }
): string {
  const params = new URLSearchParams();
  if (options?.autoplay) params.set('autoplay', 'true');
  if (options?.loop) params.set('loop', 'true');
  if (options?.muted) params.set('muted', 'true');
  if (options?.preload !== false) params.set('preload', 'true');
  if (options?.responsive !== false) params.set('responsive', 'true');

  const qs = params.toString();
  return `${BUNNY_PLAYER_BASE_URL}/embed/${libraryId}/${videoId}${qs ? `?${qs}` : ''}`;
}

/**
 * Helper to generate direct HLS playlist URL (.m3u8) for custom video players
 */
export function getBunnyHlsStreamUrl(cdnHostname: string, videoId: string): string {
  const host = cdnHostname.replace(/^https?:\/\//, '').replace(/\/$/, '');
  return `https://${host}/${videoId}/playlist.m3u8`;
}

/**
 * Helper to generate direct MP4 fallback URL
 */
export function getBunnyMp4Url(
  cdnHostname: string,
  videoId: string,
  resolution: '240p' | '360p' | '480p' | '720p' | '1080p' = '720p'
): string {
  const host = cdnHostname.replace(/^https?:\/\//, '').replace(/\/$/, '');
  return `https://${host}/${videoId}/play_${resolution}.mp4`;
}

/**
 * Helper to generate video poster/thumbnail URL
 */
export function getBunnyThumbnailUrl(cdnHostname: string, videoId: string): string {
  const host = cdnHostname.replace(/^https?:\/\//, '').replace(/\/$/, '');
  return `https://${host}/${videoId}/thumbnail.jpg`;
}

/**
 * Human-readable status label for Bunny Stream status codes
 */
export function getBunnyVideoStatusLabel(status: number): {
  label: string;
  color: string;
  isReady: boolean;
} {
  switch (status) {
    case 0:
      return { label: 'Created (Awaiting Upload)', color: 'text-amber-500 bg-amber-50', isReady: false };
    case 1:
      return { label: 'Uploaded (Queued)', color: 'text-blue-500 bg-blue-50', isReady: false };
    case 2:
      return { label: 'Processing', color: 'text-purple-500 bg-purple-50', isReady: false };
    case 3:
      return { label: 'Transcoding & Encoding', color: 'text-indigo-600 bg-indigo-50', isReady: false };
    case 4:
      return { label: 'Live / Ready for Streaming', color: 'text-emerald-700 bg-emerald-50', isReady: true };
    case 5:
      return { label: 'Encoding Error', color: 'text-rose-600 bg-rose-50', isReady: false };
    default:
      return { label: 'Unknown Status', color: 'text-gray-500 bg-gray-50', isReady: false };
  }
}

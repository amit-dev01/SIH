const crypto = require('crypto');

// In-memory persistent store for user workspace items (bookmarks & API keys)
const userBookmarksStore = new Map();
const userApiKeysStore = new Map();

// Default starter bookmarks for instant demo experience
const DEFAULT_BOOKMARKS = [
  {
    id: 'bm-001',
    entityId: 'POL-ANT-2024-001',
    entityType: 'dataset',
    title: 'Bharati Station Surface Meteorology & Radiative Flux',
    url: '/datasets/POL-ANT-2024-001',
    savedAt: '2024-03-20T10:00:00Z'
  },
  {
    id: 'bm-002',
    entityId: 'understanding-antarctic-sea-ice',
    entityType: 'knowledge',
    title: 'Understanding Antarctic Sea-Ice Dynamics and Global Climate Teleconnections',
    url: '/knowledge/understanding-antarctic-sea-ice',
    savedAt: '2024-03-22T14:30:00Z'
  }
];

/**
 * 1. Get user bookmarks
 */
const getBookmarks = (userId = 'default') => {
  if (!userBookmarksStore.has(userId)) {
    userBookmarksStore.set(userId, [...DEFAULT_BOOKMARKS]);
  }
  return userBookmarksStore.get(userId);
};

/**
 * 2. Add or toggle a bookmark
 */
const toggleBookmark = (userId = 'default', { entityId, entityType, title, url }) => {
  if (!entityId) {
    const err = new Error('entityId is required');
    err.statusCode = 400;
    throw err;
  }

  const list = getBookmarks(userId);
  const existingIdx = list.findIndex((b) => b.entityId === entityId);

  if (existingIdx >= 0) {
    // Remove if exists (toggle off)
    list.splice(existingIdx, 1);
    userBookmarksStore.set(userId, list);
    return { bookmarked: false, message: 'Bookmark removed', bookmarks: list };
  }

  // Add new bookmark
  const newBookmark = {
    id: `bm-${Date.now()}`,
    entityId,
    entityType: entityType || 'dataset',
    title: title || entityId,
    url: url || `/${entityType || 'dataset'}s/${entityId}`,
    savedAt: new Date().toISOString()
  };

  list.unshift(newBookmark);
  userBookmarksStore.set(userId, list);
  return { bookmarked: true, message: 'Bookmark added', bookmark: newBookmark, bookmarks: list };
};

/**
 * 3. Generate a RESTful API key for bulk data access
 */
const generateApiKey = (userId = 'default', name = 'Default Access Key') => {
  const randomBytes = crypto.randomBytes(24).toString('hex');
  const apiKey = `polaris_live_${randomBytes}`;

  const keyRecord = {
    id: `key-${Date.now()}`,
    name,
    apiKey,
    prefix: apiKey.slice(0, 18) + '...',
    scopes: ['datasets:read', 'telemetry:stream', 'knowledge:read'],
    rateLimit: '1000 requests / minute',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
  };

  if (!userApiKeysStore.has(userId)) {
    userApiKeysStore.set(userId, []);
  }
  userApiKeysStore.get(userId).push(keyRecord);

  return keyRecord;
};

module.exports = {
  getBookmarks,
  toggleBookmark,
  generateApiKey
};

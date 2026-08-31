const supabase = require('../../config/supabase');
const cache = require('../../utils/cache');
const logger = require('../../utils/logger');

/**
 * 1. Admin Overview Statistics (Cached 300s)
 */
const getOverview = async () => {
  const cacheKey = 'analytics:overview';
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const [
    expRes,
    pubRes,
    mediaRes,
    dataRes,
    userRes,
    draftRes,
    approvedRes,
    publishedRes,
    rejectedRes,
    datasetsListRes,
    activityRes
  ] = await Promise.all([
    supabase.from('expeditions').select('*', { count: 'exact', head: true }),
    supabase.from('publications').select('*', { count: 'exact', head: true }),
    supabase.from('media').select('*', { count: 'exact', head: true }),
    supabase.from('datasets').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('generated_content').select('*', { count: 'exact', head: true }).eq('status', 'DRAFT'),
    supabase.from('generated_content').select('*', { count: 'exact', head: true }).eq('status', 'APPROVED'),
    supabase.from('generated_content').select('*', { count: 'exact', head: true }).eq('status', 'PUBLISHED'),
    supabase.from('generated_content').select('*', { count: 'exact', head: true }).eq('status', 'REJECTED'),
    supabase.from('datasets').select('download_count'),
    supabase
      .from('activity_log')
      .select('*, user:users(name)')
      .order('created_at', { ascending: false })
      .limit(5)
  ]);

  const totalDownloads =
    datasetsListRes.data?.reduce((sum, d) => sum + (d.download_count || 0), 0) || 0;

  const overviewData = {
    totalExpeditions: expRes.count || 0,
    totalPublications: pubRes.count || 0,
    totalMedia: mediaRes.count || 0,
    totalDatasets: dataRes.count || 0,
    totalUsers: userRes.count || 0,
    totalDownloads,
    generatedContent: {
      draft: draftRes.count || 0,
      approved: approvedRes.count || 0,
      published: publishedRes.count || 0,
      rejected: rejectedRes.count || 0
    },
    recentActivity: activityRes.data || []
  };

  cache.set(cacheKey, overviewData, 300);
  return overviewData;
};

/**
 * 2. Popular & Highlighted Content
 */
const getPopular = async () => {
  const [topExpRes, topDataRes, recentPubsRes, recentMediaRes] = await Promise.all([
    supabase
      .from('expeditions')
      .select('id, title, slug, region, cover_image_url, status')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('datasets')
      .select('id, title, format, download_count')
      .order('download_count', { ascending: false })
      .limit(5),
    supabase
      .from('publications')
      .select('id, title, journal, published_date')
      .order('published_date', { ascending: false })
      .limit(5),
    supabase
      .from('media')
      .select('id, title, type, thumbnail_url, file_url')
      .order('created_at', { ascending: false })
      .limit(5)
  ]);

  return {
    topExpeditions: topExpRes.data || [],
    topDatasets: topDataRes.data || [],
    recentPubs: recentPubsRes.data || [],
    recentMedia: recentMediaRes.data || []
  };
};

/**
 * 3. Timeline of all expeditions
 */
const getTimeline = async () => {
  const { data, error } = await supabase
    .from('expeditions')
    .select('id, title, slug, region, start_date, end_date, status, cover_image_url')
    .order('start_date', { ascending: true });

  if (error) {
    throw error;
  }

  return data || [];
};

/**
 * 4. Content publishing calendar
 */
const getContentCalendar = async () => {
  const { data, error } = await supabase
    .from('generated_content')
    .select('id, platform, content_text, status, scheduled_at, published_at')
    .or('status.eq.PUBLISHED,status.eq.APPROVED')
    .order('scheduled_at', { ascending: true })
    .limit(30);

  if (error) {
    throw error;
  }

  const calendar = {};
  (data || []).forEach((item) => {
    const rawDate = item.scheduled_at || item.published_at;
    const date = rawDate ? rawDate.split('T')[0] : 'undated';

    if (!calendar[date]) {
      calendar[date] = [];
    }

    calendar[date].push({
      id: item.id,
      platform: item.platform,
      snippet:
        item.content_text && item.content_text.length > 100
          ? item.content_text.substring(0, 100) + '...'
          : item.content_text,
      status: item.status
    });
  });

  return calendar;
};

/**
 * 5. Paginated activity logs
 */
const getActivityLog = async (query = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.max(1, Math.min(50, parseInt(query.limit, 10) || 10));

  let q = supabase.from('activity_log').select(
    `
    *,
    user:users(name, email)
  `,
    { count: 'exact' }
  );

  if (query.userId) q = q.eq('user_id', query.userId);
  if (query.action) q = q.eq('action', query.action);
  if (query.entityType) q = q.eq('entity_type', query.entityType);
  if (query.dateFrom) q = q.gte('created_at', query.dateFrom);
  if (query.dateTo) q = q.lte('created_at', query.dateTo);

  q = q.order('created_at', { ascending: false });

  const from = (page - 1) * limit;
  const to = from + limit - 1;
  q = q.range(from, to);

  const { data, error, count } = await q;

  if (error) {
    throw error;
  }

  const total = count || 0;
  return {
    data: data || [],
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1
    }
  };
};

module.exports = {
  getOverview,
  getPopular,
  getTimeline,
  getContentCalendar,
  getActivityLog
};

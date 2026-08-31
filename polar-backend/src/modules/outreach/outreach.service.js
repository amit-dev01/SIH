const supabase = require('../../config/supabase');
const logger = require('../../utils/logger');
const { getPrompt } = require('./prompts');
const { generateContent } = require('../../services/ai.service');

/**
 * 1. Generate social media outreach post using AI (or realistic mock generator)
 */
const generate = async (data, userId) => {
  let sourceContent = '';

  // a) Build source content string from database based on sourceType
  switch (data.sourceType) {
    case 'EXPEDITION': {
      const { data: exp, error } = await supabase
        .from('expeditions')
        .select('title, description, summary, region, status')
        .eq('id', data.sourceId)
        .single();

      if (error || !exp) {
        const err = new Error('Source expedition not found');
        err.statusCode = 404;
        throw err;
      }

      sourceContent = `Title: ${exp.title}\nRegion: ${exp.region}\nStatus: ${exp.status}\nSummary: ${exp.summary || 'N/A'}\nDescription: ${exp.description || 'N/A'}`;
      break;
    }

    case 'PUBLICATION': {
      const { data: pub, error } = await supabase
        .from('publications')
        .select('title, abstract, authors, journal, doi')
        .eq('id', data.sourceId)
        .single();

      if (error || !pub) {
        const err = new Error('Source publication not found');
        err.statusCode = 404;
        throw err;
      }

      const authorsStr = Array.isArray(pub.authors) ? pub.authors.join(', ') : pub.authors || 'NCPOR Scientists';
      sourceContent = `Title: ${pub.title}\nAuthors: ${authorsStr}\nJournal: ${pub.journal || 'N/A'}\nAbstract: ${pub.abstract || 'N/A'}`;
      break;
    }

    case 'MEDIA': {
      const { data: m, error } = await supabase
        .from('media')
        .select('title, description, type')
        .eq('id', data.sourceId)
        .single();

      if (error || !m) {
        const err = new Error('Source media not found');
        err.statusCode = 404;
        throw err;
      }

      sourceContent = `Title: ${m.title}\nType: ${m.type}\nDescription: ${m.description || 'N/A'}`;
      break;
    }

    case 'DATASET': {
      const { data: d, error } = await supabase
        .from('datasets')
        .select('title, description, format')
        .eq('id', data.sourceId)
        .single();

      if (error || !d) {
        const err = new Error('Source dataset not found');
        err.statusCode = 404;
        throw err;
      }

      sourceContent = `Title: ${d.title}\nFormat: ${d.format}\nDescription: ${d.description || 'N/A'}`;
      break;
    }

    case 'CUSTOM':
      sourceContent = data.customInput;
      break;

    default: {
      const err = new Error(`Unsupported sourceType: ${data.sourceType}`);
      err.statusCode = 400;
      throw err;
    }
  }

  // b) Get system and user prompts
  const { system, user } = getPrompt(data.platform, sourceContent);

  // c) Generate content via AI provider / Mock
  const contentText = await generateContent(system, user, data.platform, sourceContent);

  // d) Save to generated_content table
  const { data: content, error: dbError } = await supabase
    .from('generated_content')
    .insert({
      source_type: data.sourceType,
      source_id: data.sourceId || null,
      platform: data.platform,
      content_text: contentText,
      status: 'DRAFT',
      created_by: userId
    })
    .select()
    .single();

  if (dbError) {
    const err = new Error(`Database error saving generated content: ${dbError.message}`);
    err.statusCode = 500;
    throw err;
  }

  logger.info(`Outreach content generated for platform ${data.platform} (${data.sourceType})`);
  return content;
};

/**
 * 2. Get all drafts with filtering and pagination
 */
const getDrafts = async (query = {}, userId) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.max(1, Math.min(50, parseInt(query.limit, 10) || 10));

  let q = supabase
    .from('generated_content')
    .select(
      `
      *,
      created_by_user:users!created_by(name)
    `,
      { count: 'exact' }
    )
    .eq('status', 'DRAFT');

  if (query.platform) {
    q = q.eq('platform', query.platform);
  }

  if (query.sourceType) {
    q = q.eq('source_type', query.sourceType);
  }

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

/**
 * 3. Get single generated content item by ID
 */
const getById = async (id) => {
  const { data, error } = await supabase
    .from('generated_content')
    .select(
      `
      *,
      created_by_user:users!created_by(name)
    `
    )
    .eq('id', id)
    .single();

  if (error || !data) {
    const err = new Error('Outreach content not found');
    err.statusCode = 404;
    throw err;
  }

  return data;
};

/**
 * 4. Update generated content text or mediaUrls
 */
const update = async (id, data, userId) => {
  const { data: existing, error: findError } = await supabase
    .from('generated_content')
    .select('*')
    .eq('id', id)
    .single();

  if (findError || !existing) {
    const err = new Error('Outreach content not found');
    err.statusCode = 404;
    throw err;
  }

  if (existing.status === 'PUBLISHED' || existing.status === 'APPROVED') {
    const err = new Error('Cannot edit published or approved content');
    err.statusCode = 400;
    throw err;
  }

  const updatePayload = {};
  if (data.contentText !== undefined) {
    updatePayload.content_text = data.contentText;
  }
  if (data.mediaUrls !== undefined) {
    updatePayload.media_urls = data.mediaUrls;
  }

  const { data: updated, error: updateError } = await supabase
    .from('generated_content')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single();

  if (updateError) {
    throw updateError;
  }

  return updated;
};

/**
 * 5. Approve draft (Admin)
 */
const approve = async (id, adminUserId) => {
  const { data: existing, error: findError } = await supabase
    .from('generated_content')
    .select('id')
    .eq('id', id)
    .single();

  if (findError || !existing) {
    const err = new Error('Outreach content not found');
    err.statusCode = 404;
    throw err;
  }

  const { data: approved, error } = await supabase
    .from('generated_content')
    .update({
      status: 'APPROVED',
      approved_by: adminUserId
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  logger.info(`Outreach content ${id} approved by ${adminUserId}`);
  return approved;
};

/**
 * 6. Reject draft (Admin)
 */
const reject = async (id) => {
  const { data: existing, error: findError } = await supabase
    .from('generated_content')
    .select('id')
    .eq('id', id)
    .single();

  if (findError || !existing) {
    const err = new Error('Outreach content not found');
    err.statusCode = 404;
    throw err;
  }

  const { data: rejected, error } = await supabase
    .from('generated_content')
    .update({ status: 'REJECTED' })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return rejected;
};

/**
 * 7. Publish content (Admin)
 */
const publish = async (id) => {
  const { data: existing, error: findError } = await supabase
    .from('generated_content')
    .select('id')
    .eq('id', id)
    .single();

  if (findError || !existing) {
    const err = new Error('Outreach content not found');
    err.statusCode = 404;
    throw err;
  }

  const { data: published, error } = await supabase
    .from('generated_content')
    .update({
      status: 'PUBLISHED',
      published_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  logger.info(`Outreach content ${id} marked as PUBLISHED`);
  return published;
};

/**
 * 8. Schedule draft for future publication
 */
const schedule = async (id, scheduledAt) => {
  const { data: existing, error: findError } = await supabase
    .from('generated_content')
    .select('id')
    .eq('id', id)
    .single();

  if (findError || !existing) {
    const err = new Error('Outreach content not found');
    err.statusCode = 404;
    throw err;
  }

  const { data: scheduled, error } = await supabase
    .from('generated_content')
    .update({
      scheduled_at: scheduledAt
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return scheduled;
};

/**
 * 9. Get all public published outreach content
 */
const getPublished = async (query = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.max(1, Math.min(50, parseInt(query.limit, 10) || 10));

  let q = supabase
    .from('generated_content')
    .select(
      `
      *,
      created_by_user:users!created_by(name)
    `,
      { count: 'exact' }
    )
    .eq('status', 'PUBLISHED');

  if (query.platform) {
    q = q.eq('platform', query.platform);
  }

  if (query.sourceType) {
    q = q.eq('source_type', query.sourceType);
  }

  q = q.order('published_at', { ascending: false });

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
  generate,
  getDrafts,
  getById,
  update,
  approve,
  reject,
  publish,
  schedule,
  getPublished
};

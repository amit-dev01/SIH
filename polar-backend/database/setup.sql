-- =============================================================================
-- POLAR SCIENCE OUTREACH PORTAL — SUPABASE POSTGRESQL SCHEMA (SIH26063)
-- National Centre for Polar and Ocean Research (NCPOR), Ministry of Earth Sciences
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS & PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'PUBLIC' CHECK (role IN ('ADMIN', 'RESEARCHER', 'PUBLIC')),
  institution TEXT DEFAULT 'NCPOR',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. EXPEDITIONS TABLE
CREATE TABLE IF NOT EXISTS public.expeditions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  summary TEXT,
  region TEXT NOT NULL CHECK (region IN ('ARCTIC', 'ANTARCTIC', 'HIMALAYA', 'SOUTHERN_OCEAN')),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'PLANNED' CHECK (status IN ('PLANNED', 'ONGOING', 'COMPLETED')),
  cover_image_url TEXT,
  leader_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. MEDIA TABLE
CREATE TABLE IF NOT EXISTS public.media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('PHOTO', 'VIDEO', 'DOCUMENT', 'AUDIO')),
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  expedition_id UUID REFERENCES public.expeditions(id) ON DELETE SET NULL,
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  captured_at TIMESTAMPTZ,
  uploaded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. PUBLICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.publications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  abstract TEXT,
  authors TEXT[] NOT NULL DEFAULT '{}',
  journal TEXT,
  doi TEXT,
  pdf_url TEXT,
  expedition_id UUID REFERENCES public.expeditions(id) ON DELETE SET NULL,
  published_date TIMESTAMPTZ,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. DATASETS TABLE
CREATE TABLE IF NOT EXISTS public.datasets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  format TEXT NOT NULL CHECK (format IN ('CSV', 'JSON', 'NETCDF', 'XLSX', 'PDF')),
  file_url TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  download_count INTEGER NOT NULL DEFAULT 0,
  expedition_id UUID REFERENCES public.expeditions(id) ON DELETE SET NULL,
  doi TEXT,
  license TEXT NOT NULL DEFAULT 'CC-BY-4.0',
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. TAGS TABLE
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. JUNCTION TABLES
CREATE TABLE IF NOT EXISTS public.media_tags (
  media_id UUID NOT NULL REFERENCES public.media(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (media_id, tag_id)
);

CREATE TABLE IF NOT EXISTS public.publication_tags (
  publication_id UUID NOT NULL REFERENCES public.publications(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (publication_id, tag_id)
);

CREATE TABLE IF NOT EXISTS public.dataset_tags (
  dataset_id UUID NOT NULL REFERENCES public.datasets(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (dataset_id, tag_id)
);

-- 8. GENERATED CONTENT (AI Outreach) TABLE
CREATE TABLE IF NOT EXISTS public.generated_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_type TEXT NOT NULL CHECK (source_type IN ('EXPEDITION', 'PUBLICATION', 'MEDIA', 'DATASET', 'CUSTOM')),
  source_id UUID,
  platform TEXT NOT NULL CHECK (platform IN ('TWITTER', 'FACEBOOK', 'INSTAGRAM', 'WEBSITE', 'LINKEDIN')),
  content_text TEXT NOT NULL,
  media_urls TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'APPROVED', 'REJECTED', 'PUBLISHED')),
  approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. ACTIVITY LOG (Audit Trail) TABLE
CREATE TABLE IF NOT EXISTS public.activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES FOR FULL-TEXT AND PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_expeditions_slug ON public.expeditions(slug);
CREATE INDEX IF NOT EXISTS idx_expeditions_region ON public.expeditions(region);
CREATE INDEX IF NOT EXISTS idx_media_location ON public.media(location_lat, location_lng) WHERE location_lat IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_generated_status ON public.generated_content(status);

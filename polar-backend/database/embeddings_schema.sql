-- =============================================================================
-- POLARIS PORTAL — PGVECTOR SCIENTIFIC EMBEDDINGS SCHEMA (NCPOR / MoES)
-- =============================================================================

-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Create scientific_embeddings table
CREATE TABLE IF NOT EXISTS public.scientific_embeddings (
  id TEXT PRIMARY KEY,                           -- Unique chunk key, e.g. 'dataset:POL-ANT-2024-001'
  source_type TEXT NOT NULL,                     -- 'DATASET', 'PUBLICATION', 'KNOWLEDGE', 'STATION', 'GLOSSARY', 'EXPEDITION'
  source_id TEXT NOT NULL,                       -- Original record ID or slug
  title TEXT NOT NULL,                           -- Entity title or term
  content TEXT NOT NULL,                         -- Text chunk used for semantic vectorization
  metadata JSONB DEFAULT '{}'::jsonb,            -- Attributes (url, region, discipline, authors, tags, etc.)
  embedding vector(768),                         -- Google Gemini (gemini-embedding-001) 768-dimensional vector
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create index for fast cosine distance search
-- Using IVFFlat or HNSW (HNSW is supported in pgvector 0.5.0+)
DO $$
BEGIN
  BEGIN
    CREATE INDEX IF NOT EXISTS idx_scientific_embeddings_hnsw 
    ON public.scientific_embeddings 
    USING hnsw (embedding vector_cosine_ops);
  EXCEPTION WHEN OTHERS THEN
    CREATE INDEX IF NOT EXISTS idx_scientific_embeddings_ivfflat 
    ON public.scientific_embeddings 
    USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
  END;
END $$;

-- 4. Fast Cosine Similarity Match RPC function for Supabase
CREATE OR REPLACE FUNCTION match_scientific_embeddings (
  query_embedding vector(768),
  match_threshold float DEFAULT 0.3,
  match_count int DEFAULT 5,
  filter_source_type text DEFAULT NULL
)
RETURNS TABLE (
  id text,
  source_type text,
  source_id text,
  title text,
  content text,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    se.id,
    se.source_type,
    se.source_id,
    se.title,
    se.content,
    se.metadata,
    1 - (se.embedding <=> query_embedding) AS similarity
  FROM public.scientific_embeddings se
  WHERE (filter_source_type IS NULL OR se.source_type = filter_source_type)
    AND (1 - (se.embedding <=> query_embedding)) > match_threshold
  ORDER BY se.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

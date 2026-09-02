-- =============================================================================
-- POLARIS PORTAL — COMPLETE MASTER DATABASE SCHEMA & SEED DATA (NCPOR / MoES)
-- =============================================================================

-- Enable required Postgres extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 1. STATIONS TABLE
CREATE TABLE IF NOT EXISTS public.stations (
  id VARCHAR PRIMARY KEY,
  name VARCHAR NOT NULL,
  native_name VARCHAR,
  region VARCHAR NOT NULL CHECK (region IN ('Antarctica', 'Arctic', 'Himalayas', 'Southern Ocean')),
  country VARCHAR DEFAULT 'India',
  agency VARCHAR DEFAULT 'NCPOR / MoES',
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  established INTEGER,
  status VARCHAR DEFAULT 'Active' CHECK (status IN ('Active', 'Seasonal', 'Decommissioned', 'Observatory')),
  elevation VARCHAR,
  description TEXT,
  image_bg TEXT,
  parameters TEXT[],
  available_datasets_count INTEGER DEFAULT 0,
  temp_latest VARCHAR,
  wind_latest VARCHAR,
  pressure_latest VARCHAR,
  observation_updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Stations
INSERT INTO public.stations (id, name, native_name, region, country, agency, lat, lng, established, status, elevation, description, image_bg, parameters, available_datasets_count, temp_latest, wind_latest, pressure_latest)
VALUES
('station-bharati-station', 'Bharati Station', 'भारती', 'Antarctica', 'India', 'NCPOR / MoES', -69.4075, 76.1964, 2012, 'Active', '35 m a.s.l.', 'Bharati is India third Antarctic research facility and one of two active Indian research stations, located at Larsemann Hills, East Antarctica.', 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=1200&q=80', ARRAY['Surface Meteorology', 'Radiation Flux', 'Seismology', 'Ozone Monitoring'], 4, '-14.2°C', '18.4 m/s ENE', '986.4 hPa'),
('station-maitri-station', 'Maitri Station', 'मैत्री', 'Antarctica', 'India', 'NCPOR / MoES', -70.7667, 11.7333, 1989, 'Active', '117 m a.s.l.', 'Maitri Station is India second permanent Antarctic research station situated in the rocky, ice-free mountainous region of Schirmacher Oasis.', 'https://images.unsplash.com/photo-1508873696983-2df5293cb32b?auto=format&fit=crop&w=1200&q=80', ARRAY['Meteorology', 'Ice Core Drilling', 'Magnetosphere', 'Paleoclimate'], 3, '-22.0°C', '12.0 m/s S', '991.0 hPa'),
('station-himadri-station', 'Himadri Station', 'हिमाद्रि', 'Arctic', 'India', 'NCPOR / MoES', 78.9231, 11.9267, 2008, 'Active', '15 m a.s.l.', 'India first permanent Arctic research station located at the International Arctic Research base in Ny-Ålesund, Spitsbergen, Svalbard.', 'https://images.unsplash.com/photo-1548777123-e216912df7d8?auto=format&fit=crop&w=1200&q=80', ARRAY['Black Carbon', 'Aerosols', 'Marine Biology', 'Microbiology'], 3, '-11.5°C', '8.2 m/s NW', '998.5 hPa'),
('station-himansh-station', 'Himansh Station', 'हिमांशु', 'Himalayas', 'India', 'NCPOR / MoES', 32.4042, 77.6106, 2016, 'Active', '4,080 m a.s.l.', 'India dedicated high-altitude glaciological research observatory situated in the Chandra Basin, Lahaul-Spiti, Himachal Pradesh.', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80', ARRAY['Glacier Mass Balance', 'Snow Depth', 'Automatic Weather Station', 'Discharge'], 3, '-4.0°C', '6.5 m/s W', '635.0 hPa'),
('station-indarc', 'IndARC Mooring Observatory', 'इंडआर्क', 'Arctic', 'India', 'NCPOR / MoES', 78.9500, 12.0167, 2014, 'Active', '-192 m (Sub-surface)', 'India first multi-sensor underwater moored ocean observatory in the Arctic Ocean (Kongsfjorden Fjord), measuring real-time water temperature and salinity profiles.', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80', ARRAY['Water Temperature', 'Current Velocity', 'Salinity', 'Dissolved Oxygen'], 2, '1.8°C', '0.2 m/s', '1012.0 hPa')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  temp_latest = EXCLUDED.temp_latest,
  wind_latest = EXCLUDED.wind_latest,
  pressure_latest = EXCLUDED.pressure_latest;

-- 2. GLOSSARY TABLE
CREATE TABLE IF NOT EXISTS public.glossary (
  id VARCHAR PRIMARY KEY,
  term VARCHAR UNIQUE NOT NULL,
  simple_definition TEXT,
  scientific_definition TEXT,
  category VARCHAR,
  related_dataset_ids TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.glossary (id, term, simple_definition, scientific_definition, category, related_dataset_ids)
VALUES
('term-albedo', 'Albedo', 'How well a surface reflects sunlight. Fresh white snow reflects up to 90% of heat.', 'The non-dimensional measure of diffuse reflectivity of solar radiation out of total incident irradiance.', 'Cryospheric Physics', ARRAY['POL-ANT-2024-001', 'POL-ARC-2024-002']),
('term-katabatic-winds', 'Katabatic Winds', 'Extremely fierce, cold winds that rush down high Antarctic ice slopes under gravity.', 'Gravity-driven downslope drainage flows of dense, radiatively cooled boundary-layer air.', 'Polar Meteorology', ARRAY['POL-ANT-2024-001']),
('term-polynya', 'Polynya', 'An open patch of water in the middle of frozen sea ice where sea animals surface to breathe.', 'Non-linear open water regions within sea ice pack sustained by sensible heat upwelling or latent heat divergence.', 'Oceanography & Sea Ice', ARRAY['POL-ANT-2024-006']),
('term-ice-shelf', 'Ice Shelf', 'A massive floating slab of permanent ice that extends from land over the ocean.', 'A thick, buoyant platform of meteoric ice fed by grounding tributary glaciers.', 'Glaciology', ARRAY['POL-ANT-2024-005'])
ON CONFLICT (id) DO NOTHING;

-- 3. FAQS TABLE
CREATE TABLE IF NOT EXISTS public.faqs (
  id VARCHAR PRIMARY KEY,
  category VARCHAR NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.faqs (id, category, question, answer)
VALUES
('faq-001', 'Data Access', 'How do I download full scientific NetCDF and raw time-series data?', 'All datasets on the POLARIS portal are freely accessible under FAIR data principles and Creative Commons CC-BY 4.0 license.'),
('faq-002', 'Expeditions', 'How can Indian university researchers join an Antarctic or Arctic expedition?', 'NCPOR releases an annual Call for Research Proposals. Selected principal investigators undergo medical and acclimatization training at ITBP Auli.'),
('faq-003', 'Ice Cores', 'Can external scientists request physical ice core or sediment samples?', 'Yes. NCPOR houses the National Ice Core Repository in Goa. Scientists can submit an official Sample Request Form.')
ON CONFLICT (id) DO NOTHING;

-- 4. FULL TEXT SEARCH INDEXES
CREATE INDEX IF NOT EXISTS idx_expeditions_fts ON public.expeditions USING gin (to_tsvector('english', title || ' ' || COALESCE(summary, '') || ' ' || COALESCE(description, '')));
CREATE INDEX IF NOT EXISTS idx_publications_fts ON public.publications USING gin (to_tsvector('english', title || ' ' || COALESCE(abstract, '')));
CREATE INDEX IF NOT EXISTS idx_datasets_fts ON public.datasets USING gin (to_tsvector('english', title || ' ' || COALESCE(description, '')));
CREATE INDEX IF NOT EXISTS idx_media_fts ON public.media USING gin (to_tsvector('english', title || ' ' || COALESCE(description, '')));

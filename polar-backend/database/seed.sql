-- =============================================================================
-- SAMPLE SEED DATA FOR DEMO & TESTING (SIH26063 - NCPOR)
-- =============================================================================

-- 1. Insert Sample Expeditions
INSERT INTO public.expeditions (id, slug, title, description, summary, region, start_date, end_date, status, cover_image_url)
VALUES
(
  'e1000000-0000-0000-0000-000000000001',
  '43rd-indian-scientific-expedition-to-antarctica',
  '43rd Indian Scientific Expedition to Antarctica',
  'Scientific exploration and meteorological observations in the Larsemann Hills (Bharati Station) and Schirmacher Oasis (Maitri Station) regions of East Antarctica.',
  'Annual scientific mission studying ice cores, atmospheric aerosols, and glacial melting in East Antarctica.',
  'ANTARCTIC',
  '2023-11-15T00:00:00Z',
  '2024-03-25T00:00:00Z',
  'COMPLETED',
  'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=800&q=80'
),
(
  'e1000000-0000-0000-0000-000000000002',
  'indian-arctic-winter-expedition-2024',
  'Indian Arctic Winter Scientific Expedition',
  'First-ever maiden winter expedition to the Arctic Ny-Ålesund station (Himadri) conducting atmospheric and marine microbiology studies during polar night.',
  'Pioneering winter mission studying polar night atmospheric chemistry, aurora dynamics, and marine microplastics.',
  'ARCTIC',
  '2024-01-10T00:00:00Z',
  '2024-02-28T00:00:00Z',
  'COMPLETED',
  'https://images.unsplash.com/photo-1548777123-e216912df7d8?auto=format&fit=crop&w=800&q=80'
),
(
  'e1000000-0000-0000-0000-000000000003',
  '44th-indian-scientific-expedition-to-antarctica',
  '44th Indian Scientific Expedition to Antarctica',
  'Upcoming major multidisciplinary expedition focusing on deep ice core drilling, Southern Ocean teleconnections, and geological mapping.',
  'Upcoming expedition deploying advanced automated weather sensors and ice radar systems.',
  'ANTARCTIC',
  '2026-11-01T00:00:00Z',
  '2027-04-05T00:00:00Z',
  'PLANNED',
  'https://images.unsplash.com/photo-1508873696983-2df5293cb32b?auto=format&fit=crop&w=800&q=80'
),
(
  'e1000000-0000-0000-0000-000000000004',
  'himalayan-cryosphere-survey-chandra-basin',
  'Himalayan Cryosphere Survey — Chandra Basin (Himansh Station)',
  'High-altitude glaciological benchmark monitoring in Chandra-Bhaga basin, Himachal Pradesh, assessing glacier mass balance and meltwater runoff.',
  'Comprehensive glacier mass balance study monitoring Himalayan freshwater reserves.',
  'HIMALAYA',
  '2025-06-01T00:00:00Z',
  '2025-09-30T00:00:00Z',
  'COMPLETED',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80'
)
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Sample Tags
INSERT INTO public.tags (id, name, slug)
VALUES
('t1000000-0000-0000-0000-000000000001', 'antarctica', 'antarctica'),
('t1000000-0000-0000-0000-000000000002', 'glaciology', 'glaciology'),
('t1000000-0000-0000-0000-000000000003', 'climate-change', 'climate-change'),
('t1000000-0000-0000-0000-000000000004', 'arctic', 'arctic'),
('t1000000-0000-0000-0000-000000000005', 'meteorology', 'meteorology')
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Sample Publications
INSERT INTO public.publications (id, title, abstract, authors, journal, doi, expedition_id, published_date)
VALUES
(
  'p1000000-0000-0000-0000-000000000001',
  'Aerosol Radiative Forcing and Cloud Condensation Nuclei over Larsemann Hills, East Antarctica',
  'This paper presents multi-year observations of black carbon and aerosol optical depth measured at Bharati Station during the 43rd Indian Scientific Expedition.',
  ARRAY['Dr. Rajesh Sharma', 'Dr. Anita Nair', 'Dr. P. K. Joshi'],
  'Polar Science Journal',
  '10.1016/j.polar.2025.04.012',
  'e1000000-0000-0000-0000-000000000001',
  '2025-05-15T00:00:00Z'
),
(
  'p1000000-0000-0000-0000-000000000002',
  'Winter Microbiological Diversity and Sea-Ice Dynamics in Kongsfjorden, Svalbard',
  'Investigating psychrophilic bacterial adaptation and microplastic ingestion by Arctic marine copepods during polar night conditions.',
  ARRAY['Dr. M. Ravichandran', 'Dr. Sunil Kumar'],
  'Geophysical Research Letters',
  '10.1029/2024GL108921',
  'e1000000-0000-0000-0000-000000000002',
  '2024-08-20T00:00:00Z'
)
ON CONFLICT (id) DO NOTHING;

-- 4. Insert Sample Datasets
INSERT INTO public.datasets (id, title, description, format, file_url, file_size, download_count, expedition_id, license)
VALUES
(
  'd1000000-0000-0000-0000-000000000001',
  'Hourly Meteorological Observations — Bharati Station (2023-2024)',
  'Complete hourly datasets including ambient temperature, wind velocity, relative humidity, UV radiation, and atmospheric pressure at Larsemann Hills.',
  'CSV',
  'https://aqlvjzzdkslcvmwngolh.supabase.co/storage/v1/object/public/polar-datasets/csv/bharati_weather_2024.csv',
  1458290,
  42,
  'e1000000-0000-0000-0000-000000000001',
  'CC-BY-4.0'
),
(
  'd1000000-0000-0000-0000-000000000002',
  'Chandra Basin Glacier Meltwater Runoff and Mass Balance Dataset',
  'Discharge measurements and ablation stake data from Sutri Dhaka and Batal glaciers in the Western Himalayas.',
  'NETCDF',
  'https://aqlvjzzdkslcvmwngolh.supabase.co/storage/v1/object/public/polar-datasets/netcdf/chandra_meltwater_2025.nc',
  5829100,
  19,
  'e1000000-0000-0000-0000-000000000004',
  'CC-BY-4.0'
)
ON CONFLICT (id) DO NOTHING;

-- 5. Insert Sample Media
INSERT INTO public.media (id, title, description, type, file_url, thumbnail_url, file_size, mime_type, expedition_id, location_lat, location_lng, captured_at)
VALUES
(
  'm1000000-0000-0000-0000-000000000001',
  'Sunset over Bharati Station, Larsemann Hills',
  'Stunning twilight view of India third Antarctic research station Bharati surrounded by sea ice.',
  'PHOTO',
  'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=300&q=80',
  2450000,
  'image/jpeg',
  'e1000000-0000-0000-0000-000000000001',
  -69.4075,
  76.1964,
  '2024-01-15T18:30:00Z'
),
(
  'm1000000-0000-0000-0000-000000000002',
  'Himadri Arctic Station in Ny-Ålesund, Svalbard',
  'India research station Himadri against the backdrop of snow-covered fjords during early spring.',
  'PHOTO',
  'https://images.unsplash.com/photo-1548777123-e216912df7d8?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1548777123-e216912df7d8?auto=format&fit=crop&w=300&q=80',
  1890000,
  'image/jpeg',
  'e1000000-0000-0000-0000-000000000002',
  78.9231,
  11.9267,
  '2024-02-10T11:15:00Z'
)
ON CONFLICT (id) DO NOTHING;

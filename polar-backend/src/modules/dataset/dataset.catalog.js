// Standardized NCPOR scientific datasets catalog matching frontend IDs
const CATALOG_DATASETS = [
  {
    id: 'POL-ANT-2024-001',
    title: 'Bharati Station Surface Meteorology & Radiative Flux',
    region: 'Antarctica',
    discipline: 'Atmospheric Sciences',
    station: 'Bharati Station',
    expedition: '43rd Indian Scientific Expedition to Antarctica',
    temporalCoverage: '2023 - 2024',
    startYear: 2023,
    endYear: 2024,
    spatialCoverage: 'Larsemann Hills, Coastal East Antarctica',
    coordinates: { lat: -69.4075, lng: 76.1964 },
    dataFormat: 'NetCDF',
    format: 'NETCDF',
    fileSize: '42.8 MB',
    provider: 'NCPOR Atmospheric Sciences Division',
    lastUpdated: '2024-03-15T00:00:00Z',
    shortDescription: 'High-frequency automatic weather station (AWS) measurements including solar flux, wind profile, and temperature from coastal East Antarctica.',
    fullDescription: 'Continuous automatic weather station (AWS) observations deployed at Bharati Station (69°24′S, 76°11′E). Records 10-minute averaged air temperature, barometric pressure, horizontal wind velocity/direction, relative humidity, net radiation, and downward longwave/shortwave irradiance.',
    tags: ['meteorology', 'radiation', 'aerosols', 'antarctica', 'bharati'],
    parameters: ['Air Temperature', 'Wind Speed', 'Atmospheric Pressure', 'Solar Radiation'],
    downloadsCount: 342,
    doi: '10.1016/ncpor.ant.2024.001',
    citation: 'Sharma, R., Nair, A., et al. (2024). Surface Meteorology and Radiative Flux at Bharati Station, East Antarctica. NCPOR Data Repository.',
    variables: [
      { name: 'temp_surface', unit: '°C', description: 'Air temperature measured at 2m height' },
      { name: 'wind_speed', unit: 'm/s', description: 'Horizontal wind speed at 10m height' },
      { name: 'pressure', unit: 'hPa', description: 'Barometric station pressure' },
      { name: 'sw_down', unit: 'W/m²', description: 'Downward shortwave solar radiation' }
    ],
    sampleData: [
      { date: '2024-01-01', temperature: -6.4, windSpeed: 8.2, pressure: 988.5 },
      { date: '2024-01-02', temperature: -8.1, windSpeed: 12.5, pressure: 984.2 },
      { date: '2024-01-03', temperature: -5.8, windSpeed: 7.0, pressure: 989.0 },
      { date: '2024-01-04', temperature: -9.2, windSpeed: 15.3, pressure: 981.8 },
      { date: '2024-01-05', temperature: -11.0, windSpeed: 21.0, pressure: 978.4 }
    ],
    fileList: [
      { filename: 'bharati_aws_2024.nc', size: '38.2 MB', format: 'NetCDF', updated: '2024-03-10' },
      { filename: 'bharati_aws_daily_summary.csv', size: '4.6 MB', format: 'CSV', updated: '2024-03-12' }
    ],
    relatedExpeditionIds: ['43rd-indian-scientific-expedition-to-antarctica'],
    relatedStationIds: ['bharati-station'],
    relatedKnowledgeIds: ['understanding-antarctic-sea-ice'],
    relatedMediaIds: []
  },
  {
    id: 'POL-ARC-2024-002',
    title: 'Ny-Ålesund Black Carbon & Aerosol Optical Depth (AOD)',
    region: 'Arctic',
    discipline: 'Atmospheric Sciences',
    station: 'Himadri Station',
    expedition: 'Indian Arctic Winter Scientific Expedition',
    temporalCoverage: '2023 - 2024',
    startYear: 2023,
    endYear: 2024,
    spatialCoverage: 'Kongsfjorden Fjord, Ny-Ålesund, Svalbard (78°55′N)',
    coordinates: { lat: 78.9231, lng: 11.9267 },
    dataFormat: 'CSV',
    format: 'CSV',
    fileSize: '18.4 MB',
    provider: 'NCPOR Polar Atmosphere Group',
    lastUpdated: '2024-02-28T00:00:00Z',
    shortDescription: 'Multi-wavelength aerosol optical depth, aethalometer black carbon mass concentration, and cloud condensation nuclei at Himadri Station.',
    fullDescription: 'Ground-based aerosol characterization conducted during polar night and summer transition at Ny-Ålesund. Quantifies anthropogenic black carbon influx transported from mid-latitudes to the High Arctic and assesses snow albedo reduction.',
    tags: ['aerosol', 'black-carbon', 'arctic', 'himadri', 'albedo'],
    parameters: ['Black Carbon (BC)', 'AOD 500nm', 'PM2.5', 'Relative Humidity'],
    downloadsCount: 289,
    doi: '10.1016/ncpor.arc.2024.002',
    citation: 'Joshi, P. K., et al. (2024). Multi-year In-situ Black Carbon Measurements at Ny-Ålesund, Svalbard. NCPOR Data Archive.',
    variables: [
      { name: 'bc_concentration', unit: 'ng/m³', description: 'Equivalent black carbon mass concentration' },
      { name: 'aod_500nm', unit: 'dimensionless', description: 'Aerosol Optical Depth at 500nm wavelength' },
      { name: 'pm25', unit: 'µg/m³', description: 'Fine particulate matter mass' }
    ],
    sampleData: [
      { date: '2024-01-10', blackCarbon: 24.5, temperature: -14.2, windSpeed: 6.4 },
      { date: '2024-01-11', blackCarbon: 31.2, temperature: -16.8, windSpeed: 9.1 },
      { date: '2024-01-12', blackCarbon: 28.0, temperature: -12.5, windSpeed: 4.8 }
    ],
    fileList: [
      { filename: 'himadri_bc_2024.csv', size: '12.1 MB', format: 'CSV', updated: '2024-02-25' },
      { filename: 'himadri_aod_timeseries.nc', size: '6.3 MB', format: 'NetCDF', updated: '2024-02-27' }
    ],
    relatedExpeditionIds: ['indian-arctic-winter-expedition-2024'],
    relatedStationIds: ['himadri-station', 'indarc-mooring'],
    relatedKnowledgeIds: ['black-carbon-arctic-amplification'],
    relatedMediaIds: []
  },
  {
    id: 'POL-SO-2023-003',
    title: 'Southern Ocean Hydrographic CTD Transect & Salinity Profile',
    region: 'Southern Ocean',
    discipline: 'Oceanography',
    station: 'Southern Ocean Survey',
    expedition: '13th Indian Southern Ocean Expedition',
    temporalCoverage: '2022 - 2023',
    startYear: 2022,
    endYear: 2023,
    spatialCoverage: 'Sub-Antarctic Front to Coastal Prydz Bay (40°S - 68°S)',
    coordinates: { lat: -58.5, lng: 62.0 },
    dataFormat: 'NetCDF',
    format: 'NETCDF',
    fileSize: '156.2 MB',
    provider: 'NCPOR Ocean Sciences Division',
    lastUpdated: '2023-11-20T00:00:00Z',
    shortDescription: 'Full-depth hydrographic profiles (conductivity, temperature, depth, dissolved oxygen, nutrients) across the Antarctic Circumpolar Current.',
    fullDescription: 'High-resolution oceanographic CTD rosette casts collected aboard research vessel along the 57.5°E transect. Captures water mass transformation, Antarctic Intermediate Water subduction, and Southern Ocean carbon sequestration pathways.',
    tags: ['oceanography', 'ctd', 'salinity', 'southern-ocean', 'antarctic-current'],
    parameters: ['Salinity', 'Sea Water Temperature', 'Depth', 'Dissolved Oxygen', 'Chlorophyll-a'],
    downloadsCount: 512,
    doi: '10.1016/ncpor.so.2023.003',
    citation: 'Ravichandran, M., et al. (2023). Hydrography of the Indian Sector of the Southern Ocean. NCPOR Data Series.',
    variables: [
      { name: 'depth', unit: 'dbar', description: 'Sea water pressure (equivalent depth)' },
      { name: 'salinity', unit: 'PSU', description: 'Practical Salinity Scale' },
      { name: 'sea_temp', unit: '°C', description: 'In-situ sea water temperature' },
      { name: 'oxygen', unit: 'µmol/kg', description: 'Dissolved oxygen concentration' }
    ],
    sampleData: [
      { depth: 10, temperature: 3.2, salinity: 33.85, pressure: 10.1 },
      { depth: 100, temperature: 1.1, salinity: 34.12, pressure: 101.4 },
      { depth: 500, temperature: 1.8, salinity: 34.68, pressure: 508.2 },
      { depth: 1000, temperature: 2.1, salinity: 34.74, pressure: 1022.0 }
    ],
    fileList: [
      { filename: 'so_ctd_transect_2023.nc', size: '142.0 MB', format: 'NetCDF', updated: '2023-11-15' },
      { filename: 'so_stations_summary.csv', size: '14.2 MB', format: 'CSV', updated: '2023-11-18' }
    ],
    relatedExpeditionIds: ['43rd-indian-scientific-expedition-to-antarctica'],
    relatedStationIds: ['southern-ocean-survey', 'prydz-bay-oceanographic-station'],
    relatedKnowledgeIds: ['oceanographic-research-southern-ocean'],
    relatedMediaIds: []
  },
  {
    id: 'POL-HIM-2024-004',
    title: 'Chandra Basin High-Altitude Glacier Mass Balance & Runoff',
    region: 'Himalayas',
    discipline: 'Glaciology & Cryosphere',
    station: 'Himansh Station',
    expedition: 'Himalayan Cryosphere Survey — Chandra Basin',
    temporalCoverage: '2020 - 2024',
    startYear: 2020,
    endYear: 2024,
    spatialCoverage: 'Chandra-Bhaga River Basin, Himachal Pradesh (4,080m - 5,400m)',
    coordinates: { lat: 32.4042, lng: 77.6106 },
    dataFormat: 'CSV',
    format: 'CSV',
    fileSize: '24.1 MB',
    provider: 'NCPOR Cryosphere and Climate Centre',
    lastUpdated: '2024-06-01T00:00:00Z',
    shortDescription: 'In-situ glaciological stake ablation, snow water equivalent, and meltwater discharge measurements from Sutri Dhaka and Batal glaciers.',
    fullDescription: 'Long-term benchmark glaciological observations conducted from Himansh High-Altitude Research Station. Integrates stake network ablation rates, snow pits, dGPS terminal retreat mapping, and automatic river gauging to assess Third Pole freshwater vulnerability.',
    tags: ['himalayas', 'glaciers', 'mass-balance', 'himansh', 'meltwater'],
    parameters: ['Glacier Mass Balance', 'Snow Depth', 'Air Temperature', 'Runoff Discharge'],
    downloadsCount: 418,
    doi: '10.1016/ncpor.him.2024.004',
    citation: 'Meloth, T., et al. (2024). Benchmark Glaciological Mass Balance in Chandra Basin. NCPOR Glaciological Reports.',
    variables: [
      { name: 'mass_balance', unit: 'm w.e.', description: 'Annual specific glacier mass balance in meters water equivalent' },
      { name: 'ablation_rate', unit: 'cm/day', description: 'Daily surface ice melt rate' },
      { name: 'discharge', unit: 'm³/s', description: 'Proglacial stream discharge volume' }
    ],
    sampleData: [
      { date: '2024-05-15', glacierMassBalance: -0.42, temperature: 4.8, windSpeed: 7.2 },
      { date: '2024-05-30', glacierMassBalance: -0.88, temperature: 7.1, windSpeed: 9.0 },
      { date: '2024-06-15', glacierMassBalance: -1.35, temperature: 9.4, windSpeed: 8.5 }
    ],
    fileList: [
      { filename: 'chandra_glacier_mass_balance_2020_2024.csv', size: '18.4 MB', format: 'CSV', updated: '2024-05-28' },
      { filename: 'glacier_boundaries.geojson', size: '5.7 MB', format: 'GeoJSON', updated: '2024-05-30' }
    ],
    relatedExpeditionIds: ['himalayan-cryosphere-survey-chandra-basin'],
    relatedStationIds: ['himansh-station', 'chhota-shigri-glacier-camp'],
    relatedKnowledgeIds: ['climate-change-himalayan-cryosphere'],
    relatedMediaIds: []
  },
  {
    id: 'POL-ANT-2024-005',
    title: 'Maitri Station Deep Ice Core Stable Isotope Analysis (δ18O & δD)',
    region: 'Antarctica',
    discipline: 'Glaciology & Cryosphere',
    station: 'Maitri Station',
    expedition: '43rd Indian Scientific Expedition to Antarctica',
    temporalCoverage: '2019 - 2024',
    startYear: 2019,
    endYear: 2024,
    spatialCoverage: 'Schirmacher Oasis to Inland Ice Sheet, Dronning Maud Land',
    coordinates: { lat: -70.7667, lng: 11.7333 },
    dataFormat: 'CSV',
    format: 'CSV',
    fileSize: '31.5 MB',
    provider: 'NCPOR Ice Core & Paleoclimate Laboratory',
    lastUpdated: '2024-01-10T00:00:00Z',
    shortDescription: 'High-resolution stable water isotope profile from shallow and intermediate ice cores reconstructing past climatic shifts and Indian monsoon links.',
    fullDescription: 'Isotopic ratios (Oxygen-18 and Deuterium) measured by cavity ring-down spectroscopy (CRDS) on firn and ice cores extracted near Maitri Station. Provides past atmospheric temperature records and teleconnections with the Indian Ocean Dipole.',
    tags: ['ice-core', 'isotopes', 'paleoclimate', 'maitri', 'antarctica'],
    parameters: ['δ18O', 'δD', 'Deuterium Excess', 'Electrical Conductivity'],
    downloadsCount: 375,
    doi: '10.1016/ncpor.ant.2024.005',
    citation: 'Laluraj, C. M., et al. (2024). Stable Isotopic Records from East Antarctic Ice Cores. NCPOR Research Papers.',
    variables: [
      { name: 'd18o', unit: '‰', description: 'Oxygen-18 isotope delta value relative to VSMOW' },
      { name: 'dd', unit: '‰', description: 'Deuterium delta value relative to VSMOW' },
      { name: 'd_excess', unit: '‰', description: 'Deuterium excess (d = δD - 8*δ18O)' }
    ],
    sampleData: [
      { depth: 5.2, temperature: -21.4, pressure: 994.0 },
      { depth: 15.8, temperature: -23.1, pressure: 992.5 },
      { depth: 30.0, temperature: -25.0, pressure: 990.0 }
    ],
    fileList: [
      { filename: 'maitri_core_isotopes_v2.csv', size: '22.0 MB', format: 'CSV', updated: '2024-01-05' },
      { filename: 'maitri_borehole_temperature.csv', size: '9.5 MB', format: 'CSV', updated: '2024-01-08' }
    ],
    relatedExpeditionIds: ['43rd-indian-scientific-expedition-to-antarctica'],
    relatedStationIds: ['maitri-station'],
    relatedKnowledgeIds: ['understanding-antarctic-sea-ice'],
    relatedMediaIds: []
  },
  {
    id: 'POL-ANT-2024-006',
    title: 'Prydz Bay Marine Ecosystem & Phytoplankton Bloom Transect',
    region: 'Antarctica',
    discipline: 'Polar Biology & Ecosystems',
    station: 'Prydz Bay Oceanographic Station',
    expedition: '43rd Indian Scientific Expedition to Antarctica',
    temporalCoverage: '2023 - 2024',
    startYear: 2023,
    endYear: 2024,
    spatialCoverage: 'Prydz Bay and coastal polynyas, East Antarctica',
    coordinates: { lat: -66.5, lng: 75.0 },
    dataFormat: 'CSV',
    format: 'CSV',
    fileSize: '14.8 MB',
    provider: 'NCPOR Marine Ecology Division',
    lastUpdated: '2024-02-15T00:00:00Z',
    shortDescription: 'Phytoplankton taxonomy, pigment analysis, and krill biomass density during peak austral summer bloom in coastal East Antarctica.',
    fullDescription: 'Biological oceanographic data investigating microbial biodiversity and primary productivity in sea-ice edge zones. Evaluates carbon export efficiency and ecological responses to changing fast-ice regimes.',
    tags: ['biology', 'phytoplankton', 'krill', 'prydz-bay', 'ecosystem'],
    parameters: ['Chlorophyll-a', 'Primary Production', 'Krill Abundance', 'Nutrient Nitrates'],
    downloadsCount: 198,
    doi: '10.1016/ncpor.ant.2024.006',
    citation: 'Mishra, R. K., et al. (2024). Summer Phytoplankton Dynamics in Prydz Bay Coastal Polynyas. NCPOR Marine Series.',
    variables: [
      { name: 'chla', unit: 'mg/m³', description: 'Active Chlorophyll-a fluorescence' },
      { name: 'nitrate', unit: 'µmol/L', description: 'Dissolved inorganic nitrate concentration' }
    ],
    sampleData: [
      { depth: 5, temperature: -0.8, salinity: 33.9 },
      { depth: 25, temperature: -1.2, salinity: 34.05 },
      { depth: 50, temperature: -1.5, salinity: 34.18 }
    ],
    fileList: [
      { filename: 'prydz_bay_phytoplankton_2024.csv', size: '14.8 MB', format: 'CSV', updated: '2024-02-12' }
    ],
    relatedExpeditionIds: ['43rd-indian-scientific-expedition-to-antarctica'],
    relatedStationIds: ['prydz-bay-oceanographic-station', 'bharati-station'],
    relatedKnowledgeIds: ['understanding-antarctic-sea-ice'],
    relatedMediaIds: []
  },
  {
    id: 'POL-ARC-2023-007',
    title: 'Kongsfjorden Fjord Hydrography & Marine Microbiology',
    region: 'Arctic',
    discipline: 'Oceanography',
    station: 'IndARC Mooring Observatory',
    expedition: 'Indian Arctic Scientific Expedition 2023',
    temporalCoverage: '2022 - 2023',
    startYear: 2022,
    endYear: 2023,
    spatialCoverage: 'Kongsfjorden Fjord, Spitsbergen, Svalbard',
    coordinates: { lat: 78.95, lng: 12.0167 },
    dataFormat: 'NetCDF',
    format: 'NETCDF',
    fileSize: '88.3 MB',
    provider: 'NCPOR Ocean Sciences Division',
    lastUpdated: '2023-12-01T00:00:00Z',
    shortDescription: 'Year-round underwater mooring data capturing Atlantic water intrusion into the Arctic and marine bacterioplankton seasonal shifts.',
    fullDescription: 'Continuous time-series from the IndARC subsurface mooring deployed at 192m water depth in Kongsfjorden. Tracks seasonal intrusion of warm Atlantic water into the inner fjord and its influence on Arctic marine ecosystem structure.',
    tags: ['indarc', 'arctic', 'mooring', 'kongsfjorden', 'atlantic-water'],
    parameters: ['Water Temperature', 'Current Velocity', 'Salinity', 'Dissolved Oxygen'],
    downloadsCount: 384,
    doi: '10.1016/ncpor.arc.2023.007',
    citation: 'Krishnan, K. P., et al. (2023). Multi-season Hydrography from the IndARC Mooring in Kongsfjorden. NCPOR Arctic Archive.',
    variables: [
      { name: 'current_speed', unit: 'cm/s', description: 'Acoustic Doppler current velocity' },
      { name: 'water_temp', unit: '°C', description: 'Subsurface water temperature' },
      { name: 'salinity', unit: 'PSU', description: 'Mooring sensor salinity' }
    ],
    sampleData: [
      { depth: 50, temperature: 2.4, salinity: 34.6 },
      { depth: 100, temperature: 1.8, salinity: 34.8 },
      { depth: 180, temperature: 1.2, salinity: 34.9 }
    ],
    fileList: [
      { filename: 'indarc_timeseries_2023.nc', size: '88.3 MB', format: 'NetCDF', updated: '2023-11-20' }
    ],
    relatedExpeditionIds: ['indian-arctic-winter-expedition-2024'],
    relatedStationIds: ['indarc-mooring', 'himadri-station'],
    relatedKnowledgeIds: ['black-carbon-arctic-amplification'],
    relatedMediaIds: []
  },
  {
    id: 'POL-HIM-2024-008',
    title: 'Siachen Glacier & Karakoram Ice Velocity Mapping via InSAR',
    region: 'Himalayas',
    discipline: 'Geology & Geophysics',
    station: 'Siachen Glacier Observatory',
    expedition: 'Himalayan Cryosphere Survey — Karakoram Range',
    temporalCoverage: '2021 - 2024',
    startYear: 2021,
    endYear: 2024,
    spatialCoverage: 'Siachen Glacier, Karakoram Range, Ladakh (35.42°N, 77.10°E)',
    coordinates: { lat: 35.42, lng: 77.1 },
    dataFormat: 'GeoJSON',
    format: 'GEOJSON',
    fileSize: '52.7 MB',
    provider: 'NCPOR Remote Sensing & Geophysics Group',
    lastUpdated: '2024-04-18T00:00:00Z',
    shortDescription: 'Satellite synthetic aperture radar (SAR) interferometry and offset tracking quantifying surface ice flow velocity across the 76km Siachen Glacier.',
    fullDescription: 'High-resolution surface velocity field and ice thickness estimates of Siachen Glacier. Investigates the Karakoram Anomaly through multi-temporal Sentinel-1 and ALOS-PALSAR radar interferometry validated with field benchmark dGPS surveys.',
    tags: ['siachen', 'glacier-velocity', 'insar', 'karakoram', 'geophysics'],
    parameters: ['Surface Ice Velocity', 'Flow Direction', 'Ice Thickness', 'Surface Elevation Change'],
    downloadsCount: 461,
    doi: '10.1016/ncpor.him.2024.008',
    citation: 'Bhardwaj, A., et al. (2024). Surface Velocity Dynamics of Siachen Glacier, Karakoram. NCPOR Geosciences Report.',
    variables: [
      { name: 'velocity', unit: 'm/year', description: 'Surface ice displacement rate' },
      { name: 'elevation_change', unit: 'm/year', description: 'Geodetic mass balance surface elevation trend' }
    ],
    sampleData: [
      { date: '2024-01-01', glacierMassBalance: -0.12, temperature: -18.5, windSpeed: 12.0 },
      { date: '2024-02-01', glacierMassBalance: -0.15, temperature: -20.2, windSpeed: 14.8 },
      { date: '2024-03-01', glacierMassBalance: -0.18, temperature: -15.0, windSpeed: 10.4 }
    ],
    fileList: [
      { filename: 'siachen_velocity_vectors.geojson', size: '36.4 MB', format: 'GeoJSON', updated: '2024-04-12' },
      { filename: 'siachen_transect_profiles.csv', size: '16.3 MB', format: 'CSV', updated: '2024-04-15' }
    ],
    relatedExpeditionIds: ['himalayan-cryosphere-survey-chandra-basin'],
    relatedStationIds: ['siachen-glacier-observatory', 'himansh-station'],
    relatedKnowledgeIds: ['climate-change-himalayan-cryosphere'],
    relatedMediaIds: []
  }
];

module.exports = {
  CATALOG_DATASETS
};

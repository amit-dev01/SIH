const express = require('express');
const router = express.Router();
const apiResponse = require('../../utils/apiResponse');
const stationsService = require('../stations/stations.service');
const { CATALOG_DATASETS } = require('../dataset/dataset.catalog');

router.get('/', (req, res) => {
  const activeStations = stationsService.getAllStationsFlat().filter((s) => s.status === 'Active').length;
  const stats = {
    totalDatasets: 1420,
    activeStations: activeStations || 5,
    completedExpeditions: 45,
    publishedPapers: 328,
    totalDownloads: 18450,
    countriesRepresented: 1,
    regionsCovered: 4,
    lastUpdated: new Date().toISOString()
  };
  return apiResponse.success(res, stats, 'Platform statistics retrieved');
});

module.exports = router;

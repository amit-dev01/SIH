const express = require('express');
const router = express.Router();
const supabase = require('../../config/supabase');
const asyncHandler = require('../../utils/asyncHandler');
const apiResponse = require('../../utils/apiResponse');

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { error } = await supabase.from('expeditions').select('id').limit(1);

    const healthData = {
      status: 'ok',
      database: error ? 'disconnected' : 'connected',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    };

    return apiResponse.success(res, healthData, 'Health check passed');
  })
);

module.exports = router;

const express = require('express');
const router = express.Router();
const supabase = require('../../config/supabase');
const asyncHandler = require('../../utils/asyncHandler');
const apiResponse = require('../../utils/apiResponse');

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check and database connectivity status
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is healthy and running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Health check passed
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: ok
 *                     database:
 *                       type: string
 *                       example: connected
 *                     uptime:
 *                       type: number
 *                       example: 45.2
 *                     timestamp:
 *                       type: string
 *                       example: 2026-08-31T10:00:00.000Z
 */
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

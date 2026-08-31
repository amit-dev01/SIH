const express = require('express');
const router = express.Router();
const ctrl = require('./vaani.controller');

/**
 * @swagger
 * tags:
 *   name: Polar Vaani
 *   description: Multilingual Indian Language Science Translation & Audio Dispatch Engine (SIH Innovation)
 */

/**
 * @swagger
 * /api/v1/vaani/languages:
 *   get:
 *     summary: List supported Indian languages for translation and audio synthesis
 *     tags: [Polar Vaani]
 *     responses:
 *       200:
 *         description: Dictionary of supported languages (Hindi, Tamil, Telugu, Bengali, Marathi, etc.)
 */
router.get('/languages', ctrl.getLanguages);

/**
 * @swagger
 * /api/v1/vaani/daily-bulletin:
 *   get:
 *     summary: Get today's 60-second audio science bulletin in any Indian language
 *     tags: [Polar Vaani]
 *     parameters:
 *       - in: query
 *         name: lang
 *         schema:
 *           type: string
 *           enum: [hi, ta, te, bn, mr, kn, gu, ml, en]
 *           default: hi
 *         description: Target regional language code
 *     responses:
 *       200:
 *         description: Audio dispatch with streaming audio URL, transcript, and station reports
 */
router.get('/daily-bulletin', ctrl.getDailyBulletin);

/**
 * @swagger
 * /api/v1/vaani/translate:
 *   post:
 *     summary: Translate polar science content into regional Indian languages via Groq AI
 *     tags: [Polar Vaani]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [text]
 *             properties:
 *               text:
 *                 type: string
 *                 example: Scientists at Bharati station drilled ice cores to reconstruct past climate variations.
 *               targetLang:
 *                 type: string
 *                 enum: [hi, ta, te, bn, mr, kn, gu, ml, en]
 *                 default: hi
 *     responses:
 *       200:
 *         description: Accurate translation in target Indian language script
 */
router.post('/translate', ctrl.translate);

/**
 * @swagger
 * /api/v1/vaani/synthesize:
 *   post:
 *     summary: Convert Indian language text into spoken audio MP3 stream
 *     tags: [Polar Vaani]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [text]
 *             properties:
 *               text:
 *                 type: string
 *                 example: राष्ट्रीय ध्रुवीय एवं महासागर अनुसंधान केंद्र में आपका स्वागत है।
 *               lang:
 *                 type: string
 *                 default: hi
 *               format:
 *                 type: string
 *                 enum: [url, base64]
 *                 default: url
 *     responses:
 *       200:
 *         description: Generated audio MP3 URL and base64 stream
 */
router.post('/synthesize', ctrl.synthesize);

/**
 * @swagger
 * /api/v1/vaani/podcast:
 *   post:
 *     summary: Generate an audio podcast episode on a custom polar topic in any Indian language
 *     tags: [Polar Vaani]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               topic:
 *                 type: string
 *                 example: Antarctic Ice Sheet dynamics and global sea level rise
 *               lang:
 *                 type: string
 *                 default: hi
 *               station:
 *                 type: string
 *                 enum: [BHARATI, MAITRI, HIMADRI, HIMANSH, GENERAL]
 *                 default: BHARATI
 *     responses:
 *       201:
 *         description: Audio podcast episode with script and audio stream
 */
router.post('/podcast', ctrl.generatePodcast);

module.exports = router;

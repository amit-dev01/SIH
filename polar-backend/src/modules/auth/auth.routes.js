const express = require('express');
const router = express.Router();
const ctrl = require('./auth.controller');

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Authenticate researcher credentials and return JWT token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, example: "researcher@ncpor.res.in" }
 *               password: { type: string, example: "password123" }
 *     responses:
 *       200:
 *         description: JWT bearer token and user profile
 */
router.post('/login', ctrl.login);

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new researcher account
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, example: "scientist@ncpor.res.in" }
 *               password: { type: string, example: "StrongP@ssw0rd" }
 *               name: { type: string, example: "Dr. Ananya Sen" }
 *     responses:
 *       201:
 *         description: Registered user record
 */
router.post('/register', ctrl.register);

module.exports = router;

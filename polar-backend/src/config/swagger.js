const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Polar Science Outreach Portal API',
      version: '1.0.0',
      description:
        'API for NCPOR Integrated Polar Science Outreach, Knowledge Repository and Media Dissemination Portal (SIH26063)',
      contact: {
        name: 'NCPOR',
        url: 'https://ncpor.gov.in'
      }
    },
    servers: [
      { url: 'https://polar-outreach.onrender.com/api/v1', description: 'Production API (Render)' },
      { url: '/api/v1', description: 'Relative API Path' },
      { url: 'http://localhost:3000/api/v1', description: 'Local Development Server' }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Supabase Auth access token'
        }
      }
    },
    tags: [
      { name: 'Health', description: 'Server health and database connectivity' },
      { name: 'Expeditions', description: 'Polar and Himalayan scientific expeditions' },
      { name: 'Media', description: 'Photos, videos, audio, and documents' },
      { name: 'Publications', description: 'Research papers and scientific publications' },
      { name: 'Datasets', description: 'Scientific datasets and download tracking' },
      { name: 'Search', description: 'Unified full-text search and autocomplete' },
      { name: 'Map', description: 'Interactive polar station and geo-tagged media pins' },
      { name: 'Outreach', description: 'AI-assisted multi-platform science communication' },
      { name: 'Analytics', description: 'Dashboard analytics, timeline, and audit logs' }
    ]
  },
  apis: ['./src/modules/**/*.routes.js']
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = swaggerSpec;

// src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const openapi = require('../docs/openapi.json');

// load env
const env = require('./config/env');

const marketRoutes = require('./routes/market.routes');
const statsRoutes = require('./routes/stats.routes');
const authRoutes = require('./routes/auth.routes');

const app = express();

// security headers
app.use(helmet());

// configurable CORS
const corsOptions = env.ALLOWED_ORIGINS === '*' ? {} : { origin: env.ALLOWED_ORIGINS.split(',') };
app.use(cors(corsOptions));
app.use(express.json());

// basic metrics counters (in-memory)
const metrics = { requests: 0, marketCalls: 0 };
app.use((req, res, next) => { metrics.requests += 1; next(); });

// mount routes
app.use('/', marketRoutes);
app.use('/api/stats', statsRoutes);
app.use('/auth', authRoutes);

// health and metrics endpoints
// Removed admin and health/metrics endpoints per simplification

// Swagger UI
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapi));

module.exports = { app, PORT: env.PORT };

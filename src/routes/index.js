// src/routes/index.js

const express = require('express');
const { hostname } = require('os');

// version and author from package.json
const { version, author } = require('../../package.json');

// Our authentication middleware
const { authenticate } = require('../authorization');

// importing heath check route from response.js
const { createSuccessResponse } = require('../response.js');

// Create a router that we can use to mount our API
const router = express.Router();

/**
 * Expose all of our API routes on /v1/* to include an API version.
 * Protect them all so you have to be authenticated in order to access.
 */
router.use(`/v1`, authenticate(), require('./api'));
//router.use(`/v1`, require('./api'));

/**
 * Define a simple health check route. If the server is running
 * we'll respond with a 200 OK.  If not, the server isn't healthy.
 */
router.get('/', (req, res) => {
  const data = {
    message: 'Server worked well',
    author,
    githubUrl: 'https://github.com/fev1n/fragments',
    version,
    // Include the hostname in the response
    hostname: hostname(),
  };
  res.setHeader('Cache-Control', 'no-cache');
  res.json(createSuccessResponse(data));
});

module.exports = router;

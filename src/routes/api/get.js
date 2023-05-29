// src/routes/api/get.js

const { createSuccessResponse, createErrorResponse } = require('../../response');
/**
 * Get a list of fragments for the current user
 */
module.exports = async (req, res) => {
  try {
    res.status(200).json(
      createSuccessResponse({
        fragments: [],
      })
    );
  } catch (error) {
    res.status(404).json(createErrorResponse(404, error));
  }
};

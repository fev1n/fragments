// src/routes/api/delete.js

const { createSuccessResponse, createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');
/**
 * Deletes fragments for the current user
 */

module.exports = async (req, res) => {
  try {
    await Fragment.delete(req.user, req.params.id);
    logger.debug('Deleted the fragment with ID: ' + req.params.id);
    res
      .status(200)
      .json(createSuccessResponse(200, 'Deleted the fragment with ID: ' + req.params.id));
  } catch (error) {
    res.status(404).json(createErrorResponse(404, error));
  }
};

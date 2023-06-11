const { createSuccessResponse, createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');
/**
 * Get fragments data for id provided in the current user
 */
module.exports = async (req, res) => {
  try {
    const fragment = await Fragment.byId(req.user, req.params.id);
    logger.debug('ID:  ' + req.params.id);
    res.status(200).json(createSuccessResponse({ fragmentData: fragment }));
  } catch (error) {
    res.status(404).json(createErrorResponse(404, error));
  }
};

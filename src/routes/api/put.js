// src/routes/api/delete.js

const { createSuccessResponse, createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');
/**
 * Updates fragment's data for the current user
 */

module.exports = async (req, res) => {
  const scheme = req.protocol;
  const hostname = req.get('host');
  const path = req.originalUrl;
  const apiURL = `${scheme}://${hostname}${path}`;
  try {
    const fragment = await Fragment.byId(req.user, req.params.id);
    logger.debug('ID:  ' + req.params.id);
    if (req.get('Content-Type') != fragment.type) {
      res.status(400).send(createErrorResponse(400, 'Invalid Request'));
    } else {
      await fragment.setData(req.body);
      res.location(`${apiURL}/${fragment.id}`);
      res.status(200).json(createSuccessResponse({ fragment }));
      logger.info({ fragment: fragment }, `Successfully updated fragment's data`);
    }
  } catch (error) {
    res.status(404).json(createErrorResponse(404, error));
  }
};

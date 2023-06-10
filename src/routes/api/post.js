const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');

module.exports = async (req, res) => {
  const apiURL = process.env.API_URL || req.headers.host;

  if (!Buffer.isBuffer(req.body) || !Fragment.isSupportedType(req.get('Content-Type'))) {
    return res.status(415).json(createErrorResponse(415, 'Unsupported Media Type'));
  }

  try {
    logger.info('New fragment with data: ' + req.body);
    const type = req.headers['content-type'];
    const fragment = new Fragment({ ownerId: req.user, type, size: Buffer.byteLength(req.body) });

    logger.info('Saving the fetched data');
    await fragment.setData(req.body);
    await fragment.save();

    logger.debug('Setting successful response');

    res
      .location(`${apiURL}/v1/fragments/${fragment.id}`)
      .status(201)
      .json(createSuccessResponse({ fragment }));
  } catch (error) {
    res.status(404).json(createErrorResponse(404, error));
  }
};

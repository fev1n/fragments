const { createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');
const path = require('path');

module.exports = async (req, res) => {
  const query = path.parse(req.params.id);
  let ext = query.ext.split('.').pop();
  try {
    var fragment = await Fragment.byId(req.user, query.name);
    let data = await fragment.getData();
    ext = fragment.extConvert(ext);

    if (query.ext == '' || fragment.type.endsWith(ext)) {
      res.setHeader('Content-Type', fragment.type);
      res.status(200).send(Buffer.from(data));
      logger.debug(data, fragment.type);
    } else {
      try {
        if (fragment.isText || fragment.type == 'application/json') {
          var result = await fragment.textConvert(ext);
          res.setHeader('Content-Type', `text/${ext}`);
          res.status(200).send(Buffer.from(result));
          logger.debug(ext, result);
        }
      } catch (err) {
        res.status(415).json(createErrorResponse(415, `Unsupported type conversion`));
      }
    }
  } catch (error) {
    res.status(404).json(createErrorResponse(404, error));
  }
};

'use strict';

module.exports = function createDefaultErrorHandler({ logger }) {
  return (ex, req, res, next) => {
    logger.error(ex);
    if (res.headersSent) next(ex);
    else res.sendStatus(500);
  };
};

const winston = require('winston');
require('winston-daily-rotate-file');

const logger = winston.createLogger({
  level: 'info',
  exitOnError: false,
  transports: [
    new (winston.transports.Console)({
      timestamp: function() {
          return new Date().toUTCString();
      },
      formatter: function(options) {
        // Return string will be passed to logger.
        return options.timestamp() +' '+ options.level.toUpperCase() +' '+ (options.message ? options.message : '') +
          (options.meta && Object.keys(options.meta).length ? '\n\t'+ JSON.stringify(options.meta) : '' );
      },
    }),
    new (winston.transports.DailyRotateFile)({
      filename: '/liveperson/data/cb/logs/'+process.env.APP_NAME.replace(/::/g,'_')+'-%DATE%',
      extension: '.json',
      datePattern: 'YYYY-MM-DD',
      timestamp: function() {
        return new Date().toUTCString();
      },
      maxSize: '20m',
      maxFiles: '15d'
    })
  ]
});
module.exports = logger;
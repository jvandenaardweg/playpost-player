import pino from 'pino';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const IS_TEST = process.env.NODE_ENV === 'test';
const IS_JEST = process.env.JEST_WORKER_ID;

export const logger = pino({
  enabled: !IS_JEST,
  base: null,
  ...(IS_PRODUCTION || IS_TEST ? { timestamp: false } : {}),
  prettyPrint: {
    colorize: IS_PRODUCTION || IS_TEST ? false : true,
    levelFirst: true,
    errorLikeObjectKeys: ['err', 'error'],
    translateTime: IS_PRODUCTION || IS_TEST ? false : true,
    ignore: IS_PRODUCTION || IS_TEST ? 'time' : undefined
  }
});

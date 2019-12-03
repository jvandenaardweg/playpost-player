import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express'
import path from 'path';
import ejs from 'ejs';
import NodeCache from 'node-cache';
import nodeFetch from 'node-fetch';
import serveStatic from 'serve-static';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import ExpressRateLimit from 'express-rate-limit';
import isUUID from 'is-uuid';
import geoipLite from 'geoip-lite';
import crypto from 'crypto';
import md5 from 'md5';

import { logger } from './utils/logger';

import { version } from '../../package.json'

import { getRealUserIpAddress } from './utils/ip-address';
import * as api from './api';

logger.info('Server Init: Version: ', version)

const app = express();

const PLAYER_BASE_URL = process.env.PLAYER_BASE_URL || 'https://player.playpost.app';
const CACHE_TTL = 60 * 60 * 24;

const cache = new NodeCache( { stdTTL: 60, checkperiod: 60, deleteOnExpire: true } );

app.use(cookieParser())

// Set the anonymousId cookie to track unique users anonymously
// To identify individual users behind a shared ip address
// Save the cookie for 30 days
// Important: use this app.use BEFORE our rate limiter, so our rate limiter can use the same cookie value
app.use('*', (req: Request, res: Response, next: NextFunction) => {
  const currentAnonymousIdCookie = req.cookies.anonymousId;

  // If there is no cookie yet, create one
  if (!currentAnonymousIdCookie) {
    const expiresInDays = 30;
    const currentDate = new Date();
    const expires = new Date(currentDate.setTime(currentDate.getTime() + (expiresInDays * 24 * 60 * 60 * 1000)))
    const valueToHash = crypto.randomBytes(32).toString('hex'); // Generate some random value
    const hash = md5(valueToHash); // md5 it so we can identify it as an md5 value, not just some random value

    const cookieConfig = {
      expires,
      secure: process.env.NODE_ENV === 'production', // Only use secure in production, as we have https there
      httpOnly: true
    }

    // Send the cookie to our user
    res.cookie('anonymousId' , hash, cookieConfig)
  }

  // Continue with the request
  next();
});

const rateLimited = (maxRequestsPerMinute?: number) => new ExpressRateLimit({
  // We'll use the in-memory cache, not Redis
  windowMs: 1 * 60 * 1000, // 1 minute
  max: maxRequestsPerMinute ? maxRequestsPerMinute : 20, // 20 requests allowed per minute, so at most: 1 per every 3 seconds, seems to be enough
  keyGenerator: (req: Request) => req.cookies.anonymousId,
  handler: function (req: Request, res: Response, next: NextFunction) {
    const rateLimitedKey = this.keyGenerator && this.keyGenerator(req, res);
    const loggerPrefix = req.path + ' -';

    // @ts-ignore
    const tryAfterDate = req.rateLimit.resetTime

    logger.warn(loggerPrefix, 'Rated limited: ', `anonymousId: ${rateLimitedKey}`, `- IP address: ${getRealUserIpAddress(req)}`);
    return res.status(429).send(`Ho, ho. Slow down! It seems like you are doing too many requests. Please cooldown and try again after: ${tryAfterDate}`);
  }
});

app.use(helmet({
  frameguard: false // We need iframe support enabled for the embed
}))

app.use(express.json())


app.set('etag', false)

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './'))

app.use('/static', serveStatic(path.join(__dirname, '../../../build-frontend/static'), {
  cacheControl: true,
  maxAge: 31536000,
}));

app.use('/favicon.ico', serveStatic(path.join(__dirname, '../../../build-frontend/favicon.ico'), {
  cacheControl: true,
  maxAge: 31536000,
}));

app.use('/oembed.png', serveStatic(path.join(__dirname, '../../../build-frontend/oembed.png'), {
  cacheControl: true,
  maxAge: 31536000,
}));

app.get('/ping', rateLimited(20), (req: Request, res: Response) => {
  return res.send('pong');
});

/**
 * Method to track some anonymous analytics.
 *
 * We'll rate limit this tracking to 60 per minute, per "anonymous" user, that's 1 per second, seems to be enough and prevent flooding.
 */
app.post('/v1/track', rateLimited(60), (req: Request, res: Response) => {
  const loggerPrefix = req.path + ' -';

  try {
    const { articleId, audiofileId, event, device, sessionId } = req.body;
    const allowedEvents = ['view', 'play:begin', 'play:end', 'play:1', 'play:5', 'play:25', 'play:50', 'play:75', 'play:95', 'play:99', 'play:100', 'playlist:add', 'pause'];
    const allowedDevices = ['mobile', 'desktop', 'tablet', 'wearable', 'smarttv', 'console'];

    if (!isUUID.v4(articleId)) {
      const errorMessage = 'articleId is not a valid UUID.';

      logger.error(loggerPrefix, errorMessage, req.body);

      return res.status(400).json({
        message: errorMessage
      });
    }

    if (!isUUID.v4(audiofileId)) {
      const errorMessage = 'audiofileId is not a valid UUID.';

      logger.error(loggerPrefix, errorMessage, req.body);

      return res.status(400).json({
        message: errorMessage
      });
    }

    if (!allowedEvents.includes(event)) {
      const errorMessage = `event is not valid. Please one of: ${allowedEvents.join(', ')}`;

      logger.error(loggerPrefix, errorMessage, req.body);

      return res.status(400).json({
        message: errorMessage
      });
    }

    if (!allowedDevices.includes(device)) {
      const errorMessage = `device is not valid. Please one of: ${allowedDevices.join(', ')}`;

      logger.error(loggerPrefix, errorMessage, req.body);

      return res.status(400).json({
        message: errorMessage
      });
    }

    if (!allowedDevices.includes(device)) {
      const errorMessage = `device is not valid. Please one of: ${allowedDevices.join(', ')}`;

      logger.error(loggerPrefix, errorMessage, req.body);

      return res.status(400).json({
        message: errorMessage
      });
    }

    // "sessionId" should be an md5 string
    if (!sessionId || !sessionId.match(/^[a-f0-9]{32}$/)) {
      const errorMessage = `sessionId is invalid`;

      logger.error(loggerPrefix, errorMessage, req.body);

      return res.status(400).json({
        message: errorMessage
      });
    }

    // All ok, proceed
    const ipAddress = getRealUserIpAddress(req);
    const geo = geoipLite.lookup(ipAddress);
    const countryCode = geo ? geo.country : null; // US, NL, UK
    const regionCode = geo ? geo.region : null; // TX, NH
    const city = geo ? geo.city : null;
    const anonymousUserId = req.cookies.anonymousId;
    const value = 1; // keep value here, so it's not "hackable"
    const timestamp = new Date().getTime();

    const eventData = {
      articleId,
      audiofileId,
      event,
      countryCode,
      regionCode,
      city,
      anonymousUserId,
      value,
      timestamp,
      device,
      sessionId
    }

    logger.info(loggerPrefix, 'Track this: ', eventData);

    // TODO: store in pubsub so we can build a queue not losing any data when our processor/api is down

    return res.json({
      message: 'OK'
    })
  } catch (err) {
    logger.error(loggerPrefix, err.message, req.body);

    return res.status(500).json({
      message: err.message
    })
  }

})

// Use versioning (/v1, /v2) to allow developing of new players easily and keep the older ones intact
app.get('/v1/articles/:articleId/audiofiles/:dirtyAudiofileId', rateLimited(20), async (req: Request, res: Response) => {
  const { deleteCache } = req.query;
  const { articleId, dirtyAudiofileId } = req.params;
  const loggerPrefix = req.path + ' -';

  // embed.ly returns some crappy url containing "&format=json", we remove that part here
  const audiofileId = dirtyAudiofileId.split('&')[0];

  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');

  logger.info(loggerPrefix, 'Request query: ', req.query)
  logger.info(loggerPrefix, 'Request referer: ', req.headers.referer)

  if (!isUUID.v4(articleId)) {
    const errorMessage = `Please given a valid article ID. ${articleId} is not a valid article ID.`

    logger.error(loggerPrefix, errorMessage)

    const errorPageRendered = await ejs.renderFile(path.join(__dirname, 'pages/error.ejs'), {
      title: 'Oops!',
      description: errorMessage
    })

    return res.status(400).send(errorPageRendered);
  }

  if (!isUUID.v4(audiofileId)) {
    const errorMessage = `Please given a valid audiofile ID for the article. ${audiofileId} is not a valid audiofile ID.`

    logger.error(loggerPrefix, errorMessage)

    const errorPageRendered = await ejs.renderFile(path.join(__dirname, 'pages/error.ejs'), {
      title: 'Oops!',
      description: errorMessage
    })

    return res.status(400).send(errorPageRendered);
  }

  try {
    const cacheKey = `v1/articles/${articleId}/audiofiles/${audiofileId}`;

    if (deleteCache) {
      logger.info(loggerPrefix, `Removing cache.`)
      cache.del(cacheKey)
    }

    const cachedPage = cache.get(cacheKey)

    // If we have a cached version, return that
    if (cachedPage) {
      logger.info(loggerPrefix, `Returning cached version.`)
      return res.send(cachedPage)
    }

    // Get the requester his ip address, so we can re-use that for our API rate limiting
    const requesterIpAddress = getRealUserIpAddress(req);

    const { article, audiofile } = await api.cachedFindArticleById(articleId, audiofileId, requesterIpAddress);

    // Render the embed page with the article API data inside, so React can use that data to render the player
    const embedPageRendered = await ejs.renderFile(path.join(__dirname, '../../../build-frontend/index.ejs'), {
      title: article.title,
      description: article.description,
      imageUrl: article.imageUrl,
      article: JSON.stringify(article),
      audiofile: JSON.stringify(audiofile),
      embedUrl: `${PLAYER_BASE_URL}${req.path}`
    })

    cache.set(cacheKey, embedPageRendered, CACHE_TTL); // Cache for one day

    logger.info(loggerPrefix, `Returning rendered embed page.`)

    // Send the HTML page to the user
    return res.send(embedPageRendered)
  } catch (err) {
    const isApiUnavailable = err && err.code === 'ECONNREFUSED'
    const errorMessage = err && err.message

    logger.error(loggerPrefix, err)

    const title = isApiUnavailable ? 'Playpost API not available.' : 'Oops!'
    const description = errorMessage ? errorMessage : isApiUnavailable ? 'Could not connect to the Playpost API to get the article data.' : 'An unknown error happened. Please reload the page.'

    // TODO: make sure error.ejs is in build-server
    const errorPageRendered = await ejs.renderFile(path.join(__dirname, 'pages/error.ejs'), {
      title,
      description
    })

    if (isApiUnavailable) {
      return res.status(503).send(errorPageRendered);
    }

    return res.status(500).send(errorPageRendered);
  }

});

app.all('/health', rateLimited(20), async (req: Request, res: Response) => {
  let apiStatus = 'fail';
  let apiMessage = '';

  const responseOk = await nodeFetch(`https://api.playpost.app/health`, { method: 'head' }).then((response) => response.ok);

  if (responseOk) {
    apiStatus = 'ok';
  } else {
    apiStatus = 'Reponse not OK';
  }

  return res.json({
    status: 'ok',
    version,
    services: {
      api: apiStatus
    },
    messages: {
      api: apiMessage
    }
  });
})

app.all('*', rateLimited(20), (req: Request, res: Response) => {
  return res.status(404).send('Not found.');
})

const port = process.env.PORT || 8080;

logger.info('Server init on port:', port);

app.listen(port);

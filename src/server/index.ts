import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express'
import path from 'path';
import ejs from 'ejs';
import NodeCache from 'node-cache';
import nodeFetch from 'node-fetch';
import serveStatic from 'serve-static';
import helmet from 'helmet';
import ExpressRateLimit from 'express-rate-limit';
import md5 from 'md5';

import { version } from '../../package.json'

import { getRealUserIpAddress } from './utils/ip-address';
import * as api from './api';

console.log('Server Init: Version: ', version)

const app = express();

const PLAYER_BASE_URL = process.env.PLAYER_BASE_URL || 'https://player.playpost.app';
const CACHE_TTL = 60 * 60 * 24;

const cache = new NodeCache( { stdTTL: 60, checkperiod: 60, deleteOnExpire: true } );

const rateLimited = new ExpressRateLimit({
  // We'll use the in-memory cache, not Redis
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // 15 requests allowed per minute, so at most: 1 per every 3 seconds, seems to be enough
  keyGenerator: (req: Request) => {
    const ipAddressOfUser = getRealUserIpAddress(req);
    const userAgent = req.get('User-Agent');
    const userAcceptLanguage = req.get('Accept-Language');
    const userAccept = req.get('Accept');
    const userReferer = req.get('Referer');

    // Create a unique key based on the user browser data
    // This is not perfect, but this might be the closest we get to a unique user
    const uniqueKey = md5(ipAddressOfUser + userAgent + userAcceptLanguage + userAccept + userReferer);

    return uniqueKey;
  },
  handler: (req: Request, res: Response, next: NextFunction) => {
    return res.status(429).send('Ho, ho. Slow down! It seems like you are doing too many requests. Please cooldown and try again later.');
  }
});

app.use(helmet({
  frameguard: false // We need iframe support enabled for the embed
}))

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

app.get('/ping', rateLimited, (req: Request, res: Response) => {
  return res.send('pong');
});

app.get('/articles/:articleId/audiofiles/:audiofileId', rateLimited, async (req: Request, res: Response) => {
  const { deleteCache } = req.query;
  const { articleId, audiofileId } = req.params;

  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');

  console.log('Request query: ', req.query)
  console.log('Request params: ', req.params)

  if (!articleId) {
    const errorPageRendered = await ejs.renderFile(path.join(__dirname, 'pages/error.ejs'), {
      title: 'Oops!',
      description: 'Please given an article ID.'
    })

    return res.status(400).send(errorPageRendered);
  }

  if (!audiofileId) {
    const errorPageRendered = await ejs.renderFile(path.join(__dirname, 'pages/error.ejs'), {
      title: 'Oops!',
      description: 'Please given an audiofile ID for the article.'
    })

    return res.status(400).send(errorPageRendered);
  }

  try {
    const cacheKey = `articles/${articleId}/audiofiles/${audiofileId}`;

    if (deleteCache) {
      console.log(articleId, `Removing cache.`)
      cache.del(cacheKey)
    }

    const cachedPage = cache.get(cacheKey)

    // If we have a cached version, return that
    if (cachedPage) {
      console.log(articleId, `Returning cached version.`)
      return res.send(cachedPage)
    }

    const { article, audiofile } = await api.findArticleById(articleId, audiofileId);

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

    console.log(articleId, `Returning rendered embed page.`)

    // Send the HTML page to the user
    return res.send(embedPageRendered)
  } catch (err) {
    const isApiUnavailable = err && err.code === 'ECONNREFUSED'
    const errorMessage = err && err.message

    console.log(articleId, err)

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

app.all('/health', rateLimited, async (req: Request, res: Response) => {
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

app.all('*', rateLimited, (req: Request, res: Response) => {
  return res.status(404).send('Not found.');
})

const port = process.env.PORT || 8080;

console.log('Server init on port:', port);

app.listen(port);

import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express'
import path from 'path';
import ejs from 'ejs';
import nodeFetch from 'node-fetch';
import NodeCache from 'node-cache';
import serveStatic from 'serve-static';
import helmet from 'helmet';
import ExpressRateLimit from 'express-rate-limit';

import { Api } from '../@types/playpost-api';
import { version } from '../../package.json'

import { getRealUserIpAddress } from './utils/ip-address';

console.log('Server Init: Version: ', version)

const app = express();

const cache = new NodeCache( { stdTTL: 60, checkperiod: 60, deleteOnExpire: true } );

const rateLimiter = new ExpressRateLimit({
  // We'll use the in-memory cache, not Redis
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 requests allowed per minute, so at most: 1 per every 2 seconds
  keyGenerator: (req: Request) => {
    const ipAddressOfUser = getRealUserIpAddress(req);
    return ipAddressOfUser;
  },
  handler: (req: Request, res: Response, next: NextFunction) => {
    return res.status(429).send('Ho, ho. Slow down! It seems like you are doing too many requests. Please cooldown and try again later.');
  }
});

// Set custom ejs delimiter
// Use: <$- article $>
ejs.delimiter = '$';

app.use(helmet({
  frameguard: false // We need iframe support enabled for the embed
}))

app.use(rateLimiter)

app.set('etag', false)

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './'))

app.use('/static', serveStatic(path.join(__dirname, '../../../build-frontend/static'), {
  cacheControl: true,
  maxAge: 31536000,
}));

app.get('/ping', (req: Request, res: Response) => {
  return res.send('pong');
});

app.get('/oembed', async (req: Request, res: Response) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  // More info: https://oembed.com/

  const { url, format } = req.query;

  if (format && format !== 'json') {
    return res.status(400).json({
      message: 'We currently only support the json format. Please only use ?format=json'
    })
  }

  if (!url) {
    return res.status(400).json({
      message: 'Please specify a url.'
    })
  }

  try {
    const cacheKey = `articles/${url}`;

    const cachedPage = cache.get(cacheKey)

    // If we have a cached version, return that
    if (cachedPage) {
      console.log(url, `Returning cached version.`)
      return res.send(cachedPage)
    }

    console.log(url, `Getting article from API...`)

    const response = await nodeFetch(`${process.env.API_URL}/v1/articles?url=${url}`, {
      method: 'get',
      headers: {
        'X-Api-Key': process.env.API_KEY || '',
        'X-Api-Secret': process.env.API_SECRET || ''
      }
    })

    if (!response.ok) {
      const json = await response.json()
      throw new Error(json.message ? json.message : 'Did not got ok from api')
    }

    const article: Api.Article = await response.json()

    // TODO: how do we determine which audiofile to return?
    const audiofile = article.audiofiles[0]

    if (!audiofile) {
      return res.status(404).json({
        message: 'Article has no audio yet.'
      })
    }

    // TODO: Use article URL to get

    const responseToSend = {
      version: '1.0',
      type: 'rich',
      provider_name: 'Playpost',
      provider_url: 'https://playpost.app',
      width: 480,
      height: 155, // Height in frontend/Player/index.scss
      title: article.title,
      author_name: article.sourceName,
      author_url: article.canonicalUrl || article.url,
      html: `<iframe src="https://embed.playpost.app/articles/${article.id}/${audiofile.id}" width="100%" height="155" frameborder="0" scrolling="no"></iframe>`
    }

    cache.set(cacheKey, responseToSend, 60);

    console.log(url, `Returning oembed data.`)

    return res.json(responseToSend);
  } catch (err) {
    console.log(err)
    return res.status(500).json({
      message: 'An uknown error happened.'
    })
  }


  // {
  //   "version": "1.0",
  //   "type": "video",
  //   "provider_name": "YouTube",
  //   "provider_url": "http://youtube.com/",
  //   "width": 425,
  //   "height": 344,
  //   "title": "Amazing Nintendo Facts",
  //   "author_name": "ZackScott",
  //   "author_url": "http://www.youtube.com/user/ZackScott",
  //   "html":
  //     "<object width=\"425\" height=\"344\">
  //       <param name=\"movie\" value=\"http://www.youtube.com/v/M3r2XDceM6A&fs=1\"></param>
  //       <param name=\"allowFullScreen\" value=\"true\"></param>
  //       <param name=\"allowscriptaccess\" value=\"always\"></param>
  //       <embed src=\"http://www.youtube.com/v/M3r2XDceM6A&fs=1\"
  //         type=\"application/x-shockwave-flash\" width=\"425\" height=\"344\"
  //         allowscriptaccess=\"always\" allowfullscreen=\"true\"></embed>
  //     </object>",
  // }
})

app.get('/articles/:articleId/audiofiles/:audiofileId', async (req: Request, res: Response) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');

  const { articleId, audiofileId } = req.params;

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
    const cachedPage = cache.get(cacheKey)

    // If we have a cached version, return that
    if (cachedPage) {
      console.log(articleId, `Returning cached version.`)
      return res.send(cachedPage)
    }

    console.log(articleId, `Getting article from API...`)

    const response = await nodeFetch(`${process.env.API_URL}/v1/articles/${articleId}`, {
      method: 'get',
      headers: {
        'X-Api-Key': process.env.API_KEY || '',
        'X-Api-Secret': process.env.API_SECRET || ''
      }
    })

    if (!response.ok) {
      const json = await response.json()
      throw new Error(json.message ? json.message : 'Did not got ok from api')
    }

    const article: Api.Article = await response.json()

    // Find the audiofile using the audiofileId from the url param
    const audiofile = article.audiofiles.find(audiofile => audiofile.id === audiofileId);

    if (!audiofile) {
      // TODO: make sure error.ejs is in build-server
      const errorPageRendered = await ejs.renderFile(path.join(__dirname, 'pages/error.ejs'), {
        title: 'Oops!',
        description: 'Could not find the audiofile in the article data.'
      })
      return res.status(404).send(errorPageRendered);
    }

    // Render the embed page with the article API data inside, so React can use that data to render the player
    const embedPageRendered = await ejs.renderFile(path.join(__dirname, '../../../build-frontend/index.ejs'), {
      title: article.title,
      article: JSON.stringify(article),
      audiofile: JSON.stringify(audiofile),
    })

    cache.set(cacheKey, embedPageRendered, 60); // Cache page for 60 seconds

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

// Catch-all
// app.all('/index.html', (req: Request, res: Response) => {
//   return res.status(404).send('Not found.');
// })

app.all('*', (req: Request, res: Response) => {
  return res.status(404).send('Not found.');
})

const port = process.env.PORT || 8080;

console.log('Server init on port:', port);

app.listen(port);
